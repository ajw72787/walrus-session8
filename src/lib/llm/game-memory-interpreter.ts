import "server-only";
import type { CompletedGameEvidence } from "@/lib/memory/game-memory";
import { generateWithOllama } from "./ollama";

const prompt = `Return JSON only: {"observations":[...]}. You analyze only supplied completed-game evidence. Propose zero to two observations only when at least three distinct games support them. Each observation must be {"type":"STRATEGY"|"PREFERENCE","pattern":"headwear"|"color"|"role"|"broad_visual","gameIds":[...],"questionFields":[...]}. Never infer personality, ability, sensitive traits, facts outside evidence, or any game truth. Cite only supplied game IDs and question fields.`;

export async function proposeGameMemoryObservations(history: readonly CompletedGameEvidence[]): Promise<unknown> {
  if (history.length < 3) return { observations: [] };
  const compact = history.map((game) => ({ gameId: game.gameId, questionCount: game.questionCount, questions: game.questions.map((entry) => ({ field: entry.question.field, kind: entry.question.kind })) }));
  const raw = await generateWithOllama(`${prompt}\nEvidence:${JSON.stringify(compact)}`, { format: "json", temperature: 0, numPredict: 180 });
  try { return JSON.parse(raw) as unknown; } catch { return null; }
}
