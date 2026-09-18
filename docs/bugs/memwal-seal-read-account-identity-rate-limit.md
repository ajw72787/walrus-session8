# Possible MemWal Seal `read_account_identity` rate-limit failure

## Status

**Observed transient friction / not a confirmed bug** — observed once during a manual mainnet connectivity run, followed by a complete successful unchanged manual run. This is a possible Walrus/Seal/upstream-RPC rate-limit friction item, not a confirmed SDK bug.

## Environment

- Project: Who Am AI? / Walrus Session 8
- SDK: `@mysten-incubation/memwal` 0.1.7
- Node.js: v24.16.0
- OS: Linux 6.8.0-124-generic x86_64
- Network: Walrus Memory mainnet via the production managed relayer
- Operation namespace: `whoamai:player_aaron`
- Test command: `npm run test:memwal:live`

Credentials were supplied server-side through the process environment and are intentionally not included here.

## Reproduction steps

1. Configure server-side MemWal credentials for a valid account and the managed mainnet relayer.
2. Run `npm run test:memwal:live`.
3. Allow the script to complete its relayer `health()` check.
4. Observe the authenticated Aaron-scoped `MemWal.remember()` write.

## Expected behavior

After relayer health succeeds, `remember()` should accept the explicitly marked connectivity-test record, return a job ID, and allow the script to wait for indexing before recall/isolation checks.

## Actual behavior

The relayer health request passed, but the Aaron `remember()` job failed during Seal encryption/account-identity handling:

```text
remember job failed: Internal Error: seal encrypt failed:
seal/encrypt failed during read_account_identity:
RpcError: Too Many Requests
(traceId=34c89d99-f697-44df-b85e-c2878ca9c9da, timeoutMs=25000)
```

Observed frequency: once manually as of 2026-09-18.

## Subsequent unchanged successful run

A later manual execution of the unchanged `npm run test:memwal:live` completed successfully:

- Relayer health: PASS.
- Aaron authenticated write and recall: PASS in `whoamai:player_aaron` (job `79a808b0-a79d-4e13-8d5d-ad0688127158`, blob `NHG-IyhVZKZuOJnQNQRwPw9PU2msVdwsLu2kdcaetEo`).
- Leo authenticated write and recall: PASS in `whoamai:player_leo` (job `e9ad8ca5-f05f-4d72-adb4-8e3964ee6cf2`, blob `vZBMLOyMTYI4g-u0BDxp2FHLqlDqLzI0SnC53cit1QU`).
- Aaron → Leo and Leo → Aaron namespace-isolation checks: PASS.

This later success was not achieved by changing retry behavior or the integration code. It reduces confidence that the observed failure is a persistent SDK defect, while preserving the original evidence for any future recurrence.

## Earlier successful write context

An authenticated Aaron mainnet write had succeeded earlier in the same Phase 3A work:

- Job ID: `fffe2317-f87f-4afe-ae82-e1588e401ebd`
- Blob ID: `K9PO0EcxVvF_qgGDH8-x4brqawFWHNpuUzNkOKUDmrw`

That earlier success indicates the credentials and authenticated mainnet write path had worked before this failure.

## Local SDK investigation

- Local inspection of `@mysten-incubation/memwal` 0.1.7 found no `read_account_identity` source or string. The named operation therefore appears in the relayer/Seal/upstream-RPC job error rather than in the installed TypeScript client.
- `waitForRememberJob()` treats 429 and 5xx errors encountered while *polling* a job-status endpoint as transient, with a bounded backoff between polls.
- Once a job status is `failed`, `waitForRememberJob()` throws the relayer-provided failure immediately. No automatic retry of a failed `remember()` Seal-encryption job was found.
- The SDK records a `Retry-After` value from an error response where supplied, but no generic automatic retry loop around this failed job path was found.
- The project connectivity script does not change or suppress SDK retry behavior. Its explicit `timeoutMs: 120_000` applies only to waiting for a job after submission.
- The error's `timeoutMs=25000` does not match the script's 120-second wait, and no matching local SDK default was found for this `remember()` path. Its origin remains indeterminate from local inspection.

## Next step

Do not classify as an SDK defect or submit externally unless the failure recurs and the relayer/Seal/RPC-side behavior can be independently confirmed.
