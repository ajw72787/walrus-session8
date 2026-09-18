export const DEFAULT_MEMORY_RECALL_QUERY = "[WHOAMAI";

export type RecallRequest = { ok: true; query: string } | { ok: false; error: string };

export function parseRecallRequest(url: URL): RecallRequest {
  if (url.searchParams.has("namespace")) return { ok: false, error: "Namespaces are server-resolved and cannot be requested." };
  const query = url.searchParams.get("query")?.trim() || DEFAULT_MEMORY_RECALL_QUERY;
  if (query.length > 200) return { ok: false, error: "Recall query must be at most 200 characters." };
  return { ok: true, query };
}
