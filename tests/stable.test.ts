import { describe, expect, it } from "vitest";
import {
  breadthWeight,
  practiceDecay,
  reliabilityWeight,
  stableCategoryScores,
  stableEstimate,
  weightedMedian,
  type AttemptSummary,
} from "@/lib/iq/stable";

const attempt = (
  iq: number,
  index: number,
  overrides: Partial<AttemptSummary> = {},
): AttemptSummary => ({
  id: `a${index}`,
  testId: "standard",
  iq,
  itemCount: 25,
  categoryCount: 5,
  noveltyRatio: 1,
  completedAt: 1_700_000_000_000 + index * 86_400_000,
  ...overrides,
});

describe("weightedMedian", () => {
  it("returns null with no usable values", () => {
    expect(weightedMedian([])).toBeNull();
    expect(weightedMedian([{ value: 120, weight: 0 }])).toBeNull();
  });

  it("matches the plain median when weights are equal", () => {
    const values = [115, 121, 118].map((value) => ({ value, weight: 1 }));
    expect(weightedMedian(values)).toBe(118);
  });

  it("follows the weight rather than the count", () => {
    const values = [
      { value: 100, weight: 10 },
      { value: 140, weight: 1 },
      { value: 141, weight: 1 },
    ];
    expect(weightedMedian(values)).toBe(100);
  });
});

describe("attempt weights", () => {
  it("gives full-spectrum tests more weight than single-domain ones", () => {
    expect(breadthWeight(5)).toBeGreaterThan(breadthWeight(1));
  });

  it("gives longer tests more weight", () => {
    expect(reliabilityWeight(25)).toBeGreaterThan(reliabilityWeight(12));
  });

  it("reduces the weight of each successive retake", () => {
    expect(practiceDecay(0)).toBe(1);
    expect(practiceDecay(1)).toBeLessThan(practiceDecay(0));
    expect(practiceDecay(5)).toBeLessThan(practiceDecay(1));
  });
});

describe("stableEstimate", () => {
  it("has no estimate before any attempt", () => {
    expect(stableEstimate([]).iq).toBeNull();
  });

  it("returns the single attempt score when there is only one", () => {
    expect(stableEstimate([attempt(112, 0)]).iq).toBe(112);
  });

  it("settles near the middle of a set of attempts", () => {
    const result = stableEstimate([attempt(115, 0), attempt(121, 1), attempt(118, 2)]);
    expect(result.iq).toBe(118);
    expect(result.spread).toBe(6);
  });

  it("does not simply report the highest score", () => {
    const attempts = [attempt(102, 0), attempt(104, 1), attempt(138, 2)];
    const result = stableEstimate(attempts);
    expect(result.iq).toBeLessThan(138);
    expect(result.iq).toBeLessThanOrEqual(104);
  });

  it("resists inflation from a long run of improving retakes", () => {
    const rising = [100, 106, 112, 118, 124, 130, 136, 142].map((iq, i) =>
      attempt(iq, i, { noveltyRatio: Math.max(0.2, 1 - i * 0.15) }),
    );
    const result = stableEstimate(rising);
    const naiveMean = rising.reduce((s, a) => s + a.iq, 0) / rising.length;
    expect(result.iq!).toBeLessThan(Math.max(...rising.map((a) => a.iq)));
    expect(result.iq!).toBeLessThanOrEqual(naiveMean);
  });

  it("moves very little when yet another inflated retake is added", () => {
    const base = [110, 112, 111, 113].map((iq, i) => attempt(iq, i));
    const before = stableEstimate(base).iq!;
    const after = stableEstimate([
      ...base,
      attempt(145, 4, { noveltyRatio: 0.1 }),
      attempt(145, 5, { noveltyRatio: 0.1 }),
    ]).iq!;
    expect(Math.abs(after - before)).toBeLessThanOrEqual(2);
  });

  it("discounts attempts made up of already-seen questions", () => {
    const fresh = stableEstimate([attempt(100, 0), attempt(130, 1, { noveltyRatio: 1 })]);
    const stale = stableEstimate([attempt(100, 0), attempt(130, 1, { noveltyRatio: 0 })]);
    expect(stale.totalWeight).toBeLessThan(fresh.totalWeight);
  });

  it("reports rising confidence as evidence accumulates", () => {
    expect(stableEstimate([]).confidence).toBe("low");
    expect(stableEstimate([attempt(110, 0)]).confidence).toBe("moderate");
    expect(
      stableEstimate([attempt(110, 0), attempt(112, 1), attempt(111, 2), attempt(113, 3)])
        .confidence,
    ).toBe("high");
  });

  it("aggregates per-domain scores across attempts", () => {
    const withDomains = [
      attempt(110, 0, { categoryScores: { logical: 112, verbal: 104 } }),
      attempt(114, 1, { categoryScores: { logical: 118, verbal: 106 } }),
    ];
    const domains = stableCategoryScores(withDomains);
    expect(domains.logical).toBeGreaterThanOrEqual(112);
    expect(domains.verbal).toBeGreaterThanOrEqual(104);
    expect(domains.spatial).toBeUndefined();
  });
});
