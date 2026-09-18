import "server-only";
import { interpretPlayerHistory } from "@/lib/llm/player-profile-interpreter";
import { memWalForPlayer } from "./memwal";
import { buildPlayerMemoryProfile, classifyRecalledMemoryTexts } from "./player-profile.ts";
import type { PlayerId } from "./players.ts";
export async function loadPlayerMemoryProfile(playerId: PlayerId) { const recalled = await memWalForPlayer(playerId).recall({ query: "[WHOAMAI", limit: 50 }); const texts = recalled.results.map((memory) => memory.text); const games = classifyRecalledMemoryTexts(texts).valid.filter((memory) => memory.type === "GAME_RESULT").map((memory) => memory.evidence); let qwenOutput: unknown; let qwenError: string | null = null; if (games.length >= 3) { try { qwenOutput = await interpretPlayerHistory(games); } catch { qwenError = "Qwen profile interpretation unavailable; deterministic profile returned."; } } return { profile: buildPlayerMemoryProfile(playerId, texts, qwenOutput), qwenUsed: games.length >= 3, qwenError, rawResultCount: recalled.total }; }
