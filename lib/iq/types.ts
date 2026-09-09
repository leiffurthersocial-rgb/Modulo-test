/** Cognitive domains covered by the Modulo question bank. */
export type Category =
  | "logical"
  | "numerical"
  | "pattern"
  | "spatial"
  | "verbal";

export const CATEGORIES: Category[] = [
  "logical",
  "numerical",
  "pattern",
  "spatial",
  "verbal",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  logical: "Logical reasoning",
  numerical: "Numerical reasoning",
  pattern: "Pattern recognition",
  spatial: "Spatial reasoning",
  verbal: "Verbal reasoning",
};

export const CATEGORY_BLURBS: Record<Category, string> = {
  logical: "Deduction, conditional rules and eliminating impossible cases.",
  numerical: "Sequences, ratios, arithmetic relationships and estimation.",
  pattern: "Abstract rule discovery across visual and symbolic series.",
  spatial: "Mental rotation, folding and tracking position in space.",
  verbal: "Analogies, semantic relationships and precise word meaning.",
};

/** 1 = easiest, 5 = hardest. Drives the ability estimator. */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type ShapeName =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "hexagon"
  | "star"
  | "cross"
  | "arrow"
  | "chevron";

export type FillStyle = "solid" | "outline" | "half" | "dotted";

/** A declarative figure. Rendered to SVG so the bank ships no image assets. */
export interface Glyph {
  shape: ShapeName;
  fill: FillStyle;
  /** Degrees, clockwise. */
  rotation: number;
  /** How many copies of the shape appear in the cell (1-4). */
  count: number;
}

export type Stimulus =
  | { kind: "text-sequence"; items: string[] }
  | { kind: "glyph-row"; glyphs: Glyph[] }
  /** Exactly 9 cells, row-major. `null` marks the cell to solve for. */
  | { kind: "glyph-matrix"; cells: (Glyph | null)[] }
  | { kind: "text-block"; text: string };

export type AnswerSpec =
  | { kind: "choice"; options: string[]; correctIndex: number }
  | { kind: "glyph-choice"; options: Glyph[]; correctIndex: number }
  | { kind: "numeric"; value: number; tolerance?: number };

export interface Question {
  /** Stable and unique across the whole bank. */
  id: string;
  category: Category;
  difficulty: Difficulty;
  prompt: string;
  stimulus?: Stimulus;
  answer: AnswerSpec;
  explanation?: string;
}

/**
 * A user's answer. `choice` / `glyph-choice` store the option index,
 * `numeric` stores the entered value. `null` means unanswered.
 */
export type ResponseValue = number | null;

export interface Response {
  questionId: string;
  value: ResponseValue;
}

export function isCorrect(question: Question, value: ResponseValue): boolean {
  if (value === null || Number.isNaN(value)) return false;
  const spec = question.answer;
  if (spec.kind === "numeric") {
    const tolerance = spec.tolerance ?? 0;
    return Math.abs(value - spec.value) <= tolerance + 1e-9;
  }
  return value === spec.correctIndex;
}

/** Probability of a correct answer purely by guessing. */
export function guessRate(question: Question): number {
  const spec = question.answer;
  if (spec.kind === "numeric") return 0.02;
  return spec.options.length > 0 ? 1 / spec.options.length : 0.25;
}
