export const ALLOWED_PLAYER_IDS = ["player_aaron", "player_leo", "player_henry"] as const;
export type PlayerId = (typeof ALLOWED_PLAYER_IDS)[number];

export function isPlayerId(value: unknown): value is PlayerId {
  return typeof value === "string" && (ALLOWED_PLAYER_IDS as readonly string[]).includes(value);
}

export function namespaceForPlayer(playerId: PlayerId): string {
  if (!isPlayerId(playerId)) throw new Error("Invalid internal player ID.");
  return `whoamai:${playerId}`;
}
