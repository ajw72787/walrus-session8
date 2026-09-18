import fs from "node:fs";
import path from "node:path";

import { characterArtManifest } from "../src/data/character-art-manifest.ts";
import characters from "../src/data/characters.json" with { type: "json" };

const mode = process.argv.includes("--assets") ? "assets" : "manifest";
const errors: string[] = [];
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function validatePng(file: string, characterId: string): void {
  const data = fs.readFileSync(file);
  if (data.length < 33 || !data.subarray(0, 8).equals(pngSignature)) {
    errors.push(`${characterId}: invalid PNG signature.`);
    return;
  }
  if (data.subarray(12, 16).toString("ascii") !== "IHDR") {
    errors.push(`${characterId}: missing PNG IHDR.`);
    return;
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width !== height) errors.push(`${characterId}: portrait must be square, got ${width}×${height}.`);
  if (width < 512 || height < 512) errors.push(`${characterId}: portrait must be at least 512×512, got ${width}×${height}.`);
}

if (characterArtManifest.length !== 32) errors.push("Manifest must cover exactly 32 characters.");
const filenames = new Set<string>();

for (const [index, item] of characterArtManifest.entries()) {
  const character = characters[index];
  if (!character || item.id !== character.id || item.number !== character.number || item.name !== character.name || item.imagePath !== character.imagePath) {
    errors.push(`Manifest mismatch at position ${index + 1}.`);
  }
  if (!item.generationPrompt || !item.requiredVisibleTraits.length) errors.push(`${item.id}: prompt or required traits missing.`);
  if (filenames.has(item.outputFilename)) errors.push(`Duplicate output filename: ${item.outputFilename}`);
  filenames.add(item.outputFilename);

  if (mode === "assets") {
    const file = path.join(process.cwd(), item.outputPath);
    if (!fs.existsSync(file)) errors.push(`${item.id}: missing ${item.outputPath}`);
    else validatePng(file, item.id);
  }
}

if (errors.length) {
  console.error(`Art validation (${mode}) failed:\n${errors.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Art validation (${mode}) passed: ${characterArtManifest.length} canonical manifest entries${mode === "assets" ? " and assets" : "; missing pre-production assets are expected"}.`);
}
