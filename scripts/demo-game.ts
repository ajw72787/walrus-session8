import { askQuestion, createGame, guessCharacter, type EngineResult } from "../src/lib/game/engine.ts";

function unwrap<T>(result: EngineResult<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

let game = unwrap(createGame("tessa"));
console.log(`Game ${game.gameId}: secret fixed to tessa for this development demo.`);
console.log(`Starting candidates: ${game.remainingCharacterIds.length}`);

for (const question of [
  { kind: "boolean", field: "hasHeadwear" },
  { kind: "value", field: "clothing.primaryColor", operator: "equals", value: "purple" },
  { kind: "value", field: "visibleItems", operator: "includes", value: "wand" },
]) {
  const before = game.remainingCharacterIds.length;
  game = unwrap(askQuestion(game, question));
  const entry = game.questionsAsked.at(-1)!;
  console.log(`${entry.question.field}: ${entry.answer ? "YES" : "NO"}; eliminated ${before - game.remainingCharacterIds.length}; remaining ${game.remainingCharacterIds.length}`);
}

game = unwrap(guessCharacter(game, "tessa"));
console.log(`Guess tessa: ${game.status.toUpperCase()}`);
console.log(`Final state: ${JSON.stringify({ status: game.status, result: game.result, questionCount: game.questionCount, remaining: game.remainingCharacterIds.length })}`);
