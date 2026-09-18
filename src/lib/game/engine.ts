import canonicalData from "../../data/characters.json" with { type: "json" };
import {
  AGE_GROUPS,
  CATEGORIES,
  COLORS,
  EYEWEAR_TYPES,
  FACIAL_HAIR_TYPES,
  HAIR_COLORS,
  HAIR_LENGTHS,
  HAIR_STYLES,
  HEADWEAR_TYPES,
  PRESENTATIONS,
  ROLES,
  SPECIES,
  VISIBLE_ITEMS,
  type Character,
} from "./character-schema.ts";

export const canonicalCharacters = canonicalData as Character[];

const characterById = new Map(canonicalCharacters.map((character) => [character.id, character]));
const allCharacterIds = canonicalCharacters.map((character) => character.id);

export const BOOLEAN_QUESTION_FIELDS = [
  "hasHair",
  "hasEyewear",
  "hasHeadwear",
  "hasFacialHair",
  "holdingItem",
  "wearingUniform",
  "isHuman",
  "isAnimal",
  "playsSport",
] as const;

export const VALUE_QUESTION_FIELDS = [
  "species",
  "ageGroup",
  "presentation",
  "hair.color",
  "hair.length",
  "hair.style",
  "eyewear.type",
  "headwear.type",
  "facialHair.type",
  "clothing.primaryColor",
  "clothing.secondaryColor",
  "role",
  "category",
  "visibleItems",
] as const;

export type BooleanQuestionField = (typeof BOOLEAN_QUESTION_FIELDS)[number];
export type ValueQuestionField = (typeof VALUE_QUESTION_FIELDS)[number];
export type DeductionQuestion =
  | { kind: "boolean"; field: BooleanQuestionField }
  | { kind: "value"; field: Exclude<ValueQuestionField, "visibleItems">; operator: "equals"; value: string }
  | { kind: "value"; field: "visibleItems"; operator: "includes"; value: string };

export type QuestionHistoryEntry = {
  question: DeductionQuestion;
  answer: boolean;
  eliminatedCharacterIds: string[];
};

export type GameResult = { type: "correct_guess"; characterId: string } | null;

export type GameState = {
  gameId: string;
  secretCharacterId: string;
  remainingCharacterIds: string[];
  eliminatedCharacterIds: string[];
  questionsAsked: QuestionHistoryEntry[];
  /** Counts deduction questions and character guesses; incorrect guesses are actions. */
  questionCount: number;
  status: "active" | "won" | "lost";
  result: GameResult;
};

export type EngineSuccess<T> = { ok: true; value: T };
export type EngineFailure = { ok: false; error: string };
export type EngineResult<T> = EngineSuccess<T> | EngineFailure;

const booleanEvaluators: Record<BooleanQuestionField, (character: Character) => boolean> = {
  hasHair: (character) => character.traits.hasHair,
  hasEyewear: (character) => character.traits.hasEyewear,
  hasHeadwear: (character) => character.traits.hasHeadwear,
  hasFacialHair: (character) => character.traits.hasFacialHair,
  holdingItem: (character) => character.traits.holdingItem,
  wearingUniform: (character) => character.traits.wearingUniform,
  isHuman: (character) => character.traits.isHuman,
  isAnimal: (character) => character.traits.isAnimal,
  playsSport: (character) => character.traits.playsSport,
};

const valueEvaluators: Record<ValueQuestionField, (character: Character) => string | string[]> = {
  species: (character) => character.species,
  ageGroup: (character) => character.ageGroup,
  presentation: (character) => character.presentation,
  "hair.color": (character) => character.hair.color,
  "hair.length": (character) => character.hair.length,
  "hair.style": (character) => character.hair.style,
  "eyewear.type": (character) => character.eyewear.type,
  "headwear.type": (character) => character.headwear.type,
  "facialHair.type": (character) => character.facialHair.type,
  "clothing.primaryColor": (character) => character.clothing.primaryColor,
  "clothing.secondaryColor": (character) => character.clothing.secondaryColor,
  role: (character) => character.role,
  category: (character) => character.category,
  visibleItems: (character) => character.visibleItems,
};

const allowedValues: Record<ValueQuestionField, readonly string[]> = {
  species: SPECIES,
  ageGroup: AGE_GROUPS,
  presentation: PRESENTATIONS,
  "hair.color": HAIR_COLORS,
  "hair.length": HAIR_LENGTHS,
  "hair.style": HAIR_STYLES,
  "eyewear.type": EYEWEAR_TYPES,
  "headwear.type": HEADWEAR_TYPES,
  "facialHair.type": FACIAL_HAIR_TYPES,
  "clothing.primaryColor": COLORS,
  "clothing.secondaryColor": COLORS,
  role: ROLES,
  category: CATEGORIES,
  visibleItems: VISIBLE_ITEMS,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === "string" && allowed.includes(value);
}

export function validateQuestion(question: unknown): EngineResult<DeductionQuestion> {
  if (!isRecord(question)) return { ok: false, error: "Question must be an object." };

  if (question.kind === "boolean" && isOneOf(question.field, BOOLEAN_QUESTION_FIELDS)) {
    return { ok: true, value: { kind: "boolean", field: question.field } };
  }

  if (question.kind !== "value" || !isOneOf(question.field, VALUE_QUESTION_FIELDS)) {
    return { ok: false, error: "Question field is not allowlisted." };
  }

  const expectedOperator = question.field === "visibleItems" ? "includes" : "equals";
  if (question.operator !== expectedOperator) {
    return { ok: false, error: `Question operator must be ${expectedOperator} for ${question.field}.` };
  }
  if (!isOneOf(question.value, allowedValues[question.field])) {
    return { ok: false, error: `Question value is invalid for ${question.field}.` };
  }

  if (question.field === "visibleItems") {
    return { ok: true, value: { kind: "value", field: "visibleItems", operator: "includes", value: question.value } };
  }
  return { ok: true, value: { kind: "value", field: question.field, operator: "equals", value: question.value } };
}

function evaluateValidatedQuestion(character: Character, question: DeductionQuestion): boolean {
  if (question.kind === "boolean") return booleanEvaluators[question.field](character);
  const actualValue = valueEvaluators[question.field](character);
  return Array.isArray(actualValue) ? actualValue.includes(question.value) : actualValue === question.value;
}

export function evaluateQuestion(characterId: string, question: unknown): EngineResult<boolean> {
  const character = characterById.get(characterId);
  if (!character) return { ok: false, error: "Character ID is invalid." };
  const validatedQuestion = validateQuestion(question);
  if (!validatedQuestion.ok) return validatedQuestion;
  return { ok: true, value: evaluateValidatedQuestion(character, validatedQuestion.value) };
}

export function createGame(secretCharacterId?: string): EngineResult<GameState> {
  const secretId = secretCharacterId ?? allCharacterIds[Math.floor(Math.random() * allCharacterIds.length)];
  if (!characterById.has(secretId)) return { ok: false, error: "Secret character ID is invalid." };

  return {
    ok: true,
    value: {
      gameId: crypto.randomUUID(),
      secretCharacterId: secretId,
      remainingCharacterIds: [...allCharacterIds],
      eliminatedCharacterIds: [],
      questionsAsked: [],
      questionCount: 0,
      status: "active",
      result: null,
    },
  };
}

function ensureActive(state: GameState): EngineFailure | null {
  return state.status === "active" ? null : { ok: false, error: "Game is already complete." };
}

export function askQuestion(state: GameState, question: unknown): EngineResult<GameState> {
  const inactive = ensureActive(state);
  if (inactive) return inactive;
  const validatedQuestion = validateQuestion(question);
  if (!validatedQuestion.ok) return validatedQuestion;

  const secret = characterById.get(state.secretCharacterId);
  if (!secret) return { ok: false, error: "Game state has an invalid secret character." };
  const answer = evaluateValidatedQuestion(secret, validatedQuestion.value);
  const newlyEliminated = state.remainingCharacterIds.filter((id) => {
    const character = characterById.get(id);
    return character !== undefined && evaluateValidatedQuestion(character, validatedQuestion.value) !== answer;
  });
  const remainingCharacterIds = state.remainingCharacterIds.filter((id) => !newlyEliminated.includes(id));
  const eliminatedCharacterIds = [...state.eliminatedCharacterIds, ...newlyEliminated];

  return {
    ok: true,
    value: {
      ...state,
      remainingCharacterIds,
      eliminatedCharacterIds,
      questionsAsked: [...state.questionsAsked, { question: validatedQuestion.value, answer, eliminatedCharacterIds: newlyEliminated }],
      questionCount: state.questionCount + 1,
    },
  };
}

export function guessCharacter(state: GameState, characterId: string): EngineResult<GameState> {
  const inactive = ensureActive(state);
  if (inactive) return inactive;
  if (!characterById.has(characterId)) return { ok: false, error: "Character guess ID is invalid." };
  if (state.eliminatedCharacterIds.includes(characterId)) return { ok: false, error: "Character has already been eliminated." };

  if (characterId === state.secretCharacterId) {
    return { ok: true, value: { ...state, questionCount: state.questionCount + 1, status: "won", result: { type: "correct_guess", characterId } } };
  }

  return {
    ok: true,
    value: {
      ...state,
      remainingCharacterIds: state.remainingCharacterIds.filter((id) => id !== characterId),
      eliminatedCharacterIds: [...state.eliminatedCharacterIds, characterId],
      questionCount: state.questionCount + 1,
    },
  };
}
