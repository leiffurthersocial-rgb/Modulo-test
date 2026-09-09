import type { Category } from "./types";

/**
 * Combining repeated attempts.
 *
 * Taking the same style of test again and again produces a practice effect, so
 * a naive "best score" or even a plain mean rewards persistence rather than
 * ability. Modulo instead reports a *weighted median* of every attempt. The
 * median resists a single lucky run, and the weights shrink an attempt's
 * influence when it:
 *
 *   - covers few cognitive domains (a single-category test is narrow evidence),
 *   - contains few items (less information),
 *   - reuses questions the taker has already seen (memory, not reasoning),
 *   - comes later in a long series of retakes (practice effect).
 *
 * The result is that the estimate settles rather than climbing with each sitting.
 */

export interface AttemptSummary {
  id: string;
  testId: string;
  iq: number;
  itemCount: number;
  /** How many of the five domains the attempt sampled. */
  categoryCount: number;
  /** Share of items the taker had never been served before, 0–1. */
  noveltyRatio: number;
  completedAt: number;
  categoryScores?: Partial<Record<Category, number>>;
}

export interface WeightedAttempt {
  attempt: AttemptSummary;
  weight: number;
  breadth: number;
  reliability: number;
  novelty: number;
  practiceDecay: number;
}

export type Confidence = "low" | "moderate" | "high";

export interface StableEstimate {
  iq: number | null;
  attempts: number;
  totalWeight: number;
  confidence: Confidence;
  spread: number;
  weighted: WeightedAttempt[];
}

/** Narrow tests carry less weight than full-spectrum ones. */
export function breadthWeight(categoryCount: number): number {
  const clamped = Math.min(5, Math.max(1, categoryCount));
  return 0.5 + 0.125 * (clamped - 1);
}

/** More items, more information — saturating around 0.8 for a 40-item test. */
export function reliabilityWeight(itemCount: number): number {
  return itemCount / (itemCount + 10);
}

/** Repeated questions measure recall, so novelty is floored rather than zeroed. */
export function noveltyWeight(noveltyRatio: number): number {
  return Math.max(0.35, Math.min(1, noveltyRatio));
}

/** Later retakes count for progressively less. `rank` is 0-based chronological. */
export function practiceDecay(rank: number): number {
  return 1 / (1 + 0.5 * rank);
}

export function weighAttempts(attempts: readonly AttemptSummary[]): WeightedAttempt[] {
  const chronological = [...attempts].sort((a, b) => a.completedAt - b.completedAt);
  return chronological.map((attempt, rank) => {
    const breadth = breadthWeight(attempt.categoryCount);
    const reliability = reliabilityWeight(attempt.itemCount);
    const novelty = noveltyWeight(attempt.noveltyRatio);
    const decay = practiceDecay(rank);
    return {
      attempt,
      breadth,
      reliability,
      novelty,
      practiceDecay: decay,
      weight: breadth * reliability * novelty * decay,
    };
  });
}

/**
 * Lower weighted median: the first value at which the running weight reaches
 * half of the total. Deliberately not interpolated — interpolation would drag
 * the estimate towards whichever tail happens to be heavier.
 */
export function weightedMedian(
  values: readonly { value: number; weight: number }[],
): number | null {
  const usable = values.filter((v) => v.weight > 0 && Number.isFinite(v.value));
  if (usable.length === 0) return null;

  const sorted = [...usable].sort((a, b) => a.value - b.value);
  const total = sorted.reduce((sum, v) => sum + v.weight, 0);
  const half = total / 2;

  let running = 0;
  for (const entry of sorted) {
    running += entry.weight;
    if (running >= half) return entry.value;
  }
  return sorted[sorted.length - 1]?.value ?? null;
}

export function confidenceFor(totalWeight: number, attempts: number): Confidence {
  if (attempts === 0) return "low";
  if (totalWeight >= 1.6 && attempts >= 3) return "high";
  if (totalWeight >= 0.7) return "moderate";
  return "low";
}

export function stableEstimate(attempts: readonly AttemptSummary[]): StableEstimate {
  const weighted = weighAttempts(attempts);
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  const iq = weightedMedian(
    weighted.map((w) => ({ value: w.attempt.iq, weight: w.weight })),
  );
  const scores = attempts.map((a) => a.iq);

  return {
    iq,
    attempts: attempts.length,
    totalWeight: Math.round(totalWeight * 1000) / 1000,
    confidence: confidenceFor(totalWeight, attempts.length),
    spread: scores.length ? Math.max(...scores) - Math.min(...scores) : 0,
    weighted,
  };
}

/** Weighted-median domain scores across every attempt that measured them. */
export function stableCategoryScores(
  attempts: readonly AttemptSummary[],
): Partial<Record<Category, number>> {
  const weighted = weighAttempts(attempts);
  const buckets = new Map<Category, { value: number; weight: number }[]>();

  for (const { attempt, weight } of weighted) {
    for (const [category, score] of Object.entries(attempt.categoryScores ?? {})) {
      if (typeof score !== "number") continue;
      const key = category as Category;
      const list = buckets.get(key) ?? [];
      list.push({ value: score, weight });
      buckets.set(key, list);
    }
  }

  const out: Partial<Record<Category, number>> = {};
  for (const [category, values] of buckets) {
    const median = weightedMedian(values);
    if (median !== null) out[category] = median;
  }
  return out;
}
