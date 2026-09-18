import { validateQuestion, type DeductionQuestion } from "./engine.ts";

export type GameIntent = { type: "ATTRIBUTE_QUESTION"; question: DeductionQuestion } | { type: "CHARACTER_GUESS"; characterId: string } | { type: "OTHER"; reason?: string };

function extractJson(text: string): string | null {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{"); const end = cleaned.lastIndexOf("}");
  return start >= 0 && end > start ? cleaned.slice(start, end + 1) : null;
}

export function parseModelIntent(text: string, characterIds: readonly string[]): GameIntent {
  const json = extractJson(text); if (!json) return { type: "OTHER", reason: "invalid_model_output" };
  let value: unknown; try { value = JSON.parse(json); } catch { return { type: "OTHER", reason: "invalid_json" }; }
  if (!value || typeof value !== "object" || Array.isArray(value)) return { type: "OTHER", reason: "invalid_shape" };
  const record = value as Record<string, unknown>;
  if (record.type === "OTHER") return { type: "OTHER", reason: typeof record.reason === "string" ? record.reason.slice(0, 80) : undefined };
  if (record.type === "CHARACTER_GUESS" && typeof record.characterId === "string" && characterIds.includes(record.characterId)) return { type: "CHARACTER_GUESS", characterId: record.characterId };
  if (record.type === "ATTRIBUTE_QUESTION") { const question = validateQuestion(record.question); if (question.ok) return { type: "ATTRIBUTE_QUESTION", question: question.value }; }
  return { type: "OTHER", reason: "unvalidated_model_intent" };
}
