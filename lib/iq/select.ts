import { shuffle, type Rng } from "@/lib/rng";
import { QUESTION_BANK } from "./bank";
import type { TestDefinition } from "./tests";
import type { Category, Difficulty, Question } from "./types";

export interface SelectionResult {
  questions: Question[];
  /** Share of the selected items the taker has never been served, 0–1. */
  noveltyRatio: number;
}

/** Expand a difficulty profile into one target difficulty per question slot. */
export function difficultyPlan(
  profile: Record<Difficulty, number>,
  count: number,
  rng: Rng,
): Difficulty[] {
  const levels = [1, 2, 3, 4, 5] as Difficulty[];
  const totalWeight = levels.reduce((sum, d) => sum + profile[d], 0);
  if (totalWeight <= 0) return Array.from({ length: count }, () => 3 as Difficulty);

  const plan: Difficulty[] = [];
  const remainders: { level: Difficulty; frac: number }[] = [];

  for (const level of levels) {
    const exact = (profile[level] / totalWeight) * count;
    const whole = Math.floor(exact);
    for (let i = 0; i < whole; i++) plan.push(level);
    remainders.push({ level, frac: exact - whole });
  }

  remainders.sort((a, b) => b.frac - a.frac);
  let i = 0;
  while (plan.length < count) {
    plan.push(remainders[i % remainders.length]!.level);
    i++;
  }

  return shuffle(plan.slice(0, count), rng);
}

/** Assign a category to every slot, spread as evenly as the count allows. */
export function categoryPlan(
  categories: readonly Category[],
  count: number,
  rng: Rng,
): Category[] {
  if (categories.length === 0) return [];
  const plan: Category[] = [];
  for (let i = 0; i < count; i++) {
    plan.push(categories[i % categories.length] as Category);
  }
  return shuffle(plan, rng);
}

/**
 * Pick the question set for one attempt.
 *
 * Unseen questions always beat seen ones, and among equals the closest
 * difficulty match wins, with the RNG breaking remaining ties. That gives a
 * different paper on every sitting while keeping the difficulty shape stable,
 * and it only recycles a question once the relevant pool is exhausted.
 */
export function selectQuestions(options: {
  test: TestDefinition;
  seen?: Readonly<Record<string, number>>;
  rng: Rng;
  bank?: readonly Question[];
}): SelectionResult {
  const { test, rng } = options;
  const seen = options.seen ?? {};
  const bank = options.bank ?? QUESTION_BANK;

  const pool = bank.filter((q) => test.categories.includes(q.category));
  const count = Math.min(test.questionCount, pool.length);

  const difficulties = difficultyPlan(test.difficultyProfile, count, rng);
  const cats = categoryPlan(test.categories, count, rng);

  const chosen: Question[] = [];
  const used = new Set<string>();

  for (let slot = 0; slot < count; slot++) {
    const wantedDifficulty = difficulties[slot] ?? 3;
    const wantedCategory = cats[slot];

    let best: Question | null = null;
    let bestScore = Infinity;

    for (const candidate of pool) {
      if (used.has(candidate.id)) continue;
      const seenCount = seen[candidate.id] ?? 0;
      const categoryMiss = wantedCategory && candidate.category !== wantedCategory ? 1 : 0;
      // The domain a slot asks for outranks novelty. If it did not, a category
      // whose items had all been served would simply vanish from a
      // full-spectrum paper — every unseen item from another domain would score
      // better — taking the per-domain breakdown with it. Repeating a question
      // is the lesser cost, and the attempt's novelty ratio already records it.
      const score =
        categoryMiss * 100000 +
        seenCount * 1000 +
        Math.abs(candidate.difficulty - wantedDifficulty) * 10 +
        rng();
      if (score < bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    if (!best) break;
    used.add(best.id);
    chosen.push(best);
  }

  const fresh = chosen.filter((q) => (seen[q.id] ?? 0) === 0).length;

  return {
    questions: shuffle(chosen, rng),
    noveltyRatio: chosen.length ? fresh / chosen.length : 1,
  };
}
