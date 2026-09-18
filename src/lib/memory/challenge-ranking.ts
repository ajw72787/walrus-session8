import { canonicalCharacters } from "../game/engine.ts";
import type { PlayerMemoryProfile } from "./player-profile.ts";
export type ChallengeRanking = { status: "neutral" | "history_supported"; candidates: Array<{ characterId: string; score: number; reason: string }> };
export function rankChallengeCandidates(profile: PlayerMemoryProfile): ChallengeRanking {
  const encountered = new Set(profile.knownResults.map((result) => result.characterId));
  if (profile.completedGameCount < 3) return { status: "neutral", candidates: canonicalCharacters.map((character) => ({ characterId: character.id, score: 0, reason: "Insufficient history; neutral deterministic set." })) };
  return { status: "history_supported", candidates: canonicalCharacters.map((character) => ({ characterId: character.id, score: encountered.has(character.id) ? 0 : 1, reason: encountered.has(character.id) ? "Previously encountered." : "Not recently encountered." })).sort((a, b) => b.score - a.score || a.characterId.localeCompare(b.characterId)) };
}
