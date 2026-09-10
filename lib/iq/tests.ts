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
  /**
   * Adaptive tests choose each question from how the previous ones went, so
   * `questionCount` is the maximum rather than the length: the test finishes as
   * soon as the estimate is precise enough.
   */
  adaptive?: boolean;
  minQuestions?: number;
  /** Stop once the standard error reaches this, in IQ points. */
  targetStandardError?: number;
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
    id: "adaptive",
    name: "Adaptive Test",
    tagline: "10–24 questions · adjusts as you go",
    description:
      "Picks each question from how the previous ones went, aiming every item at your current estimate. That is where the information is, so it reaches a tighter, more confident result than a fixed paper of the same length — and stops as soon as it is sure enough.",
    categories: ["logical", "numerical", "pattern", "spatial", "verbal"],
    questionCount: 24,
    minQuestions: 10,
    targetStandardError: 4.9,
    adaptive: true,
    timeLimitSec: 20 * 60,
    difficultyProfile: BALANCED,
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
    id: "challenge",
    name: "Challenge Test",
    tagline: "30 questions · 35 minutes",
    description:
      "The hardest paper Modulo builds: full-spectrum, weighted towards the top two difficulty levels. Expect to miss several — the estimate is driven by which hard items you solve, not by finishing.",
    categories: ["logical", "numerical", "pattern", "spatial", "verbal"],
    questionCount: 30,
    timeLimitSec: 35 * 60,
    difficultyProfile: { 1: 0, 2: 1, 3: 3, 4: 4, 5: 3 },
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

export const FULL_SPECTRUM_TEST_IDS = ["quick", "standard", "challenge"] as const;

export function getTest(id: string): TestDefinition | undefined {
  return TESTS.find((t) => t.id === id);
}
