import { NextResponse } from "next/server";
import { generateWithOllama, getOllamaModel } from "@/lib/llm/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TestRequest = { message?: unknown };

export async function POST(request: Request) {
  let body: TestRequest;

  try {
    body = (await request.json()) as TestRequest;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json(
      { error: "The request requires a non-empty string message." },
      { status: 400 },
    );
  }

  try {
    const response = await generateWithOllama(body.message.trim());

    return NextResponse.json({ model: getOllamaModel(), response });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ollama generation failed." },
      { status: 502 },
    );
  }
}
