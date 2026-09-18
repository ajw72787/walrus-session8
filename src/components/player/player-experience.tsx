"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MemoryInspector } from "@/components/memory/memory-inspector";
import { PlayableGame } from "@/components/game/playable-game";
import type { GameState } from "@/lib/game/engine";
import { completedGameSubmission } from "@/lib/memory/game-memory-client";
import { MEMORY_PREFERENCE_STORAGE_KEY, normalizeMemoryPreference, type MemoryPreference } from "@/lib/memory/memory-preference";
import { PLAYER_PROFILES, type PlayerId, type PlayerProfile } from "@/lib/memory/players";

const ACTIVE_PLAYER_STORAGE_KEY = "whoamai-active-player";

function subscribeMemoryPreference(onStoreChange: () => void) {
  window.addEventListener("whoamai-memory-preference-change", onStoreChange);
  return () => window.removeEventListener("whoamai-memory-preference-change", onStoreChange);
}

function memoryPreferenceSnapshot(): MemoryPreference {
  return normalizeMemoryPreference(window.localStorage.getItem(MEMORY_PREFERENCE_STORAGE_KEY));
}

export function PlayerExperience() {
  const [activePlayer, setActivePlayer] = useState<PlayerProfile | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<PlayerId>("player_aaron");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [memoryStatus, setMemoryStatus] = useState("");
  const memoryPreference = useSyncExternalStore(subscribeMemoryPreference, memoryPreferenceSnapshot, () => "on");
  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    void fetch("/api/player/session", { cache: "no-store" }).then((response) => response.json()).then((data: { player?: PlayerProfile | null }) => {
      if (data.player) { setActivePlayer(data.player); setSelectedPlayerId(data.player.id); }
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const choosePlayer = async (event: React.FormEvent) => {
    event.preventDefault(); setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/player/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playerId: selectedPlayerId, pin }) });
      const data = await response.json() as { ok?: boolean; player?: PlayerProfile; error?: string };
      if (!data.ok || !data.player) { setError(data.error ?? "Could not activate that player."); return; }
      window.localStorage.setItem(ACTIVE_PLAYER_STORAGE_KEY, data.player.id); setActivePlayer(data.player); setPin("");
    } catch { setError("Could not reach the local server."); } finally { setSubmitting(false); }
  };
  const logout = async () => {
    await fetch("/api/player/logout", { method: "POST" }).catch(() => undefined);
    window.localStorage.removeItem(ACTIVE_PLAYER_STORAGE_KEY); setActivePlayer(null); setPin(""); setError("");
  };
  const changePreference = (preference: MemoryPreference) => { window.localStorage.setItem(MEMORY_PREFERENCE_STORAGE_KEY, preference); window.dispatchEvent(new Event("whoamai-memory-preference-change")); };
  const completeGame = async (game: GameState) => {
    const evidence = completedGameSubmission(game); if (!evidence) return;
    if (memoryPreference === "off") { setMemoryStatus("Memory is OFF — this completed game was not stored."); return; }
    setMemoryStatus("Reviewing this game for useful memories…");
    try {
      const response = await fetch("/api/memory/game-complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ evidence, memoryEnabled: true }) });
      const data = await response.json() as { ok?: boolean; persisted?: unknown[]; error?: string };
      if (!data.ok) setMemoryStatus(data.error ?? "No long-term memory was saved."); else setMemoryStatus(data.persisted?.length ? `Saved ${data.persisted.length} useful memor${data.persisted.length === 1 ? "y" : "ies"}.` : "No new long-term memory needed from this game.");
    } catch { setMemoryStatus("Memory review was unavailable; no saved result was confirmed."); }
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-slate-100 p-6 text-slate-700">Loading player profile…</main>;
  if (!activePlayer) return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_#e0f2fe,_#f8fafc_55%,_#f5f3ff)] p-4"><form onSubmit={choosePlayer} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-700">Who Am AI?</p><h1 className="mt-1 text-3xl font-black text-slate-950">Who’s playing?</h1><p className="mt-2 text-slate-600">Choose your profile, then enter your four-digit household PIN.</p><fieldset className="mt-5 space-y-2"><legend className="font-bold text-slate-800">Player</legend>{PLAYER_PROFILES.map((player) => <label key={player.id} className={`flex min-h-12 cursor-pointer items-center rounded-xl border px-4 font-bold ${selectedPlayerId === player.id ? "border-cyan-500 bg-cyan-50" : "border-slate-200"}`}><input type="radio" name="player" value={player.id} checked={selectedPlayerId === player.id} onChange={() => setSelectedPlayerId(player.id)} className="mr-3" />{player.displayName}</label>)}</fieldset><label className="mt-5 block font-bold text-slate-800" htmlFor="player-pin">4-digit PIN<input id="player-pin" inputMode="numeric" autoComplete="off" pattern="[0-9]{4}" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-lg tracking-[0.3em]" /></label>{error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}<button type="submit" disabled={submitting || pin.length !== 4} className="mt-5 min-h-12 w-full rounded-xl bg-cyan-600 font-bold text-white hover:bg-cyan-700 disabled:bg-slate-400">{submitting ? "Checking…" : "Start playing"}</button><p className="mt-3 text-xs text-slate-500">This is a simple household profile selector, not high-security authentication.</p></form></main>;
  return <><div className="fixed right-3 top-3 z-20 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 p-2 text-xs shadow-sm"><span className="font-bold">Playing: {activePlayer.displayName}</span><span className="hidden text-slate-500 sm:inline">Memory is {memoryPreference.toUpperCase()}</span><button type="button" onClick={() => changePreference(memoryPreference === "on" ? "off" : "on")} className="min-h-9 rounded-lg border border-slate-300 px-2 font-bold">Memory: {memoryPreference.toUpperCase()}</button><button type="button" onClick={() => void logout()} className="min-h-9 rounded-lg border border-slate-300 px-2 font-bold">Switch player</button></div><PlayableGame onGameCompleted={completeGame} memoryStatus={memoryStatus} />{isDevelopment && <div className="mx-auto max-w-7xl px-3 pb-8 sm:px-6 lg:px-8"><MemoryInspector activePlayer={activePlayer} /></div>}</>;
}
