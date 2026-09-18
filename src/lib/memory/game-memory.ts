import { canonicalCharacters, validateQuestion, type DeductionQuestion } from "../game/engine.ts";
import type { PlayerProfile } from "./players.ts";

export const GAME_MEMORY_PREFIX = "[WHOAMAI_GAME_MEMORY]";
export const CONNECTIVITY_TEST_PREFIX = "[WHOAMAI_CONNECTIVITY_TEST]";
export const MEMORY_TYPES = ["GAME_RESULT", "STRATEGY", "CHARACTER_HISTORY", "MILESTONE", "PREFERENCE"] as const;
export type MemoryType = (typeof MEMORY_TYPES)[number];
export type CompletedGameEvidence = { gameId: string; outcome: "won" | "lost"; secretCharacterId: string; questionCount: number; questions: Array<{ question: DeductionQuestion; answer: boolean; eliminatedCount: number }>; completedAt: string };
export type CompletedGameSubmission = Omit<CompletedGameEvidence, "completedAt">;
export type MemoryCandidate = { type: MemoryType; text: string; evidence: CompletedGameEvidence; provenance: { gameIds: string[]; questionFields: string[] } };
export type RejectedCandidate = { type: MemoryType | "EVIDENCE" | "QWEN"; reason: string };
export type PersistedGameMemory = { version: 1; type: MemoryType; text: string; gameId: string; evidence: CompletedGameEvidence; provenance: { gameIds: string[]; questionFields: string[] } };

function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function validCharacterId(value: unknown): value is string { return typeof value === "string" && canonicalCharacters.some((character) => character.id === value); }

export function validateCompletedGameEvidence(value: unknown, completedAt = new Date().toISOString()): { ok: true; value: CompletedGameEvidence } | { ok: false; error: string } {
  if (!record(value) || typeof value.gameId !== "string" || !/^[a-zA-Z0-9_-]{1,200}$/.test(value.gameId)) return { ok: false, error: "Game ID is invalid." };
  if (value.outcome !== "won" && value.outcome !== "lost") return { ok: false, error: "Completed game outcome is invalid." };
  if (!validCharacterId(value.secretCharacterId)) return { ok: false, error: "Secret character ID is invalid." };
  const questionCount = value.questionCount;
  if (typeof questionCount !== "number" || !Number.isInteger(questionCount) || questionCount < 1 || questionCount > 100) return { ok: false, error: "Question count is invalid." };
  if (!Array.isArray(value.questions) || value.questions.length > 100 || value.questions.length > questionCount) return { ok: false, error: "Question history is invalid." };
  const questions: CompletedGameEvidence["questions"] = [];
  for (const entry of value.questions) {
    if (!record(entry) || typeof entry.answer !== "boolean" || typeof entry.eliminatedCount !== "number" || !Number.isInteger(entry.eliminatedCount) || entry.eliminatedCount < 0 || entry.eliminatedCount > 31) return { ok: false, error: "Question history entry is invalid." };
    const question = validateQuestion(entry.question);
    if (!question.ok) return { ok: false, error: "Question history contains an invalid question." };
    questions.push({ question: question.value, answer: entry.answer, eliminatedCount: entry.eliminatedCount });
  }
  return { ok: true, value: { gameId: value.gameId, outcome: value.outcome, secretCharacterId: value.secretCharacterId, questionCount, questions, completedAt } };
}

export function deterministicGameCandidates(player: PlayerProfile, evidence: CompletedGameEvidence): { candidates: MemoryCandidate[]; rejected: RejectedCandidate[] } {
  if (evidence.outcome !== "won") return { candidates: [], rejected: [{ type: "GAME_RESULT", reason: "Only completed wins are retained as game-result memories in Phase 3C." }] };
  const secret = canonicalCharacters.find((character) => character.id === evidence.secretCharacterId);
  if (!secret) return { candidates: [], rejected: [{ type: "EVIDENCE", reason: "Secret character was not canonical." }] };
  return { candidates: [{ type: "GAME_RESULT", text: `${player.displayName} won against ${secret.name} in ${evidence.questionCount} actions.`, evidence, provenance: { gameIds: [evidence.gameId], questionFields: evidence.questions.map((entry) => entry.question.field) } }], rejected: [] };
}

export function serializeGameMemory(candidate: MemoryCandidate): string {
  const payload: PersistedGameMemory = { version: 1, type: candidate.type, text: candidate.text, gameId: candidate.evidence.gameId, evidence: candidate.evidence, provenance: candidate.provenance };
  return `${GAME_MEMORY_PREFIX}\n${JSON.stringify(payload)}`;
}

export function parseGameMemory(text: string): PersistedGameMemory | null {
  if (!text.startsWith(`${GAME_MEMORY_PREFIX}\n`)) return null;
  try {
    const value = JSON.parse(text.slice(GAME_MEMORY_PREFIX.length + 1)) as unknown;
    if (!record(value) || value.version !== 1 || !MEMORY_TYPES.includes(value.type as MemoryType) || typeof value.text !== "string" || typeof value.gameId !== "string" || !record(value.provenance)) return null;
    const provenance = value.provenance; const rawEvidence = value.evidence;
    const evidence = validateCompletedGameEvidence(rawEvidence, record(rawEvidence) && typeof rawEvidence.completedAt === "string" ? rawEvidence.completedAt : new Date(0).toISOString());
    if (!evidence.ok || evidence.value.gameId !== value.gameId || !Array.isArray(provenance.gameIds) || !Array.isArray(provenance.questionFields)) return null;
    return { version: 1, type: value.type as MemoryType, text: value.text, gameId: value.gameId, evidence: evidence.value, provenance: { gameIds: provenance.gameIds.filter((item): item is string => typeof item === "string"), questionFields: provenance.questionFields.filter((item): item is string => typeof item === "string") } };
  } catch { return null; }
}

export function isConnectivityTestArtifact(text: string): boolean { return text.startsWith(CONNECTIVITY_TEST_PREFIX); }
export function meaningfulMemoryCount(texts: readonly string[]): number { return texts.reduce((count, text) => count + (parseGameMemory(text) ? 1 : 0), 0); }

export function deduplicateCandidates(candidates: readonly MemoryCandidate[], existing: readonly PersistedGameMemory[]): { accepted: MemoryCandidate[]; rejected: RejectedCandidate[] } {
  const accepted: MemoryCandidate[] = []; const rejected: RejectedCandidate[] = [];
  for (const candidate of candidates) {
    const duplicate = existing.some((memory) => memory.type === candidate.type && (memory.gameId === candidate.evidence.gameId || memory.text === candidate.text)) || accepted.some((memory) => memory.type === candidate.type && (memory.evidence.gameId === candidate.evidence.gameId || memory.text === candidate.text));
    if (duplicate) rejected.push({ type: candidate.type, reason: "Duplicate or superseded game-memory record." }); else accepted.push(candidate);
  }
  return { accepted, rejected };
}

export type QwenBehaviorProposal = { type: "STRATEGY" | "PREFERENCE"; pattern: "headwear" | "color" | "role" | "broad_visual"; gameIds: string[]; questionFields: string[] };
export function parseQwenBehaviorProposals(value: unknown, history: readonly CompletedGameEvidence[]): { accepted: QwenBehaviorProposal[]; rejected: RejectedCandidate[] } {
  if (!record(value) || !Array.isArray(value.observations)) return { accepted: [], rejected: [{ type: "QWEN", reason: "Malformed Qwen memory output." }] };
  const evidenceById = new Map(history.map((item) => [item.gameId, item])); const accepted: QwenBehaviorProposal[] = []; const rejected: RejectedCandidate[] = [];
  for (const item of value.observations.slice(0, 2)) {
    if (!record(item) || (item.type !== "STRATEGY" && item.type !== "PREFERENCE") || !["headwear", "color", "role", "broad_visual"].includes(String(item.pattern)) || !Array.isArray(item.gameIds) || !Array.isArray(item.questionFields)) { rejected.push({ type: "QWEN", reason: "Unsupported Qwen observation schema." }); continue; }
    const gameIds = [...new Set(item.gameIds.filter((id): id is string => typeof id === "string"))]; const questionFields = [...new Set(item.questionFields.filter((field): field is string => typeof field === "string"))];
    if (gameIds.length < 3 || gameIds.some((id) => !evidenceById.has(id)) || questionFields.length === 0 || questionFields.some((field) => !gameIds.some((id) => evidenceById.get(id)?.questions.some((entry) => entry.question.field === field)))) { rejected.push({ type: "QWEN", reason: "Qwen observation lacks support in cited game evidence." }); continue; }
    accepted.push({ type: item.type, pattern: item.pattern as QwenBehaviorProposal["pattern"], gameIds, questionFields });
  }
  return { accepted, rejected };
}

export function qwenProposalCandidate(player: PlayerProfile, proposal: QwenBehaviorProposal, evidence: CompletedGameEvidence): MemoryCandidate {
  const labels: Record<QwenBehaviorProposal["pattern"], string> = { headwear: "often starts with headwear questions", color: "often uses clothing-color questions", role: "often uses role questions", broad_visual: "often starts with broad visual questions" };
  return { type: proposal.type, text: `${player.displayName} ${labels[proposal.pattern]}.`, evidence, provenance: { gameIds: proposal.gameIds, questionFields: proposal.questionFields } };
}
