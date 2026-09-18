import "server-only";
import { MemWal } from "@mysten-incubation/memwal";
import { namespaceForPlayer, type PlayerId } from "./players";

const DEFAULT_SERVER_URL = "https://relayer.memory.walrus.xyz";

function required(name: "MEMWAL_PRIVATE_KEY" | "MEMWAL_ACCOUNT_ID"): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for Walrus Memory.`);
  return value;
}

export function memWalConfig() {
  return { key: required("MEMWAL_PRIVATE_KEY"), accountId: required("MEMWAL_ACCOUNT_ID"), serverUrl: process.env.MEMWAL_SERVER_URL?.trim() || DEFAULT_SERVER_URL };
}

export function memWalForPlayer(playerId: PlayerId) {
  return MemWal.create({ ...memWalConfig(), namespace: namespaceForPlayer(playerId) });
}
