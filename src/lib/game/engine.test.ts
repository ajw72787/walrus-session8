import assert from "node:assert/strict";
import test from "node:test";
import {
  askQuestion,
  canonicalCharacters,
  createGame,
  evaluateQuestion,
  guessCharacter,
  type EngineResult,
  type GameState,
} from "./engine.ts";

function unwrap<T>(result: EngineResult<T>): T {
  assert.equal(result.ok, true, result.ok ? "" : result.error);
  return result.value;
}

function game(secretCharacterId = "ava"): GameState {
  return unwrap(createGame(secretCharacterId));
}

test("1. a game begins with all 32 canonical characters", () => {
  const state = game();
  assert.equal(state.remainingCharacterIds.length, 32);
  assert.deepEqual(state.eliminatedCharacterIds, []);
});

test("2. an explicit secret character is used", () => assert.equal(game("rusty").secretCharacterId, "rusty"));

test("3. random games always choose a canonical character", () => {
  for (let count = 0; count < 50; count += 1) {
    const state = unwrap(createGame());
    assert.ok(canonicalCharacters.some((character) => character.id === state.secretCharacterId));
  }
});

test("3a. game creation falls back when randomUUID is unavailable", () => {
  const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  Object.defineProperty(globalThis, "crypto", { configurable: true, value: {} });
  try {
    const state = unwrap(createGame("ava"));
    assert.match(state.gameId, /^game-[a-z0-9]+-[a-z0-9]+$/);
  } finally {
    if (originalCrypto) Object.defineProperty(globalThis, "crypto", originalCrypto);
    else delete (globalThis as { crypto?: Crypto }).crypto;
  }
});

test("4. hasHeadwear evaluates deterministically", () => {
  assert.equal(unwrap(evaluateQuestion("finn", { kind: "boolean", field: "hasHeadwear" })), true);
  assert.equal(unwrap(evaluateQuestion("ava", { kind: "boolean", field: "hasHeadwear" })), false);
});

test("5. hasEyewear evaluates deterministically", () => {
  assert.equal(unwrap(evaluateQuestion("ellie", { kind: "boolean", field: "hasEyewear" })), true);
  assert.equal(unwrap(evaluateQuestion("sam", { kind: "boolean", field: "hasEyewear" })), false);
});

test("6. hair color questions evaluate deterministically", () => assert.equal(unwrap(evaluateQuestion("jace", { kind: "value", field: "hair.color", operator: "equals", value: "black" })), true));
test("7. species questions evaluate deterministically", () => assert.equal(unwrap(evaluateQuestion("rusty", { kind: "value", field: "species", operator: "equals", value: "robot" })), true));
test("8. category questions evaluate deterministically", () => assert.equal(unwrap(evaluateQuestion("gia", { kind: "value", field: "category", operator: "equals", value: "profession" })), true));
test("9. visible item questions evaluate deterministically", () => assert.equal(unwrap(evaluateQuestion("kai", { kind: "value", field: "visibleItems", operator: "includes", value: "map" })), true));

test("10. a YES answer eliminates incompatible characters", () => {
  const next = unwrap(askQuestion(game("finn"), { kind: "boolean", field: "hasHeadwear" }));
  assert.equal(next.questionsAsked[0].answer, true);
  assert.ok(next.eliminatedCharacterIds.includes("ava"));
});

test("11. a NO answer eliminates incompatible characters", () => {
  const next = unwrap(askQuestion(game("ava"), { kind: "boolean", field: "hasHeadwear" }));
  assert.equal(next.questionsAsked[0].answer, false);
  assert.ok(next.eliminatedCharacterIds.includes("finn"));
});

test("12. the secret is never eliminated by a truthful answer", () => {
  const state = unwrap(askQuestion(game("tessa"), { kind: "value", field: "clothing.primaryColor", operator: "equals", value: "purple" }));
  assert.ok(state.remainingCharacterIds.includes("tessa"));
});

test("13. repeated questions do not resurrect eliminated characters", () => {
  const first = unwrap(askQuestion(game("ava"), { kind: "boolean", field: "hasHeadwear" }));
  const second = unwrap(askQuestion(first, { kind: "boolean", field: "hasHeadwear" }));
  assert.ok(first.eliminatedCharacterIds.includes("finn"));
  assert.ok(second.eliminatedCharacterIds.includes("finn"));
  assert.ok(!second.remainingCharacterIds.includes("finn"));
});

test("14. a correct guess wins", () => {
  const state = unwrap(guessCharacter(game("maya"), "maya"));
  assert.equal(state.status, "won");
  assert.deepEqual(state.result, { type: "correct_guess", characterId: "maya" });
});

test("15. an incorrect guess eliminates only that character and continues", () => {
  const state = unwrap(guessCharacter(game("maya"), "ava"));
  assert.equal(state.status, "active");
  assert.ok(state.eliminatedCharacterIds.includes("ava"));
  assert.ok(!state.remainingCharacterIds.includes("ava"));
  assert.equal(state.questionCount, 1);
});

test("16. invalid character guesses fail safely", () => assert.equal(guessCharacter(game(), "not-a-character").ok, false));
test("17. invalid question fields fail safely", () => assert.equal(askQuestion(game(), { kind: "boolean", field: "constructor" }).ok, false));
test("18. invalid question values fail safely", () => assert.equal(askQuestion(game(), { kind: "value", field: "species", operator: "equals", value: "dragon" }).ok, false));

test("19. actions after a win fail safely", () => {
  const won = unwrap(guessCharacter(game("ava"), "ava"));
  assert.equal(askQuestion(won, { kind: "boolean", field: "hasHair" }).ok, false);
  assert.equal(guessCharacter(won, "ben").ok, false);
});

test("20. a new game has no state from an earlier game", () => {
  const first = unwrap(askQuestion(game("ava"), { kind: "boolean", field: "hasHeadwear" }));
  const fresh = game("ava");
  assert.ok(first.eliminatedCharacterIds.length > 0);
  assert.equal(fresh.remainingCharacterIds.length, 32);
  assert.equal(fresh.questionCount, 0);
});

test("21. every canonical secret survives its own representative truthful questions", () => {
  const questions = [
    { kind: "boolean", field: "hasHair" },
    { kind: "boolean", field: "hasHeadwear" },
    { kind: "value", field: "species", operator: "equals", value: "human" },
  ];
  for (const character of canonicalCharacters) {
    let state = game(character.id);
    for (const question of questions) {
      state = unwrap(askQuestion(state, question));
      assert.ok(state.remainingCharacterIds.includes(character.id), `${character.id} was eliminated`);
    }
  }
});

test("22. state transitions preserve the roster partition without mutating canonical data", () => {
  const canonicalSnapshot = JSON.stringify(canonicalCharacters);
  const state = unwrap(askQuestion(game("tessa"), { kind: "boolean", field: "hasHeadwear" }));
  assert.equal(state.remainingCharacterIds.length + state.eliminatedCharacterIds.length, 32);
  assert.equal(JSON.stringify(canonicalCharacters), canonicalSnapshot);
});
