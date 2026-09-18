# Memory architecture progression

Who Am AI keeps deterministic game truth separate from player memory.

1. **No memory:** each game begins without historical context.
2. **Memory storage:** selected completed-game facts are persisted in the authenticated player's isolated Walrus namespace.
3. **Memory understanding:** only validated gameplay-memory envelopes become deterministic aggregates and, with adequate evidence, tightly validated Qwen proposals.
4. **Memory use:** future experiences may use supported profile facts for continuity, reflection, suggestions, milestones, or challenge ranking. They may never alter deterministic answers, character data, secret truth, or another player's history.

The TypeScript engine remains authoritative for game facts. Qwen interprets language and optional historical patterns but cannot establish unsupported facts. Walrus persists per-player records; fixed canonical namespaces isolate players. Connectivity-test markers are excluded from player profiles and meaningful-memory accounting.

Synthetic profile fixtures under `src/lib/memory/profile-fixtures.ts` are explicitly non-production and non-contest data. They are never written to Walrus.
