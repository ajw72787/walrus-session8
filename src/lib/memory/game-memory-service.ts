import "server-only";
import { proposeGameMemoryObservations } from "@/lib/llm/game-memory-interpreter";
import { decideGameMemory } from "./game-memory-decision.ts";
import { GAME_MEMORY_PREFIX, parseGameMemory, serializeGameMemory, type CompletedGameEvidence } from "./game-memory.ts";
import { memWalForPlayer } from "./memwal";
import type { PlayerProfile } from "./players.ts";

export async function persistCompletedGameMemory(player: PlayerProfile, evidence: CompletedGameEvidence) {
  const client = memWalForPlayer(player.id);
  const recalled = await client.recall({ query: GAME_MEMORY_PREFIX, limit: 50 });
  const existingTexts = recalled.results.map((memory) => memory.text);
  const existingCount = existingTexts.map(parseGameMemory).filter(Boolean).length;
  let qwenOutput: unknown = undefined; let qwenError: string | undefined;
  if (existingCount >= 2) {
    try { qwenOutput = await proposeGameMemoryObservations([...existingTexts.map(parseGameMemory).filter((memory): memory is NonNullable<typeof memory> => memory !== null).map((memory) => memory.evidence), evidence]); }
    catch { qwenError = "Qwen memory analysis was unavailable; no higher-level observation was stored."; }
  }
  const decision = decideGameMemory(player, evidence, existingTexts, qwenOutput);
  const persisted: Array<{ type: string; text: string; jobId: string; blobId: string }> = [];
  for (const candidate of decision.accepted) {
    const accepted = await client.remember(serializeGameMemory(candidate));
    const complete = await client.waitForRememberJob(accepted.job_id, { timeoutMs: 120_000 });
    persisted.push({ type: candidate.type, text: candidate.text, jobId: accepted.job_id, blobId: complete.blob_id });
  }
  return { decision, persisted, qwenError, recalledConnectivityArtifacts: recalled.results.filter((memory) => memory.text.startsWith("[WHOAMAI_CONNECTIVITY_TEST]")).length };
}
