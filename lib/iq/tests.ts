import type { Category, Difficulty } from "./types";

export interface TestDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Domains this test samples from. */
  categories: Category[];
  questionCount: number;
  /** Seconds, or null for an untimed test. */
  timeLimitSec: number | null;
  /** Relative frequency of each difficulty level. */
  difficultyProfile: Record<Difficulty, number>;
}

const BALANCED: Record<Difficulty, number> = { 1: 2, 2: 3, 3: 3, 4: 2, 5: 1 };
const DEMANDING: Record<Difficulty, number> = { 1: 1, 2: 2, 3: 3, 4: 3, 5: 2 };
const GENTLE: Record<Difficulty, number> = { 1: 3, 2: 3, 3: 2, 4: 1, 5: 1 };

export const TESTS: TestDefinition[] = [
  {
    id: "quick",
    name: "Quick IQ Test",
    tagline: "12 questions · 8 minutes",
    description:
      "A short sweep across all five domains. The fastest way to get a first estimate, with correspondingly wider error bars.",
    categories: ["logical", "numerical", "pattern", "spatial", "verbal"],
    questionCount: 12,
    timeLimitSec: 8 * 60,
    difficultyProfile: GENTLE,
  },
  {
    id: "standard",
    name: "Standard IQ Test",
    tagline: "25 questions · 25 minutes",
    description:
      "The full-spectrum assessment. Enough items in every domain to produce a per-domain breakdown and the tightest estimate Modulo offers.",
    categories: ["logical", "numerical", "pattern", "spatial", "verbal"],
    questionCount: 25,
    timeLimitSec: 25 * 60,
    difficultyProfile: BALANCED,
  },
  {
    id: "logic",
    name: "Logic Test",
    tagline: "15 questions · 15 minutes",
    description:
      "Deduction, conditionals, contrapositives and constraint puzzles. Narrow by design — it measures one domain deeply.",
    categories: ["logical"],
    questionCount: 15,
    timeLimitSec: 15 * 60,
    difficultyProfile: DEMANDING,
  },
  {
    id: "pattern",
    name: "Pattern Test",
    tagline: "15 questions · 12 minutes",
    description:
      "Abstract matrices, figure series and odd-one-out sets. Rule discovery with as little language as possible.",
    categories: ["pattern"],
    questionCount: 15,
    timeLimitSec: 12 * 60,
    difficultyProfile: BALANCED,
  },
  {
    id: "numerical",
    name: "Numerical Test",
    tagline: "15 questions · 15 minutes",
    description:
      "Sequences, ratios, percentages and rate problems, several requiring a typed answer rather than a choice.",
    categories: ["numerical"],
    questionCount: 15,
    timeLimitSec: 15 * 60,
    difficultyProfile: BALANCED,
  },
  {
    id: "spatial",
    name: "Spatial Test",
    tagline: "14 questions · 12 minutes",
    description:
      "Mental rotation, folding, cube counting and orientation tracking. Visualise first, then answer.",
    categories: ["spatial"],
    questionCount: 14,
    timeLimitSec: 12 * 60,
    difficultyProfile: BALANCED,
  },
  {
    id: "verbal",
    name: "Verbal Test",
    tagline: "15 questions · 10 minutes",
    description:
      "Analogies, precise word meaning and semantic odd-one-out. Vocabulary in service of relationships, not trivia.",
    categories: ["verbal"],
    questionCount: 15,
    timeLimitSec: 10 * 60,
    difficultyProfile: BALANCED,
  },
];

export const FULL_SPECTRUM_TEST_IDS = ["quick", "standard"] as const;

export function getTest(id: string): TestDefinition | undefined {
  return TESTS.find((t) => t.id === id);
}
