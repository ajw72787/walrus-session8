import { NextResponse } from "next/server";
import { isPlayerId, playerProfileFor } from "@/lib/memory/players";
import { verifyPlayerPin } from "@/lib/memory/player-pin";
import { configuredSessionSecret, createPlayerSessionValue, PLAYER_SESSION_COOKIE, playerSessionCookieOptions } from "@/lib/memory/player-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { playerId?: unknown; pin?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!isPlayerId(body.playerId)) return NextResponse.json({ ok: false, error: "Choose a valid player." }, { status: 400 });
  const verification = verifyPlayerPin(body.playerId, body.pin);
  if (verification === "not_configured") return NextResponse.json({ ok: false, error: "Player PINs have not been configured on the server." }, { status: 503 });
  if (verification === "invalid") return NextResponse.json({ ok: false, error: "That PIN does not match this player." }, { status: 401 });
  try {
    const response = NextResponse.json({ ok: true, player: playerProfileFor(body.playerId) });
    response.cookies.set(PLAYER_SESSION_COOKIE, createPlayerSessionValue(body.playerId, configuredSessionSecret()), playerSessionCookieOptions);
    return response;
  } catch { return NextResponse.json({ ok: false, error: "Player sessions have not been configured on the server." }, { status: 503 }); }
}
