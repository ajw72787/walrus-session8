import assert from "node:assert/strict";
import test from "node:test";

import characters from "../../data/characters.json" with { type: "json" };
import { portraitAlt, portraitFallbackLabel } from "../../components/game/character-portrait-helpers.ts";
import type { Character } from "./character-schema";

test("portrait helper labels are informative and use canonical character data", () => {
  const ava = characters[0] as Character;
  assert.equal(portraitAlt(ava), "Ava, skateboarder portrait");
  assert.equal(portraitFallbackLabel(ava), "Development placeholder for Ava");
});
