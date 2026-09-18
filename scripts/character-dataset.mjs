import characters from "../src/data/characters.json" with { type: "json" };

const vocabularies = {
  species: ["human", "robot", "dog"], ageGroup: ["young", "adult", "older", "unknown"], presentation: ["feminine", "masculine", "neutral", "nonbinary"],
  hairColor: ["none", "black", "brown", "blond", "red", "gray", "green", "purple", "golden"], hairLength: ["none", "short", "medium", "long"], hairStyle: ["none", "straight", "curly", "wavy"],
  eyewear: ["none", "glasses", "goggles", "snow_goggles", "eye_patch"], headwear: ["none", "cap", "helmet", "crown", "chef_hat", "cowboy_hat", "sun_hat", "pirate_hat", "wizard_hat", "beret", "beanie", "pilot_cap", "headphones", "cat_ear_headphones"], facialHair: ["none", "mustache", "beard"],
  color: ["none", "black", "white", "brown", "blue", "pink", "purple", "orange", "green", "yellow", "tan", "red", "teal", "silver", "golden", "navy", "gray"],
  clothing: ["casual", "student", "royal_adventurer", "goalie_gear", "lab_coat", "surfer", "chef_uniform", "cowboy", "gamer", "football_uniform", "explorer", "astronaut_suit", "inventor", "photographer", "doctor_coat", "pirate", "soccer_uniform", "firefighter_uniform", "wizard_robe", "artist_smock", "baker_uniform", "martial_arts_gi", "snowboard_gear", "rock_outfit", "robot_body", "animal_fur", "pilot_uniform", "fisherman"],
  role: ["skateboarder", "student", "royal_adventurer", "hockey_goalie", "scientist", "surfer", "chef", "cowboy", "gamer", "football_player", "explorer", "astronaut", "inventor", "photographer", "doctor", "pirate", "soccer_player", "firefighter", "wizard", "artist", "baker", "martial_artist", "snowboarder", "rock_musician", "robot", "golden_retriever", "bulldog", "pilot", "fisherman", "dj_music_fan"],
  category: ["sports", "profession", "fantasy_adventure", "entertainment", "animal", "technology"],
  visibleItem: ["skateboard", "backpack", "surfboard", "wooden_spoon", "football", "map", "wrench", "camera", "stethoscope", "controller", "soccer_ball", "wand", "binoculars", "paintbrush", "cupcake", "guitar", "antenna", "fishing_rod"],
};

const sportRoles = new Set(["skateboarder", "hockey_goalie", "surfer", "football_player", "soccer_player", "martial_artist", "snowboarder"]);
const uniformClothing = new Set(["goalie_gear", "lab_coat", "chef_uniform", "football_uniform", "astronaut_suit", "doctor_coat", "soccer_uniform", "firefighter_uniform", "baker_uniform", "martial_arts_gi", "snowboard_gear", "pilot_uniform"]);
const categoryForRole = { skateboarder: "sports", student: "profession", royal_adventurer: "fantasy_adventure", hockey_goalie: "sports", scientist: "profession", surfer: "sports", chef: "profession", cowboy: "fantasy_adventure", gamer: "entertainment", football_player: "sports", explorer: "fantasy_adventure", astronaut: "profession", inventor: "technology", photographer: "profession", doctor: "profession", pirate: "fantasy_adventure", soccer_player: "sports", firefighter: "profession", wizard: "fantasy_adventure", artist: "entertainment", baker: "profession", martial_artist: "sports", snowboarder: "sports", rock_musician: "entertainment", robot: "technology", golden_retriever: "animal", bulldog: "animal", pilot: "profession", fisherman: "profession", dj_music_fan: "entertainment" };

function isIn(value, list) { return list.includes(value); }
function issue(errors, message) { errors.push(message); }
function requireObject(value, path, errors) { if (!value || typeof value !== "object" || Array.isArray(value)) issue(errors, `${path} must be an object`); }

export function validateCharacters(records = characters) {
  const errors = [];
  if (!Array.isArray(records) || records.length !== 32) issue(errors, "Dataset must contain exactly 32 characters.");
  const ids = new Set(); const names = new Set(); const numbers = new Set();
  for (const [index, character] of records.entries()) {
    const label = `character at index ${index}`;
    if (!character || typeof character !== "object") { issue(errors, `${label} must be an object`); continue; }
    for (const field of ["id", "number", "name", "species", "ageGroup", "presentation", "hair", "eyewear", "headwear", "facialHair", "clothing", "role", "category", "visibleItems", "traits", "imagePath", "artworkDescription"]) if (!(field in character)) issue(errors, `${label} is missing ${field}`);
    if (typeof character.id !== "string" || !/^[a-z]+$/.test(character.id)) issue(errors, `${label} has invalid id`); else if (ids.has(character.id)) issue(errors, `Duplicate id: ${character.id}`); else ids.add(character.id);
    if (typeof character.name !== "string" || !character.name) issue(errors, `${label} has invalid name`); else if (names.has(character.name)) issue(errors, `Duplicate name: ${character.name}`); else names.add(character.name);
    if (!Number.isInteger(character.number)) issue(errors, `${label} has invalid number`); else if (numbers.has(character.number)) issue(errors, `Duplicate number: ${character.number}`); else numbers.add(character.number);
    for (const [field, values] of [["species", vocabularies.species], ["ageGroup", vocabularies.ageGroup], ["presentation", vocabularies.presentation], ["role", vocabularies.role], ["category", vocabularies.category]]) if (!isIn(character[field], values)) issue(errors, `${character.id}: invalid ${field}`);
    requireObject(character.hair, `${character.id}.hair`, errors); requireObject(character.eyewear, `${character.id}.eyewear`, errors); requireObject(character.headwear, `${character.id}.headwear`, errors); requireObject(character.facialHair, `${character.id}.facialHair`, errors); requireObject(character.clothing, `${character.id}.clothing`, errors); requireObject(character.traits, `${character.id}.traits`, errors);
    if (character.hair && (!isIn(character.hair.color, vocabularies.hairColor) || !isIn(character.hair.length, vocabularies.hairLength) || !isIn(character.hair.style, vocabularies.hairStyle))) issue(errors, `${character.id}: invalid hair value`);
    for (const [field, values] of [["eyewear", vocabularies.eyewear], ["headwear", vocabularies.headwear], ["facialHair", vocabularies.facialHair]]) if (character[field] && (!isIn(character[field].type, values) || !isIn(character[field].color, vocabularies.color))) issue(errors, `${character.id}: invalid ${field} value`);
    if (character.clothing && (!isIn(character.clothing.primaryColor, vocabularies.color) || !isIn(character.clothing.secondaryColor, vocabularies.color) || !isIn(character.clothing.type, vocabularies.clothing))) issue(errors, `${character.id}: invalid clothing value`);
    if (!Array.isArray(character.visibleItems) || character.visibleItems.some((item) => !isIn(item, vocabularies.visibleItem))) issue(errors, `${character.id}: invalid visibleItems value`);
    if (typeof character.imagePath !== "string" || character.imagePath !== `/characters/${String(character.number).padStart(2, "0")}-${character.id}.png`) issue(errors, `${character.id}: imagePath must match its canonical future asset path`);
    if (typeof character.artworkDescription !== "string" || !character.artworkDescription.trim()) issue(errors, `${character.id}: artworkDescription is required`);
    const expected = { hasHair: character.hair?.color !== "none", hasEyewear: character.eyewear?.type !== "none", hasHeadwear: character.headwear?.type !== "none", hasFacialHair: character.facialHair?.type !== "none", holdingItem: character.visibleItems?.length > 0, wearingUniform: uniformClothing.has(character.clothing?.type), isHuman: character.species === "human", isAnimal: character.species === "dog", playsSport: sportRoles.has(character.role) };
    for (const [trait, value] of Object.entries(expected)) if (character.traits?.[trait] !== value) issue(errors, `${character.id}: traits.${trait} disagrees with detailed fields`);
    if (categoryForRole[character.role] !== character.category) issue(errors, `${character.id}: category does not match role`);
  }
  for (let number = 1; number <= 32; number += 1) if (!numbers.has(number)) issue(errors, `Missing character number: ${number}`);
  return errors;
}

export function countBy(records, valueFor) {
  return Object.fromEntries([...records.reduce((counts, record) => { const value = valueFor(record); counts.set(value, (counts.get(value) ?? 0) + 1); return counts; }, new Map()).entries()].sort(([a], [b]) => String(a).localeCompare(String(b))));
}

export function splitQuality(yes, total) {
  const smallerSide = Math.min(yes, total - yes); const ratio = smallerSide / total;
  return { yes, no: total - yes, ratio: Number(ratio.toFixed(3)), quality: ratio === 0.5 ? "excellent" : ratio >= 0.4 ? "good" : ratio >= 0.25 ? "moderate" : "poor" };
}

export { characters };
