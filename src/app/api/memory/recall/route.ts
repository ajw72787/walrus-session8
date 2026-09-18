import { NextResponse } from "next/server";
import { memWalForPlayer } from "@/lib/memory/memwal";
import { namespaceForPlayer, playerProfileFor } from "@/lib/memory/players";
import { parseRecallRequest } from "@/lib/memory/recall-request";
import { configuredSessionSecret } from "@/lib/memory/player-session";
import { playerFromCookieHeader } from "@/lib/memory/session-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  let playerId;
  try { playerId = playerFromCookieHeader(request.headers.get("cookie"), configuredSessionSecret()); } catch { return NextResponse.json({ ok: false, error: "Player sessions are not configured." }, { status: 503 }); }
  if (!playerId) return NextResponse.json({ ok: false, error: "Choose a player before recalling memories." }, { status: 401 });
  const parsed = parseRecallRequest(new URL(request.url));
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  try {
    const result = await memWalForPlayer(playerId).recall({ query: parsed.query, limit: 10 });
    return NextResponse.json({ ok: true, player: playerProfileFor(playerId), namespace: namespaceForPlayer(playerId), query: parsed.query, memories: result.results.map(({ blob_id, text, distance, created_at }) => ({ blobId: blob_id, text, distance, createdAt: created_at ?? null })), total: result.total, droppedCount: result.dropped_count ?? 0 });
  } catch { return NextResponse.json({ ok: false, error: "Memory recall is unavailable. Check server-side Walrus configuration." }, { status: 503 }); }
}
