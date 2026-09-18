import { NextResponse } from "next/server";
import { PLAYER_SESSION_COOKIE, playerSessionCookieOptions } from "@/lib/memory/player-session";

export const runtime = "nodejs";
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PLAYER_SESSION_COOKIE, "", { ...playerSessionCookieOptions, maxAge: 0 });
  return response;
}
