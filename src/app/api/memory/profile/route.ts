import { NextResponse } from "next/server";
import { configuredSessionSecret } from "@/lib/memory/player-session";
import { playerFromCookieHeader } from "@/lib/memory/session-access";
import { parseProfileRequest } from "@/lib/memory/profile-request";
import { loadPlayerMemoryProfile } from "@/lib/memory/player-profile-service";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(request: Request) { const parsed = parseProfileRequest(new URL(request.url)); if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 }); let playerId; try { playerId = playerFromCookieHeader(request.headers.get("cookie"), configuredSessionSecret()); } catch { return NextResponse.json({ ok: false, error: "Player sessions are not configured." }, { status: 503 }); } if (!playerId) return NextResponse.json({ ok: false, error: "Choose a player before building a profile." }, { status: 401 }); if (parsed.memory === "off") return NextResponse.json({ ok: true, status: "memory_off", profile: null, qwenUsed: false }); try { const result = await loadPlayerMemoryProfile(playerId); return NextResponse.json({ ok: true, status: "ready", ...result }); } catch { return NextResponse.json({ ok: false, error: "Player profile is unavailable. No profile should be treated as current." }, { status: 503 }); } }
