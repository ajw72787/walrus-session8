import { type PlayerId } from "./players.ts";

export type PinEnvironment = Partial<Record<"PLAYER_AARON_PIN" | "PLAYER_LEO_PIN" | "PLAYER_HENRY_PIN", string | undefined>>;

const pinVariableForPlayer: Record<PlayerId, keyof PinEnvironment> = {
  player_aaron: "PLAYER_AARON_PIN",
  player_leo: "PLAYER_LEO_PIN",
  player_henry: "PLAYER_HENRY_PIN",
};

export function isFourDigitPin(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}$/.test(value);
}

export function verifyPlayerPinWithEnvironment(playerId: PlayerId, suppliedPin: unknown, environment: PinEnvironment): "valid" | "invalid" | "not_configured" {
  const configuredPin = environment[pinVariableForPlayer[playerId]]?.trim();
  if (!isFourDigitPin(configuredPin)) return "not_configured";
  return isFourDigitPin(suppliedPin) && suppliedPin === configuredPin ? "valid" : "invalid";
}
