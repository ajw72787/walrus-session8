import { askQuestion, guessCharacter, type EngineResult, type GameState } from "./engine.ts";
import type { GameIntent } from "./intent.ts";

/** Applies only validated actionable intents. OTHER is intentionally a no-op. */
export function applyGameIntent(state: GameState, intent: GameIntent): EngineResult<GameState> {
  if (intent.type === "ATTRIBUTE_QUESTION") return askQuestion(state, intent.question);
  if (intent.type === "CHARACTER_GUESS") return guessCharacter(state, intent.characterId);
  return { ok: true, value: state };
}
