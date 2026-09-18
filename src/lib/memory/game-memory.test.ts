import assert from "node:assert/strict";
import test from "node:test";
import { decideGameMemory, memoryWriteEligibility } from "./game-memory-decision.ts";
import { deterministicGameCandidates, meaningfulMemoryCount, parseGameMemory, serializeGameMemory, validateCompletedGameEvidence } from "./game-memory.ts";
import { playerProfileFor } from "./players.ts";

const raw = { gameId: "game-test-1", outcome: "won", secretCharacterId: "tessa", questionCount: 2, questions: [{ question: { kind: "boolean", field: "hasHeadwear" }, answer: true, eliminatedCount: 15 }] };
const valid = validateCompletedGameEvidence(raw, "2026-09-18T00:00:00.000Z");
if (!valid.ok) throw new Error(valid.error);
const player = playerProfileFor("player_aaron");

test("validates completed evidence and produces one factual game-result candidate", () => {
  assert.equal(validateCompletedGameEvidence({ ...raw, secretCharacterId: "not-real" }).ok, false);
  const candidates = deterministicGameCandidates(player, valid.value).candidates;
  assert.equal(candidates.length, 1); assert.equal(candidates[0].type, "GAME_RESULT");
  const serialized = serializeGameMemory(candidates[0]);
  assert.equal(parseGameMemory(serialized)?.text, "Aaron won against Tessa in 2 actions.");
  assert.equal(meaningfulMemoryCount(["[WHOAMAI_CONNECTIVITY_TEST] Aaron marker", serialized]), 1);
});

test("deduplicates a repeated completed game and rejects unsupported Qwen claims", () => {
  const first = deterministicGameCandidates(player, valid.value).candidates[0];
  const decision = decideGameMemory(player, valid.value, [serializeGameMemory(first)], { observations: [{ type: "PREFERENCE", pattern: "headwear", gameIds: ["invented-1", "invented-2", "invented-3"], questionFields: ["hasHeadwear"] }] });
  assert.equal(decision.accepted.length, 0);
  assert.ok(decision.rejected.some((item) => item.reason.includes("Duplicate")));
  assert.ok(decision.rejected.some((item) => item.reason.includes("three completed games")));
});

test("Memory OFF is a no-write decision and malformed Qwen output is rejected", () => {
  assert.deepEqual(memoryWriteEligibility(false), { allowed: false, reason: "Memory is OFF; no recall, Qwen analysis, or Walrus write was performed." });
  const historical = ["game-test-2", "game-test-3"].map((gameId) => {
    const evidence = { ...valid.value, gameId }; const candidate = deterministicGameCandidates(player, evidence).candidates[0]; return serializeGameMemory(candidate);
  });
  const decision = decideGameMemory(player, valid.value, historical, { notObservations: [] });
  assert.equal(decision.qwenUsed, true);
  assert.ok(decision.rejected.some((item) => item.reason === "Malformed Qwen memory output."));
});
