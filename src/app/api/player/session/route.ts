import { NextResponse } from "next/server";
import { playerProfileFor } from "@/lib/memory/players";
import { configuredSessionSecret } from "@/lib/memory/player-session";
import { playerFromCookieHeader } from "@/lib/memory/session-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  try {
    const playerId = playerFromCookieHeader(request.headers.get("cookie"), configuredSessionSecret());
    return NextResponse.json({ ok: true, player: playerId ? playerProfileFor(playerId) : null });
  } catch { return NextResponse.json({ ok: true, player: null }); }
}
