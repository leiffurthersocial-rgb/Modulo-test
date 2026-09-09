import type { LikertValue, PersonalityItem, Trait } from "./types";
import { TRAITS } from "./types";

/**
 * Response-quality diagnostics.
 *
 * A self-report questionnaire will happily return a confident-looking profile
 * from answers that were not really given: a column of 4s, a run of neutrals, or
 * a taker who agrees both that they take charge and that they avoid doing so.
 * None of that is detectable from the trait scores alone, so it is measured
 * here and reported to the taker rather than quietly folded into the result.
 */

export type QualityLevel = "good" | "fair" | "questionable";

export interface QualityFlag {
  code: "straight-lining" | "inconsistent" | "low-variation" | "midpoint" | "incomplete";
  label: string;
  detail: string;
}

export interface ResponseQuality {
  level: QualityLevel;
  flags: QualityFlag[];
  /** Longest run of identical consecutive answers. */
  longestRun: number;
  /** Standard deviation of all answers, 0 (identical) to ~2. */
  variation: number;
  /** Share of answers on the neutral midpoint, 0–1. */
  midpointShare: number;
  /**
   * Mean disagreement between a trait's forward and reversed items, in scale
   * points. 0 = perfectly consistent, 4 = flatly contradictory.
   */
  inconsistency: number;
  /** Per-trait inconsistency, for flagging which traits to trust less. */
  traitInconsistency: Partial<Record<Trait, number>>;
  answered: number;
  total: number;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export function assessQuality(
  responses: Readonly<Record<string, LikertValue | undefined>>,
  items: readonly PersonalityItem[],
): ResponseQuality {
  const answers = items.map((i) => responses[i.id]);
  const given = answers.filter((v): v is LikertValue => v !== undefined);

  let longestRun = 0;
  let run = 0;
  for (let i = 0; i < answers.length; i++) {
    if (answers[i] !== undefined && answers[i] === answers[i - 1]) run += 1;
    else run = 1;
    longestRun = Math.max(longestRun, run);
  }

  const variation = standardDeviation(given);
  const midpointShare = given.length ? given.filter((v) => v === 3).length / given.length : 0;

  // Someone answering honestly should agree with a trait's forward items about
  // as much as they disagree with its reversed ones. The gap is the signal.
  const traitInconsistency: Partial<Record<Trait, number>> = {};
  const gaps: number[] = [];
  for (const trait of TRAITS) {
    const forTrait = items.filter((i) => i.trait === trait);
    const forward = forTrait
      .filter((i) => !i.reverse)
      .map((i) => responses[i.id])
      .filter((v): v is LikertValue => v !== undefined);
    const reverse = forTrait
      .filter((i) => i.reverse)
      .map((i) => responses[i.id])
      .filter((v): v is LikertValue => v !== undefined);
    if (forward.length === 0 || reverse.length === 0) continue;
    // Reversed items are re-keyed so both means point the same way.
    const gap = Math.abs(mean(forward) - (6 - mean(reverse)));
    traitInconsistency[trait] = Math.round(gap * 100) / 100;
    gaps.push(gap);
  }
  const inconsistency = Math.round(mean(gaps) * 100) / 100;

  const flags: QualityFlag[] = [];

  if (given.length < items.length) {
    flags.push({
      code: "incomplete",
      label: "Incomplete",
      detail: `${items.length - given.length} statement${items.length - given.length === 1 ? " was" : "s were"} left unanswered and scored as neutral.`,
    });
  }

  // A long run of identical answers is only suspicious when the answers overall
  // carry little variation. Someone who is genuinely extreme on most traits
  // produces long runs honestly — statements are interleaved by trait, so
  // consecutive items often share a direction — and must not be accused of
  // careless responding when their forward and reversed items agree perfectly.
  if (longestRun >= 8 && variation < 1.0) {
    flags.push({
      code: "straight-lining",
      label: "Long run of identical answers",
      detail: `${longestRun} statements in a row got the same response, with little variation elsewhere. Because reversed statements are mixed throughout, that pattern cannot describe a consistent person.`,
    });
  }

  if (given.length >= 10 && variation < 0.6) {
    flags.push({
      code: "low-variation",
      label: "Very little variation",
      detail: "Nearly every statement got the same rating, which leaves too little signal to separate the traits.",
    });
  }

  if (midpointShare > 0.55) {
    flags.push({
      code: "midpoint",
      label: "Mostly neutral",
      detail: `${Math.round(midpointShare * 100)}% of answers sat on the midpoint, so the profile is close to flat by construction.`,
    });
  }

  if (inconsistency >= 1.5) {
    flags.push({
      code: "inconsistent",
      label: "Contradictory answers",
      detail: `Forward and reversed statements about the same trait disagree by ${inconsistency.toFixed(1)} points on average. Somewhere the statements were read as asking different things.`,
    });
  }

  const severe = flags.some((f) =>
    ["straight-lining", "low-variation", "inconsistent"].includes(f.code),
  );
  const level: QualityLevel = severe
    ? "questionable"
    : flags.length > 0
      ? "fair"
      : "good";

  return {
    level,
    flags,
    longestRun,
    variation: Math.round(variation * 100) / 100,
    midpointShare: Math.round(midpointShare * 100) / 100,
    inconsistency,
    traitInconsistency,
    answered: given.length,
    total: items.length,
  };
}

export const QUALITY_BLURBS: Record<QualityLevel, string> = {
  good: "Your answers vary and the forward and reversed statements agree with one another, which is what a considered set of responses looks like.",
  fair: "Your answers are usable, but one pattern below is worth knowing about when you read the result.",
  questionable:
    "The response pattern below makes this profile unreliable. It is still shown, but treat it as a rough sketch and consider retaking with more attention to each statement.",
};
