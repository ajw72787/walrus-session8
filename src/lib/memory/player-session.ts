import "server-only";
export { createPlayerSessionValue, playerFromSessionValue } from "./player-session-token.ts";
export { PLAYER_SESSION_COOKIE } from "./player-session-constants.ts";
import { SESSION_DURATION_SECONDS } from "./player-session-constants.ts";

export function configuredSessionSecret(environment: NodeJS.ProcessEnv = process.env): string {
  const secret = environment.PLAYER_SESSION_SECRET?.trim();
  if (!secret) throw new Error("PLAYER_SESSION_SECRET is required for player sessions.");
  return secret;
}

export const playerSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
