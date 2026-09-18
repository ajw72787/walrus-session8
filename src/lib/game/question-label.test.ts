import assert from "node:assert/strict";
import test from "node:test";
import { humanizeValue, questionLabel } from "./question-label.ts";

test("formats canonical question labels for the playable board", () => {
  assert.equal(questionLabel({ kind: "boolean", field: "hasHeadwear" }), "Has headwear?");
  assert.equal(questionLabel({ kind: "value", field: "clothing.primaryColor", operator: "equals", value: "purple" }), "Clothing color: Purple?");
  assert.equal(questionLabel({ kind: "value", field: "visibleItems", operator: "includes", value: "soccer_ball" }), "Holding: Soccer Ball?");
  assert.equal(humanizeValue("cat_ear_headphones"), "Cat Ear Headphones");
  assert.equal(humanizeValue("hair.color"), "Hair Color");
});
