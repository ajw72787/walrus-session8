import assert from "node:assert/strict";
import test from "node:test";
import { ALLOWED_PLAYER_IDS, isPlayerId, namespaceForPlayer } from "./players.ts";

test("allows only Phase 3A internal player IDs and derives namespaces", () => {
  assert.deepEqual(ALLOWED_PLAYER_IDS, ["player_aaron", "player_leo", "player_henry"]);
  assert.equal(namespaceForPlayer("player_leo"), "whoamai:player_leo");
  assert.equal(isPlayerId("player_aaron"), true);
  assert.equal(isPlayerId("whoamai:player_aaron"), false);
  assert.throws(() => namespaceForPlayer("anything" as never), /Invalid internal player ID/);
});
