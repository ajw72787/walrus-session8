import { notFound } from "next/navigation";

import { CharacterPortrait } from "@/components/game/character-portrait";
import { characterArtManifest } from "@/data/character-art-manifest";
import { canonicalCharacters } from "@/lib/game/engine";

export default function DevelopmentCharacterGallery() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <main className="min-h-screen bg-slate-100 p-5 text-slate-900 sm:p-8">
    <div className="mx-auto max-w-7xl"><header className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">Development only</p><h1 className="text-3xl font-black">Character asset gallery</h1><p className="mt-1 text-slate-600">Canonical order, portrait status, and traits for art review. Missing images intentionally show development placeholders.</p></header>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{canonicalCharacters.map((character, index) => {
        const manifest = characterArtManifest[index];
        return <article key={character.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><CharacterPortrait character={character} /><p className="mt-3 text-xs font-bold text-slate-400">{String(character.number).padStart(2, "0")} · {manifest.assetStatus}</p><h2 className="font-black">{character.name}</h2><p className="text-xs font-semibold text-cyan-800">{character.role.replaceAll("_", " ")}</p><p className="mt-2 text-xs text-slate-600">{manifest.requiredVisibleTraits.join(" · ")}</p></article>;
      })}</section>
    </div>
  </main>;
}
