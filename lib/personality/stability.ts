import { TRAITS, type Trait } from "./types";

/**
 * Comparing a retake with the previous profile.
 *
 * Traits are supposed to be reasonably stable, so a large swing is worth
 * surfacing: it usually means mood, context or reading of the statements
 * changed rather than the person. This is the personality-side counterpart to
 * the IQ stability estimate — the point in both cases is that a single sitting
 * is weaker evidence than it looks.
 */

export interface TraitShift {
  trait: Trait;
  before: number;
  after: number;
  delta: number;
}

export interface StabilityReport {
  shifts: TraitShift[];
  /** Mean absolute change across all nine traits, in points. */
  meanAbsoluteChange: number;
  /** Correlation between the two profiles, −1 to 1. */
  agreement: number;
  verdict: "stable" | "shifted" | "unstable";
  sameArchetype: boolean;
}

function correlation(a: number[], b: number[]): number {
  const n = a.length;
  if (n < 2) return 1;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let devA = 0;
  let devB = 0;
  for (let i = 0; i < n; i++) {
    const da = (a[i] as number) - meanA;
    const db = (b[i] as number) - meanB;
    num += da * db;
    devA += da * da;
    devB += db * db;
  }
  const denom = Math.sqrt(devA * devB);
  return denom < 1e-9 ? 0 : num / denom;
}

export function compareProfiles(
  before: Record<Trait, number>,
  after: Record<Trait, number>,
  options: { sameArchetype: boolean },
): StabilityReport {
  const shifts: TraitShift[] = TRAITS.map((trait) => ({
    trait,
    before: before[trait],
    after: after[trait],
    delta: Math.round((after[trait] - before[trait]) * 10) / 10,
  })).sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));

  const meanAbsoluteChange =
    shifts.reduce((sum, s) => sum + Math.abs(s.delta), 0) / shifts.length;

  const agreement = correlation(
    TRAITS.map((t) => before[t]),
    TRAITS.map((t) => after[t]),
  );

  const verdict: StabilityReport["verdict"] =
    agreement >= 0.8 && meanAbsoluteChange < 10
      ? "stable"
      : agreement >= 0.5
        ? "shifted"
        : "unstable";

  return {
    shifts,
    meanAbsoluteChange: Math.round(meanAbsoluteChange * 10) / 10,
    agreement: Math.round(agreement * 100) / 100,
    verdict,
    sameArchetype: options.sameArchetype,
  };
}

export const STABILITY_BLURBS: Record<StabilityReport["verdict"], string> = {
  stable:
    "Your two profiles agree closely. Traits that reproduce across sittings are the ones worth taking seriously.",
  shifted:
    "The overall shape held, but several traits moved noticeably. Mood, recent events and how you read the statements all move these numbers.",
  unstable:
    "The two profiles disagree substantially. That usually means one of the sittings was answered quickly rather than that you changed — the earlier, more considered one is the better guide.",
};
