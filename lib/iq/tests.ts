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
      "The full-spectrum assessment. Enough items in every domain to produce a per-domain breakdown and the tightest fixed-length estimate Modulo offers.",
    categories: ["logical", "numerical", "pattern", "spatial", "verbal"],
    questionCount: 25,
    timeLimitSec: 25 * 60,
    difficultyProfile: BALANCED,
  },
];

export const FULL_SPECTRUM_TEST_IDS = ["quick", "standard", "adaptive"] as const;

export function getTest(id: string): TestDefinition | undefined {
  return TESTS.find((t) => t.id === id);
}
