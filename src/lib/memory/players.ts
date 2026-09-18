export const ALLOWED_PLAYER_IDS = ["player_aaron", "player_leo", "player_henry"] as const;
export type PlayerId = (typeof ALLOWED_PLAYER_IDS)[number];

export type PlayerProfile = { id: PlayerId; displayName: string };

export const PLAYER_PROFILES: readonly PlayerProfile[] = [
  { id: "player_aaron", displayName: "Aaron" },
  { id: "player_leo", displayName: "Leo" },
  { id: "player_henry", displayName: "Henry" },
];

export function isPlayerId(value: unknown): value is PlayerId {
  return typeof value === "string" && (ALLOWED_PLAYER_IDS as readonly string[]).includes(value);
}

export function namespaceForPlayer(playerId: PlayerId): string {
  if (!isPlayerId(playerId)) throw new Error("Invalid internal player ID.");
  return `whoamai:${playerId}`;
}

export function playerProfileFor(playerId: PlayerId): PlayerProfile {
  const profile = PLAYER_PROFILES.find((candidate) => candidate.id === playerId);
  if (!profile) throw new Error("Invalid internal player ID.");
  return profile;
}
