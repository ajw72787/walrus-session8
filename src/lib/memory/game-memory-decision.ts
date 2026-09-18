import { deduplicateCandidates, deterministicGameCandidates, parseGameMemory, parseQwenBehaviorProposals, qwenProposalCandidate, type CompletedGameEvidence, type RejectedCandidate } from "./game-memory.ts";
import type { PlayerProfile } from "./players.ts";

export type GameMemoryDecision = { candidates: ReturnType<typeof deterministicGameCandidates>["candidates"]; accepted: ReturnType<typeof deduplicateCandidates>["accepted"]; rejected: RejectedCandidate[]; existingMeaningfulCount: number; qwenUsed: boolean };

export function memoryWriteEligibility(memoryEnabled: unknown): { allowed: true } | { allowed: false; reason: string } {
  return memoryEnabled === true ? { allowed: true } : { allowed: false, reason: "Memory is OFF; no recall, Qwen analysis, or Walrus write was performed." };
}

export function decideGameMemory(player: PlayerProfile, evidence: CompletedGameEvidence, existingTexts: readonly string[], qwenOutput: unknown | undefined): GameMemoryDecision {
  const existing = existingTexts.map(parseGameMemory).filter((memory): memory is NonNullable<typeof memory> => memory !== null);
  const deterministic = deterministicGameCandidates(player, evidence);
  const history = [...existing.map((memory) => memory.evidence), evidence];
  const candidates = [...deterministic.candidates]; const rejected = [...deterministic.rejected];
  let qwenUsed = false;
  if (history.length >= 3) {
    qwenUsed = true;
    const proposed = parseQwenBehaviorProposals(qwenOutput, history);
    rejected.push(...proposed.rejected);
    candidates.push(...proposed.accepted.map((proposal) => qwenProposalCandidate(player, proposal, evidence)));
  } else rejected.push({ type: "QWEN", reason: "At least three completed games are required before strategy or preference analysis." });
  const deduplicated = deduplicateCandidates(candidates, existing);
  return { candidates, accepted: deduplicated.accepted, rejected: [...rejected, ...deduplicated.rejected], existingMeaningfulCount: existing.length, qwenUsed };
}
