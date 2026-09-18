import { canonicalCharacters } from "../game/engine.ts";
import { isConnectivityTestArtifact, parseGameMemory, parseQwenBehaviorProposals, type CompletedGameEvidence, type PersistedGameMemory, type QwenBehaviorProposal } from "./game-memory.ts";
import type { PlayerId } from "./players.ts";

export type ProfileRecordClassification = { valid: PersistedGameMemory[]; connectivityArtifacts: number; malformed: number; unknown: number };
export type QuestionPattern = { total: number; visual: number; role: number; color: number; opening: string | null };
export type PlayerMemoryProfile = { playerId: PlayerId; meaningfulMemoryCount: number; completedGameCount: number; evidenceQuality: "none" | "results_only" | "behavior_ready"; aggregates: { wins: number; losses: number; averageActions: number | null; fastestWin: number | null; slowestWin: number | null; encounteredCharacters: Array<{ characterId: string; count: number }>; questionPattern: QuestionPattern | null; incorrectGuessCount: number | null }; knownResults: Array<{ gameId: string; outcome: "won" | "lost"; characterId: string; actions: number }>; establishedObservations: Array<{ type: "STRATEGY" | "PREFERENCE"; text: string; gameIds: string[] }>; proposedInterpretations: Array<{ type: "STRATEGY" | "PREFERENCE"; text: string; gameIds: string[] }> ; invalidRecordCount: number; connectivityArtifactCount: number };

const visualFields = new Set(["hasHair", "hasEyewear", "hasHeadwear", "hasFacialHair", "holdingItem", "wearingUniform", "isHuman", "isAnimal", "playsSport", "hair.color", "hair.length", "hair.style", "eyewear.type", "headwear.type", "facialHair.type", "clothing.primaryColor", "clothing.secondaryColor", "species", "ageGroup", "presentation", "visibleItems"]);
const colorFields = new Set(["clothing.primaryColor", "clothing.secondaryColor", "hair.color"]);

export function classifyRecalledMemoryTexts(texts: readonly string[]): ProfileRecordClassification {
  const valid: PersistedGameMemory[] = []; let connectivityArtifacts = 0; let malformed = 0; let unknown = 0;
  for (const text of texts) { if (isConnectivityTestArtifact(text)) { connectivityArtifacts++; continue; } const parsed = parseGameMemory(text); if (parsed) valid.push(parsed); else if (text.startsWith("[WHOAMAI_GAME_MEMORY]")) malformed++; else unknown++; }
  return { valid, connectivityArtifacts, malformed, unknown };
}

function questionPattern(games: readonly CompletedGameEvidence[]): QuestionPattern | null {
  const questions = games.flatMap((game) => game.questions); if (!questions.length) return null;
  const fields = questions.map((entry) => entry.question.field); const opening = games.find((game) => game.questions.length)?.questions[0]?.question.field ?? null;
  return { total: fields.length, visual: fields.filter((field) => visualFields.has(field)).length, role: fields.filter((field) => field === "role" || field === "category").length, color: fields.filter((field) => colorFields.has(field)).length, opening };
}

function patternText(pattern: QwenBehaviorProposal["pattern"]): string { return { headwear: "uses headwear questions often", color: "uses color questions often", role: "uses role questions often", broad_visual: "starts with broad visual questions often" }[pattern]; }

export function buildPlayerMemoryProfile(playerId: PlayerId, texts: readonly string[], qwenOutput?: unknown): PlayerMemoryProfile {
  const classified = classifyRecalledMemoryTexts(texts); const gameResults = classified.valid.filter((memory) => memory.type === "GAME_RESULT"); const games = gameResults.map((memory) => memory.evidence); const wins = games.filter((game) => game.outcome === "won"); const actions = wins.map((game) => game.questionCount); const characterCounts = new Map<string, number>(); games.forEach((game) => characterCounts.set(game.secretCharacterId, (characterCounts.get(game.secretCharacterId) ?? 0) + 1));
  const establishedObservations = classified.valid.filter((memory): memory is PersistedGameMemory & { type: "STRATEGY" | "PREFERENCE" } => memory.type === "STRATEGY" || memory.type === "PREFERENCE").map((memory) => ({ type: memory.type, text: memory.text, gameIds: memory.provenance.gameIds }));
  const proposed = games.length >= 3 && qwenOutput !== undefined ? parseQwenBehaviorProposals(qwenOutput, games).accepted.map((proposal) => ({ type: proposal.type, text: patternText(proposal.pattern), gameIds: proposal.gameIds })) : [];
  const pattern = questionPattern(games); const knownResults = games.map((game) => ({ gameId: game.gameId, outcome: game.outcome, characterId: game.secretCharacterId, actions: game.questionCount }));
  return { playerId, meaningfulMemoryCount: classified.valid.length, completedGameCount: games.length, evidenceQuality: games.length >= 3 && pattern ? "behavior_ready" : games.length ? "results_only" : "none", aggregates: { wins: wins.length, losses: games.filter((game) => game.outcome === "lost").length, averageActions: actions.length ? actions.reduce((sum, value) => sum + value, 0) / actions.length : null, fastestWin: actions.length ? Math.min(...actions) : null, slowestWin: actions.length ? Math.max(...actions) : null, encounteredCharacters: [...characterCounts.entries()].map(([characterId, count]) => ({ characterId, count })).sort((a, b) => b.count - a.count || a.characterId.localeCompare(b.characterId)), questionPattern: pattern, incorrectGuessCount: null }, knownResults, establishedObservations, proposedInterpretations: proposed, invalidRecordCount: classified.malformed, connectivityArtifactCount: classified.connectivityArtifacts };
}

export function knownCharacterName(characterId: string): string | null { return canonicalCharacters.find((character) => character.id === characterId)?.name ?? null; }
