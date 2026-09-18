export type MemoryPreference = "on" | "off";
export const MEMORY_PREFERENCE_STORAGE_KEY = "whoamai-memory-preference";

export function normalizeMemoryPreference(value: unknown): MemoryPreference {
  return value === "off" ? "off" : "on";
}
