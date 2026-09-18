import type { PlayerMemoryProfile } from "./player-profile.ts";
export const ALLOWED_PERSONALIZATION = ["conversational_continuity", "strategy_reflection", "milestone", "challenge_selection", "question_suggestion"] as const;
export const FORBIDDEN_PERSONALIZATION = ["game_truth_change", "character_attribute_change", "secret_leak", "fabricated_history", "psychological_judgment", "cross_player_history"] as const;
export function canUsePersonalization(profile: PlayerMemoryProfile, memoryEnabled: boolean): boolean { return memoryEnabled && profile.meaningfulMemoryCount > 0; }
