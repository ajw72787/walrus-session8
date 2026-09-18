import assert from "node:assert/strict";
import test from "node:test";
import { parseModelIntent } from "./intent.ts";
const ids = ["rusty", "tessa"];
test("parses valid intents and safely rejects malformed output", () => {
  assert.deepEqual(parseModelIntent('{"type":"ATTRIBUTE_QUESTION","question":{"kind":"value","field":"eyewear.type","operator":"equals","value":"glasses"}}', ids), { type: "ATTRIBUTE_QUESTION", question: { kind: "value", field: "eyewear.type", operator: "equals", value: "glasses" } });
  assert.deepEqual(parseModelIntent('```json\n{"type":"CHARACTER_GUESS","characterId":"rusty"}\n```', ids), { type: "CHARACTER_GUESS", characterId: "rusty" });
  assert.equal(parseModelIntent('Here: {"type":"OTHER","reason":"unclear"}', ids).type, "OTHER");
  for (const text of ["", "{bad", '{"type":"BAD"}', '{"type":"CHARACTER_GUESS","characterId":"fake"}', '{"type":"ATTRIBUTE_QUESTION","question":{"kind":"value","field":"oops","operator":"equals","value":"x"}}']) assert.equal(parseModelIntent(text, ids).type, "OTHER");
});
