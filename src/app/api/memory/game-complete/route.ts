import { NextResponse } from "next/server";
import { validateCompletedGameEvidence } from "@/lib/memory/game-memory";
import { persistCompletedGameMemory } from "@/lib/memory/game-memory-service";
import { memoryWriteEligibility } from "@/lib/memory/game-memory-decision";
import { playerProfileFor } from "@/lib/memory/players";
import { configuredSessionSecret } from "@/lib/memory/player-session";
import { playerFromCookieHeader } from "@/lib/memory/session-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { evidence?: unknown; memoryEnabled?: unknown; namespace?: unknown; playerId?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Request body must be valid JSON." }, { status: 400 }); }
  if ("namespace" in body || "playerId" in body) return NextResponse.json({ ok: false, error: "Player identity and namespace are server-resolved." }, { status: 400 });
  let playerId;
  try { playerId = playerFromCookieHeader(request.headers.get("cookie"), configuredSessionSecret()); } catch { return NextResponse.json({ ok: false, error: "Player sessions are not configured." }, { status: 503 }); }
  if (!playerId) return NextResponse.json({ ok: false, error: "Choose a player before processing game memory." }, { status: 401 });
  const evidence = validateCompletedGameEvidence(body.evidence);
  if (!evidence.ok) return NextResponse.json({ ok: false, error: evidence.error }, { status: 400 });
  const eligibility = memoryWriteEligibility(body.memoryEnabled);
  if (!eligibility.allowed) return NextResponse.json({ ok: true, status: "skipped_memory_off", candidates: [], rejected: [{ type: "MEMORY", reason: eligibility.reason }], persisted: [] });
  try {
    const result = await persistCompletedGameMemory(playerProfileFor(playerId), evidence.value);
    return NextResponse.json({ ok: true, status: "processed", candidates: result.decision.candidates.map(({ type, text }) => ({ type, text })), rejected: result.decision.rejected, persisted: result.persisted, qwen: { used: result.decision.qwenUsed, error: result.qwenError ?? null }, existingMeaningfulCount: result.decision.existingMeaningfulCount, connectivityTestArtifactsSeen: result.recalledConnectivityArtifacts });
  } catch { return NextResponse.json({ ok: false, error: "Game-memory processing is unavailable. No result should be treated as saved unless it appears in persisted memory status." }, { status: 503 }); }
}
