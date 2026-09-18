import { NextResponse } from "next/server";
import { checkOllamaHealth, getOllamaModel } from "@/lib/llm/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkOllamaHealth();

  return NextResponse.json(
    {
      provider: "Ollama",
      model: getOllamaModel(),
      ...health,
    },
    { status: health.reachable && health.modelAvailable ? 200 : 503 },
  );
}
