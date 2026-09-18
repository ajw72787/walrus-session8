import { NextResponse } from "next/server";
import { getOllamaModel } from "@/lib/llm/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    appName: "Walrus Session 8",
    status: "development",
    runtime: {
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
    },
    llm: {
      provider: "Ollama",
      model: getOllamaModel(),
    },
    memory: {
      status: "not_configured",
      message: "Walrus Memory integration is planned for a later phase.",
    },
  });
}
