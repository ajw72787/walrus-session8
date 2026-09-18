import "server-only";

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "qwen2.5:3b";
const HEALTH_TIMEOUT_MS = 5_000;
const GENERATE_TIMEOUT_MS = 30_000;

export type OllamaHealth = {
  reachable: boolean;
  modelAvailable: boolean;
  error?: string;
};

type OllamaTagsResponse = {
  models?: Array<{ name?: string }>;
};

type OllamaGenerateResponse = {
  response?: string;
  error?: string;
};

function getBaseUrl(): string {
  const configuredUrl = process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_BASE_URL;

  try {
    const url = new URL(configuredUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }

    return url.origin;
  } catch {
    throw new Error("OLLAMA_BASE_URL must be a valid HTTP(S) URL.");
  }
}

export function getOllamaModel(): string {
  return process.env.OLLAMA_MODEL?.trim() || DEFAULT_MODEL;
}

async function requestOllama(
  path: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request to Ollama timed out.");
    }

    throw new Error("Unable to reach Ollama.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkOllamaHealth(): Promise<OllamaHealth> {
  try {
    const response = await requestOllama("/api/tags", {}, HEALTH_TIMEOUT_MS);

    if (!response.ok) {
      return {
        reachable: false,
        modelAvailable: false,
        error: `Ollama returned HTTP ${response.status}.`,
      };
    }

    const body = (await response.json()) as OllamaTagsResponse;
    const model = getOllamaModel();
    const modelAvailable = body.models?.some((item) => item.name === model) ?? false;

    return { reachable: true, modelAvailable };
  } catch (error) {
    return {
      reachable: false,
      modelAvailable: false,
      error: error instanceof Error ? error.message : "Unable to reach Ollama.",
    };
  }
}

export async function generateWithOllama(message: string): Promise<string> {
  const response = await requestOllama(
    "/api/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: getOllamaModel(), prompt: message, stream: false }),
    },
    GENERATE_TIMEOUT_MS,
  );

  const body = (await response.json().catch(() => null)) as OllamaGenerateResponse | null;

  if (!response.ok) {
    throw new Error(body?.error || `Ollama returned HTTP ${response.status}.`);
  }

  if (typeof body?.response !== "string") {
    throw new Error("Ollama returned an invalid generation response.");
  }

  return body.response;
}
