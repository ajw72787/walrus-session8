This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result. On the configured local network, the development app is also available at [http://192.168.69.135:3001](http://192.168.69.135:3001).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Architecture

```
Browser
  ↓
Next.js server
  ↓
Ollama
  ↓
Qwen 2.5 3B
```

The browser communicates only with the Next.js server; Ollama remains server-side.

## Canonical character data

[src/data/characters.json](src/data/characters.json) is the authoritative 32-character roster. Future artwork must match its visual fields and future game logic must use it for facts and deduction traits; an LLM must never invent or override those facts. The referenced `/characters/NN-name.png` paths are expected future asset locations, not artwork that exists today.

Run `npm run validate:data` to check roster integrity and `npm run analyze:data` to review deduction-trait distributions.

## Deterministic game truth

```
Natural language (future)
  ↓
structured question
  ↓
deterministic game engine
  ↓
canonical characters.json
```

The future LLM may translate player language into structured questions, but the TypeScript engine alone evaluates truth, chooses and protects the secret character, eliminates candidates, and resolves guesses.

## Phase 2A interpretation flow

`Player text → local Qwen 2.5 3B via Ollama → validated structured intent → deterministic engine → game state`. Qwen only translates language; it cannot answer facts, eliminate cards, or decide guesses. Run `npm run eval:interpreter` to evaluate the local interpreter (results may vary slightly).

The frozen Phase 2A adversarial evaluation reached 144/154 (93.5%). Safety-sensitive categories were 100% safe-rejected where appropriate; remaining misses are conservative `OTHER` results rather than game-state mutations.

## Phase 3A Walrus Memory connectivity

MemWal 0.1.7 is integrated server-side only. A manual mainnet run verified authenticated `remember()` writes, indexed recall, returned blob IDs, and bidirectional isolation for the fixed Aaron and Leo namespaces. This only establishes connectivity; gameplay is not yet writing meaningful player memories.

## Phase 3B player identity and Memory Inspector

The browser selects one canonical household player and verifies a four-digit server-configured PIN. A signed HTTP-only session cookie then identifies only that verified canonical player to the read-only memory API; the server derives the MemWal namespace and rejects caller-supplied namespaces. Browser testing verified Aaron and Leo's separate mainnet recall namespaces. In development, the Memory Inspector recalls only the active player's namespace when requested manually. Phase 3A connectivity-test markers are test artifacts, not meaningful gameplay memories and do not count toward the ten-meaningful-memories-per-user requirement.

## Phase 3C meaningful game memory

Completed games remain ephemeral. When the locally selected Memory setting is ON, a completed win can submit raw engine evidence to the authenticated server for selective review. The server validates canonical fields, creates a factual `GAME_RESULT` candidate, deduplicates against prior append-only gameplay records, and may ask local Qwen for strictly cited strategy/preference proposals only after at least three completed games exist. Qwen cannot establish game truth or write unsupported claims. Connectivity-test artifacts remain excluded from meaningful-memory accounting.

The first legitimate mainnet gameplay-memory write has been manually validated for Aaron: a completed win against Tessa produced one recalled `GAME_RESULT` record in Aaron’s isolated namespace. It is meaningful gameplay memory #1 for Aaron; Phase 3A connectivity-test artifacts remain excluded.

## Phase 1C playable board

The homepage now provides a responsive, playable placeholder board using the deterministic engine entirely in the browser. It has structured developer question controls, canonical-data placeholder cards, question history, guessing, and development-only secret controls. Character portraits are placeholders; gameplay-memory integration comes in a later phase.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
