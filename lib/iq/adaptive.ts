import { pick, shuffle, type Rng } from "@/lib/rng";
import { QUESTION_BANK } from "./bank";
import { DIFFICULTY_THRESHOLD, estimateAbility, itemInformation } from "./scoring";
import type { TestDefinition } from "./tests";
import {
  CATEGORIES,
  guessRate,
  isCorrect,
  type Category,
  type Question,
  type ResponseValue,
} from "./types";

/**
 * Adaptive testing.
 *
 * A fixed paper spends most of its questions in the wrong place: a strong taker
 * wastes time on items he was always going to solve, and a weaker one grinds
 * through items he was never going to. Neither tells you much, because an item
 * only carries information about ability near its own difficulty.
 *
 * So the adaptive test re-estimates ability after every answer and asks next
 * whichever unseen item carries the most information *at that estimate*. The
 * practical effect is a much tighter standard error for the same number of
 * questions — which is why an adaptive attempt reports higher confidence than a
 * fixed one of equal length, rather than because the number has been inflated.
 *
 * It stops when the standard error reaches the test's target or the maximum
 * length is hit, whichever comes first, so a decisive taker finishes sooner.
 */

/** Candidates are drawn from the top few by information, not always the single best. */
const RANDOMESQUE_POOL = 4;

export interface AdaptiveState {
  ability: number;
  standardError: number;
  answered: number;
}

export function estimateFromResponses(
  questions: readonly Question[],
  responses: Readonly<Record<string, ResponseValue>>,
): AdaptiveState {
  const answered = questions.filter((q) => (responses[q.id] ?? null) !== null);
  const estimate = estimateAbility(
    answered.map((q) => ({
      difficulty: q.difficulty,
      correct: isCorrect(q, responses[q.id] ?? null),
      guess: guessRate(q),
    })),
  );
  return {
    ability: estimate.iq,
    standardError: estimate.standardError,
    answered: answered.length,
  };
}

/**
 * The next question to ask.
 *
 * Unseen items beat previously served ones outright — a recycled item measures
 * memory rather than reasoning — and among those, the most informative at the
 * current estimate wins. A small random draw from the top few keeps two takers
 * of similar ability from receiving identical papers.
 */
export function selectAdaptiveQuestion(options: {
  pool: readonly Question[];
  usedIds: ReadonlySet<string>;
  ability: number;
  seen?: Readonly<Record<string, number>>;
  rng: Rng;
  /** Categories asked so far, so coverage can be balanced as it goes. */
  asked?: readonly Category[];
  /** Domains the test is allowed to draw from. */
  categories?: readonly Category[];
}): Question | null {
  const { pool, usedIds, ability, rng } = options;
  const seen = options.seen ?? {};

  const available = pool.filter((q) => !usedIds.has(q.id));
  if (available.length === 0) return null;

  // Content balancing. Pure information-maximising would happily serve eight
  // pattern items in a row if those happened to sit nearest the estimate, which
  // would wreck the per-domain breakdown and narrow what the score even means.
  // Categories that are behind on coverage are preferred first.
  const asked = options.asked ?? [];
  const domains = options.categories ?? CATEGORIES;
  const counts = new Map<Category, number>(domains.map((c) => [c, 0]));
  for (const category of asked) {
    if (counts.has(category)) counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  const fewest = Math.min(...domains.map((c) => counts.get(c) ?? 0));

  const scored = available.map((question) => {
    const information = itemInformation(
      ability,
      DIFFICULTY_THRESHOLD[question.difficulty],
      guessRate(question),
    );
    const freshness = (seen[question.id] ?? 0) === 0 ? 1 : 0;
    const owed = (counts.get(question.category) ?? 0) === fewest ? 1 : 0;
    return { question, information, freshness, owed };
  });

  scored.sort(
    (a, b) => b.freshness - a.freshness || b.owed - a.owed || b.information - a.information,
  );

  const top = scored.slice(0, Math.min(RANDOMESQUE_POOL, scored.length));
  return pick(shuffle(top, rng), rng).question;
}

export function adaptiveShouldStop(state: AdaptiveState, test: TestDefinition): boolean {
  const min = test.minQuestions ?? 8;
  const max = test.questionCount;
  if (state.answered >= max) return true;
  if (state.answered < min) return false;
  return state.standardError <= (test.targetStandardError ?? 3.5);
}

/** Difficulty to open with: the middle of the scale, where we know least. */
export function openingAbility(): number {
  return 100;
}

/**
 * The first question of an adaptive attempt.
 *
 * Nothing is known yet, so the opening item is drawn from the middle of the
 * scale, where an answer either way is most informative about a taker who could
 * be anywhere.
 */
export function adaptiveOpening(
  test: TestDefinition,
  seen: Readonly<Record<string, number>>,
  rng: Rng,
  bank: readonly Question[] = QUESTION_BANK,
): Question[] {
  const pool = bank.filter((q) => test.categories.includes(q.category));
  const first = selectAdaptiveQuestion({
    pool,
    usedIds: new Set<string>(),
    ability: openingAbility(),
    seen,
    rng,
    categories: test.categories,
  });
  return first ? [first] : [];
}
