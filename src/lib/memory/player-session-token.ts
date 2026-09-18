import { createHmac, timingSafeEqual } from "node:crypto";
import { isPlayerId, type PlayerId } from "./players.ts";
import { SESSION_DURATION_SECONDS } from "./player-session-constants.ts";

export { SESSION_DURATION_SECONDS } from "./player-session-constants.ts";

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createPlayerSessionValue(playerId: PlayerId, secret: string, now = Date.now()): string {
  const expiresAt = Math.floor(now / 1000) + SESSION_DURATION_SECONDS;
  const payload = `${playerId}.${expiresAt}`;
  return `${payload}.${signature(payload, secret)}`;
}

export function playerFromSessionValue(value: string | undefined, secret: string, now = Date.now()): PlayerId | null {
  if (!value) return null;
  const [playerId, expiresAtText, receivedSignature, ...extra] = value.split(".");
  if (extra.length || !isPlayerId(playerId) || !/^\d+$/.test(expiresAtText ?? "") || !receivedSignature) return null;
  const expected = signature(`${playerId}.${expiresAtText}`, secret);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(receivedSignature);
  if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) return null;
  return Number(expiresAtText) > Math.floor(now / 1000) ? playerId : null;
}
