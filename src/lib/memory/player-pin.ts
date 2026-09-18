import "server-only";
import { type PlayerId } from "./players.ts";
import { verifyPlayerPinWithEnvironment } from "./player-pin-core.ts";

function processPinEnvironment() {
  return { PLAYER_AARON_PIN: process.env.PLAYER_AARON_PIN, PLAYER_LEO_PIN: process.env.PLAYER_LEO_PIN, PLAYER_HENRY_PIN: process.env.PLAYER_HENRY_PIN };
}

export function verifyPlayerPin(playerId: PlayerId, suppliedPin: unknown): "valid" | "invalid" | "not_configured" {
  return verifyPlayerPinWithEnvironment(playerId, suppliedPin, processPinEnvironment());
}
