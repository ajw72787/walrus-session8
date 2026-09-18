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
