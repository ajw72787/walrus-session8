import { playerFromSessionValue } from "./player-session-token.ts";
import { PLAYER_SESSION_COOKIE } from "./player-session-constants.ts";
import type { PlayerId } from "./players.ts";

export function playerFromCookieHeader(cookieHeader: string | null, sessionSecret: string, now = Date.now()): PlayerId | null {
  const value = cookieHeader?.match(new RegExp(`(?:^|; )${PLAYER_SESSION_COOKIE}=([^;]+)`))?.[1];
  return playerFromSessionValue(value, sessionSecret, now);
}
