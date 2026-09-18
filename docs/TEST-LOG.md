# Walrus Session 8 — Test Log

## Environment

- Host: HP ZBook
- Node: v24.16.0
- npm: 11.13.0
- Ollama: 0.24.0
- Primary LLM: Qwen 2.5 3B via Ollama
- Memory: Walrus Memory / MemWal
- Network: Walrus mainnet
- Application port: 3001

## Test 001 — Qwen 2.5 3B Local Inference

**Status:** PASS

Qwen 2.5 3B successfully ran locally through Ollama.

### Intent classification observations

Successful:
- "is it the robot guy" → `CHARACTER_GUESS:robot`
- "is yours a dog" → `CHARACTER_GUESS:dog`
- "does the person got hair on his face" → `ATTRIBUTE_QUESTION:facial_hair`
- "does she have that hat thing" → `ATTRIBUTE_QUESTION:hat`

Incorrect / ambiguous:
- "does he got the things you see through on his face" → returned `facial_hair`; expected `glasses`
- "is it rusty" → returned `OTHER`; expected a character guess if Rusty exists in the supplied roster

### Takeaway

Qwen 2.5 3B appears capable of handling the game's natural-language classification with structured prompting, canonical character names, attribute aliases, and deterministic validation by the game engine.

---

## Phase 0 — Automated and Integration Checks

The Phase 0 API surface adds the following checks for local development:

- `GET /api/status` verifies the application status payload and reports that Walrus Memory is not configured.
- `GET /api/llm/health` makes a server-side request to Ollama's model listing and verifies that the configured model is available.
- `POST /api/llm/test` sends a development prompt to the configured Ollama model through the Next.js server and returns its response.
- Project validation includes linting and a production build/type validation.

---

## Phase 1A — Canonical Character Dataset

- Added the authoritative 32-character JSON roster, controlled TypeScript vocabulary, and derived visible deduction traits.
- Added dependency-free dataset validation for roster integrity, controlled values, image path conventions, derived trait consistency, species relationships, and artwork descriptions.
- Added a distribution-analysis script to flag unbalanced opening deduction questions before artwork or game logic is introduced.
- Character image paths describe future expected assets only; no artwork has been generated in this phase.

---

## Phase 1A — Targeted Age and Headwear Revision

- Replaced the age vocabulary with `young`, `adult`, `older`, and `unknown`; the 29 human characters are assigned as 7 young, 20 adult, and 2 older, while all non-human characters remain unknown.
- Removed only Ava's and Kai's caps, with matching derived traits and artwork descriptions updated.
