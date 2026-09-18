/** NON-PRODUCTION / NON-CONTEST fixtures. Never write these strings to Walrus. */
import { deterministicGameCandidates, serializeGameMemory, type CompletedGameEvidence } from "./game-memory.ts";
import { playerProfileFor } from "./players.ts";
const player = playerProfileFor("player_aaron");
function game(gameId: string, secretCharacterId: string, fields: string[]): CompletedGameEvidence { return { gameId, outcome: "won", secretCharacterId, questionCount: fields.length + 1, completedAt: "2026-01-01T00:00:00.000Z", questions: fields.map((field) => ({ question: { kind: "boolean", field } as CompletedGameEvidence["questions"][number]["question"], answer: true, eliminatedCount: 1 })) }; }
export const FIXTURE_ONE = serializeGameMemory(deterministicGameCandidates(player, game("fixture-one", "tessa", ["hasHeadwear"])).candidates[0]);
export const FIXTURE_THREE = [FIXTURE_ONE, serializeGameMemory(deterministicGameCandidates(player, game("fixture-two", "rusty", ["hasHeadwear", "hasEyewear"])).candidates[0]), serializeGameMemory(deterministicGameCandidates(player, game("fixture-three", "bruno", ["hasHeadwear", "holdingItem"])).candidates[0])];
export const FIXTURE_CONNECTIVITY = "[WHOAMAI_CONNECTIVITY_TEST] fixture only";
export const FIXTURE_MALFORMED = "[WHOAMAI_GAME_MEMORY]\n{not json";
export const FIXTURE_UNKNOWN = "ordinary recalled text";
