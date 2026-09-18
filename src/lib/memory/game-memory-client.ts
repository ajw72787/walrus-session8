import type { GameState } from "@/lib/game/engine";
import type { CompletedGameSubmission } from "./game-memory.ts";

export function completedGameSubmission(game: GameState): CompletedGameSubmission | null {
  if (game.status !== "won" || game.result?.type !== "correct_guess") return null;
  return { gameId: game.gameId, outcome: "won", secretCharacterId: game.secretCharacterId, questionCount: game.questionCount, questions: game.questionsAsked.map((entry) => ({ question: entry.question, answer: entry.answer, eliminatedCount: entry.eliminatedCharacterIds.length })) };
}
