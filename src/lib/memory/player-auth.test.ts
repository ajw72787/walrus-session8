import assert from "node:assert/strict";
import test from "node:test";
import { normalizeMemoryPreference } from "./memory-preference.ts";
import { verifyPlayerPinWithEnvironment } from "./player-pin-core.ts";
import { createPlayerSessionValue, playerFromSessionValue } from "./player-session-token.ts";
import { playerProfileFor } from "./players.ts";
import { parseRecallRequest } from "./recall-request.ts";
import { playerFromCookieHeader } from "./session-access.ts";

const pins = { PLAYER_AARON_PIN: "1234", PLAYER_LEO_PIN: "5678", PLAYER_HENRY_PIN: "9012" };
const secret = "test-session-secret";

test("uses canonical player profiles and rejects invalid PINs without real configuration", () => {
  assert.equal(playerProfileFor("player_aaron").displayName, "Aaron");
  assert.equal(verifyPlayerPinWithEnvironment("player_aaron", "1234", pins), "valid");
  assert.equal(verifyPlayerPinWithEnvironment("player_aaron", "5678", pins), "invalid");
  assert.equal(verifyPlayerPinWithEnvironment("player_aaron", "1234", {}), "not_configured");
});

test("signed player sessions map only to their canonical player and reject tampering", () => {
  const token = createPlayerSessionValue("player_leo", secret, 1_000_000);
  assert.equal(playerFromSessionValue(token, secret, 1_000_001), "player_leo");
  assert.equal(playerFromSessionValue(token.replace("player_leo", "player_aaron"), secret, 1_000_001), null);
  assert.equal(playerFromSessionValue(token, secret, 1_000_000 + 8 * 24 * 60 * 60 * 1000), null);
  assert.equal(playerFromCookieHeader(null, secret), null);
  assert.equal(playerFromCookieHeader(`other=value; whoamai_player_session=${token}`, secret, 1_000_001), "player_leo");
});

test("recall input cannot supply an arbitrary namespace and memory preference is constrained", () => {
  assert.deepEqual(parseRecallRequest(new URL("http://localhost/api/memory/recall?namespace=whoamai%3Aplayer_leo")), { ok: false, error: "Namespaces are server-resolved and cannot be requested." });
  assert.deepEqual(parseRecallRequest(new URL("http://localhost/api/memory/recall?query=marker")), { ok: true, query: "marker" });
  assert.equal(normalizeMemoryPreference("off"), "off");
  assert.equal(normalizeMemoryPreference("anything else"), "on");
});
