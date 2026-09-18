# Phase 3C gameplay-memory processing latency

## Status

UX/integration improvement investigation. This is not a confirmed MemWal, relayer, SDK, or Qwen bug.

## Observed manual result

During the first legitimate Who Am AI gameplay-memory write for Aaron, `POST /api/memory/game-complete` returned HTTP 200 after approximately 79 seconds. Next.js reported about 386 ms; application code accounted for approximately 79 seconds.

The visible message, “Reviewing this game for useful memories…”, appeared stalled for several minutes from the player’s perspective before eventually changing to “Saved 1 useful memory.” The resulting `GAME_RESULT` memory was successfully indexed and manually recalled from `whoamai:player_aaron`.

## Scope for later investigation

The Phase 3C endpoint performs mainnet recall, candidate/dedup work, optional Qwen analysis after sufficient history, `remember()`, and `waitForRememberJob()` before responding. Local inspection of MemWal 0.1.7 found that `waitForRememberJob()` polls at 1.5 seconds initially, increases the delay with jitter up to 10 seconds, and defaults to 60 seconds; Who Am AI explicitly uses 120 seconds. It returns only after the write job reaches completion/indexing or fails.

The endpoint therefore waits for indexing before the player sees success. The UI does not require indexing merely to truthfully say that a write was accepted: `remember()` already returns a job ID. A future safe UX proposal is to persist an idempotency key derived from player/game ID, acknowledge an accepted job as “Game saved; memory is processing,” then poll/reconcile that known job without issuing a duplicate write. This requires durable job tracking and duplicate-safe recovery; it is not implemented here. Do not change retry or timeout behavior based on this single successful observation.
