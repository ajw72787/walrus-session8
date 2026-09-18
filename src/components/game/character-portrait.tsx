"use client";

import { useState } from "react";

import type { Character } from "@/lib/game/character-schema";

import { portraitAlt, portraitFallbackLabel } from "./character-portrait-helpers";

export { portraitAlt, portraitFallbackLabel } from "./character-portrait-helpers";

export function CharacterPortrait({ character, className = "" }: { character: Character; className?: string }) {
  const [unavailable, setUnavailable] = useState(false);

  if (unavailable) {
    return <div aria-label={portraitFallbackLabel(character)} className={`relative flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-violet-100 text-center ${className}`}>
      <span aria-hidden="true" className="text-3xl font-black text-slate-600">{character.species === "robot" ? "⚙" : character.species === "dog" ? "●" : character.name[0]}</span>
      <span aria-hidden="true" className="absolute bottom-1 rounded bg-white/80 px-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">Dev placeholder</span>
      <span className="sr-only">{portraitFallbackLabel(character)}</span>
    </div>;
  }

  return <img src={character.imagePath} alt={portraitAlt(character)} loading="lazy" onError={() => setUnavailable(true)} className={`aspect-square w-full rounded-xl object-contain object-center ${className}`} />;
}
