import assert from "node:assert/strict";
import test from "node:test";

import characters from "../../data/characters.json" with { type: "json" };
import { characterArtManifest } from "../../data/character-art-manifest.ts";

test("art manifest covers the frozen roster in canonical order", () => {
  assert.equal(characterArtManifest.length, 32);
  assert.deepEqual(characterArtManifest.map((item) => item.id), characters.map((character) => character.id));
  assert.equal(new Set(characterArtManifest.map((item) => item.outputFilename)).size, 32);

  for (const [index, item] of characterArtManifest.entries()) {
    assert.equal(item.number, index + 1);
    assert.equal(item.imagePath, characters[index].imagePath);
    assert.equal(item.outputPath, `public${characters[index].imagePath}`);
    assert.ok(item.generationPrompt.length > 250);
    assert.ok(item.requiredVisibleTraits.length > 0);
    assert.equal(item.assetStatus, "missing_preproduction");
    assert.equal("race" in item, false);
    assert.equal("ethnicity" in item, false);
    assert.equal("skinTone" in item, false);
  }
});
