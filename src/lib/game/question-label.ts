import type { DeductionQuestion } from "./engine.ts";

const labels: Record<string, string> = { hasHair: "Has hair", hasEyewear: "Has eyewear", hasHeadwear: "Has headwear", hasFacialHair: "Has facial hair", holdingItem: "Holding an item", wearingUniform: "Wearing a uniform", isHuman: "Is human", isAnimal: "Is an animal", playsSport: "Plays a sport", species: "Species", ageGroup: "Age group", presentation: "Presentation", "hair.color": "Hair color", "hair.length": "Hair length", "hair.style": "Hair style", "eyewear.type": "Eyewear", "headwear.type": "Headwear", "facialHair.type": "Facial hair", "clothing.primaryColor": "Clothing color", "clothing.secondaryColor": "Secondary clothing color", role: "Role", category: "Category", visibleItems: "Holding" };

export function humanizeValue(value: string): string { return value.replaceAll("_", " ").replaceAll(".", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
export function questionLabel(question: DeductionQuestion): string { const label = labels[question.field] ?? question.field; return question.kind === "boolean" ? `${label}?` : `${label}: ${humanizeValue(question.value)}?`; }
