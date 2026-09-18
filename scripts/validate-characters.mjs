import { validateCharacters } from "./character-dataset.mjs";

const errors = validateCharacters();
if (errors.length) {
  console.error(`Character dataset validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Character dataset validation passed: 32 canonical characters are internally consistent.");
}
