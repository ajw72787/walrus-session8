import type { Character } from "@/lib/game/character-schema";

export function portraitAlt(character: Character): string {
  return `${character.name}, ${character.role.replaceAll("_", " ")} portrait`;
}

export function portraitFallbackLabel(character: Character): string {
  return `Development placeholder for ${character.name}`;
}
