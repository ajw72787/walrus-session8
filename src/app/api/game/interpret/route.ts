import { NextResponse } from "next/server";
import { getOllamaModel } from "@/lib/llm/ollama";
import { interpretPlayerMessage } from "@/lib/llm/game-interpreter";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function POST(request: Request) { let body: { message?: unknown }; try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Request body must be valid JSON." }, { status: 400 }); } if (typeof body.message !== "string" || !body.message.trim() || body.message.length > 500) return NextResponse.json({ ok: false, error: "Message must be 1–500 characters." }, { status: 400 }); try { const { intent, source } = await interpretPlayerMessage(body.message.trim()); return NextResponse.json({ ok: true, intent, source, model: getOllamaModel() }); } catch { return NextResponse.json({ ok: false, error: "Interpretation is unavailable. Try again." }, { status: 503 }); } }
