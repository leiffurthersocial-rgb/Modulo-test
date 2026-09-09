import { describe, expect, it } from "vitest";
import { QUESTION_BANK } from "@/lib/iq/bank";
import {
  DIFFICULTY_THRESHOLD,
  attemptConfidence,
  bandFor,
  estimateAbility,
  normalCdf,
  percentileFor,
  probabilityCorrect,
  scoreAttempt,
} from "@/lib/iq/scoring";
import type { Difficulty, Question, ResponseValue } from "@/lib/iq/types";

const items = (spec: [Difficulty, boolean][], guess = 0.25) =>
  spec.map(([difficulty, correct]) => ({ difficulty, correct, guess }));

function answerSheet(questions: readonly Question[], correctCount: number) {
  const responses: Record<string, ResponseValue> = {};
  questions.forEach((q, index) => {
    const wantCorrect = index < correctCount;
    if (q.answer.kind === "numeric") {
      responses[q.id] = wantCorrect ? q.answer.value : q.answer.value + 999;
    } else {
      const wrong = (q.answer.correctIndex + 1) % q.answer.options.length;
      responses[q.id] = wantCorrect ? q.answer.correctIndex : wrong;
    }
  });
  return responses;
}

describe("normal helpers", () => {
  it("puts the population mean at the 50th percentile", () => {
    expect(percentileFor(100)).toBeCloseTo(50, 0);
    expect(normalCdf(0)).toBeCloseTo(0.5, 5);
  });

  it("places one standard deviation near the 84th percentile", () => {
    expect(percentileFor(115)).toBeGreaterThan(83);
    expect(percentileFor(115)).toBeLessThan(85);
    expect(percentileFor(85)).toBeGreaterThan(15);
    expect(percentileFor(85)).toBeLessThan(17);
  });

  it("clamps the reported percentile away from 0 and 100", () => {
    expect(percentileFor(200)).toBeLessThanOrEqual(99.9);
    expect(percentileFor(10)).toBeGreaterThanOrEqual(0.1);
  });
});

describe("item response model", () => {
  it("gives a 50% genuine chance at the item threshold", () => {
    const p = probabilityCorrect(DIFFICULTY_THRESHOLD[3], DIFFICULTY_THRESHOLD[3], 0);
    expect(p).toBeCloseTo(0.5, 5);
  });

  it("is monotonic in ability", () => {
    const low = probabilityCorrect(80, DIFFICULTY_THRESHOLD[3], 0.25);
    const high = probabilityCorrect(130, DIFFICULTY_THRESHOLD[3], 0.25);
    expect(high).toBeGreaterThan(low);
  });

  it("never drops below the guessing rate", () => {
    expect(probabilityCorrect(40, DIFFICULTY_THRESHOLD[5], 0.25)).toBeGreaterThanOrEqual(0.25);
  });
});

describe("ability estimation", () => {
  it("returns the population mean with no items", () => {
    expect(estimateAbility([]).iq).toBe(100);
  });

  it("is not a percentage correct", () => {
    const half = estimateAbility(items([[1, true], [2, true], [3, false], [4, false]]));
    expect(half.iq).not.toBe(50);
    expect(half.iq).toBeGreaterThan(70);
    expect(half.iq).toBeLessThan(130);
  });

  it("increases monotonically as more items are answered correctly", () => {
    const scores = [0, 1, 2, 3, 4, 5].map(
      (n) =>
        estimateAbility(
          items(([1, 2, 3, 4, 5] as Difficulty[]).map((d, i) => [d, i < n])),
        ).iq,
    );
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]!).toBeGreaterThan(scores[i - 1]!);
    }
  });

  it("rewards a harder paper at the same accuracy", () => {
    const easySet = estimateAbility(items([[1, true], [1, true], [2, true], [2, true]])).iq;
    const hardSet = estimateAbility(items([[4, true], [4, true], [5, true], [5, true]])).iq;
    expect(hardSet).toBeGreaterThan(easySet);
  });

  it("treats an inconsistent pattern cautiously", () => {
    // Missing easy items while solving hard ones looks like lucky guessing, so
    // it must not outscore the consistent pattern with the same total.
    const consistent = estimateAbility(
      items([[1, true], [2, true], [4, false], [5, false]]),
    ).iq;
    const aberrant = estimateAbility(
      items([[1, false], [2, false], [4, true], [5, true]]),
    ).iq;
    expect(aberrant).toBeLessThan(consistent);
  });

  it("shrinks extreme patterns towards the population mean", () => {
    const perfect = estimateAbility(items([[5, true], [5, true]]));
    expect(perfect.iq).toBeLessThan(160);
    const none = estimateAbility(items([[1, false], [1, false]]));
    expect(none.iq).toBeGreaterThan(40);
  });

  it("reports a tighter standard error for longer tests", () => {
    const short = estimateAbility(items([[3, true], [3, false]]));
    const long = estimateAbility(
      items(Array.from({ length: 30 }, (_, i) => [((i % 5) + 1) as Difficulty, i % 2 === 0])),
    );
    expect(long.standardError).toBeLessThan(short.standardError);
  });
});

describe("bands", () => {
  it("labels the standard ranges", () => {
    expect(bandFor(80)).toBe("Below average");
    expect(bandFor(95)).toBe("Average");
    expect(bandFor(110)).toBe("Above average");
    expect(bandFor(120)).toBe("High");
    expect(bandFor(135)).toBe("Very high");
  });
});

describe("scoreAttempt", () => {
  const sample = QUESTION_BANK.slice(0, 20);

  it("scores a fully correct paper far above a fully wrong one", () => {
    const best = scoreAttempt(sample, answerSheet(sample, sample.length));
    const worst = scoreAttempt(sample, answerSheet(sample, 0));
    expect(best.iq).toBeGreaterThan(worst.iq + 40);
    expect(best.correct).toBe(sample.length);
    expect(worst.correct).toBe(0);
  });

  it("counts unanswered questions as incorrect but tracks them separately", () => {
    const result = scoreAttempt(sample, {});
    expect(result.correct).toBe(0);
    expect(result.answered).toBe(0);
    expect(result.total).toBe(sample.length);
  });

  it("produces a per-category breakdown that sums back to the total", () => {
    const result = scoreAttempt(sample, answerSheet(sample, 10));
    const totals = result.categories.reduce((sum, c) => sum + c.total, 0);
    const corrects = result.categories.reduce((sum, c) => sum + c.correct, 0);
    expect(totals).toBe(result.total);
    expect(corrects).toBe(result.correct);
  });

  it("withholds a domain score when there are too few items in that domain", () => {
    const twoItems = QUESTION_BANK.filter((q) => q.category === "verbal").slice(0, 2);
    const result = scoreAttempt(twoItems, answerSheet(twoItems, 2));
    const verbal = result.categories.find((c) => c.category === "verbal");
    expect(verbal?.reliable).toBe(false);
    expect(verbal?.score).toBeNull();
  });

  it("keeps the estimate inside the reportable range", () => {
    const best = scoreAttempt(sample, answerSheet(sample, sample.length));
    expect(best.iq).toBeLessThanOrEqual(145);
    expect(best.low).toBeLessThan(best.iq + 1);
    expect(best.high).toBeGreaterThan(best.iq - 1);
  });
});

describe("attemptConfidence", () => {
  const base = { iq: 112, low: 108, high: 116, total: 25, answered: 25, noveltyRatio: 1 };

  it("is high for a long, fully answered paper of fresh questions", () => {
    const c = attemptConfidence({ ...base, standardError: 3.2 });
    expect(c.percent).toBeGreaterThanOrEqual(72);
    expect(c.label).toBe("high");
    expect(c.reasons.join(" ")).toMatch(/full-length paper/i);
  });

  it("falls as the standard error widens", () => {
    const tight = attemptConfidence({ ...base, standardError: 3 }).percent;
    const loose = attemptConfidence({ ...base, standardError: 9 }).percent;
    expect(loose).toBeLessThan(tight);
  });

  it("is penalised by unanswered questions", () => {
    const full = attemptConfidence({ ...base, standardError: 4 }).percent;
    const partial = attemptConfidence({ ...base, standardError: 4, answered: 12 }).percent;
    expect(partial).toBeLessThan(full);
    expect(
      attemptConfidence({ ...base, standardError: 4, answered: 12 }).reasons.join(" "),
    ).toMatch(/unanswered/);
  });

  it("is penalised by recycled questions", () => {
    const fresh = attemptConfidence({ ...base, standardError: 4 }).percent;
    const stale = attemptConfidence({ ...base, standardError: 4, noveltyRatio: 0.1 }).percent;
    expect(stale).toBeLessThan(fresh);
    expect(
      attemptConfidence({ ...base, standardError: 4, noveltyRatio: 0.1 }).reasons.join(" "),
    ).toMatch(/recall/);
  });

  it("flags a short paper", () => {
    const c = attemptConfidence({ ...base, total: 12, answered: 12, standardError: 6 });
    expect(c.reasons.join(" ")).toMatch(/short paper/);
  });

  it("falls back to the reported interval when no standard error was stored", () => {
    // Attempts saved before the field existed must still get a usable figure.
    const c = attemptConfidence({ iq: 100, low: 95, high: 105, total: 25 });
    expect(c.margin).toBe(5);
    expect(c.percent).toBeGreaterThan(0);
    expect(c.percent).toBeLessThanOrEqual(100);
  });

  it("stays inside 0-100 for degenerate input", () => {
    const c = attemptConfidence({ iq: 100, low: 100, high: 100, total: 0, standardError: 99 });
    expect(c.percent).toBeGreaterThanOrEqual(0);
    expect(c.percent).toBeLessThanOrEqual(100);
  });
});
