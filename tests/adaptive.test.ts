import { describe, expect, it } from "vitest";
import {
  adaptiveOpening,
  adaptiveShouldStop,
  estimateFromResponses,
  selectAdaptiveQuestion,
} from "@/lib/iq/adaptive";
import { QUESTION_BANK } from "@/lib/iq/bank";
import {
  DIFFICULTY_THRESHOLD,
  MAX_ABILITY,
  MIN_ABILITY,
  attemptConfidence,
  itemInformation,
  probabilityCorrect,
  scoreAttempt,
} from "@/lib/iq/scoring";
import { selectQuestions } from "@/lib/iq/select";
import { getTest } from "@/lib/iq/tests";
import {
  guessRate,
  type Category,
  type Question,
  type ResponseValue,
} from "@/lib/iq/types";
import { createRng, type Rng } from "@/lib/rng";

const adaptive = getTest("adaptive")!;
const pool = QUESTION_BANK.filter((q) => adaptive.categories.includes(q.category));

/** A simulated taker of known true ability. */
function respond(question: Question, trueAbility: number, rng: Rng): ResponseValue {
  const p = probabilityCorrect(
    trueAbility,
    DIFFICULTY_THRESHOLD[question.difficulty],
    guessRate(question),
  );
  const correct = rng() < p;
  if (question.answer.kind === "numeric") {
    return correct ? question.answer.value : question.answer.value + 7;
  }
  return correct
    ? question.answer.correctIndex
    : (question.answer.correctIndex + 1) % question.answer.options.length;
}

/** Run a full adaptive attempt exactly as the runner does. */
function runFor(test: typeof adaptive, trueAbility: number, seed: number) {
  const rng = createRng(seed);
  const used = new Set<string>();
  const asked: Question[] = [];
  const responses: Record<string, ResponseValue> = {};
  let state = { ability: 100, standardError: 15, answered: 0 };

  while (!adaptiveShouldStop(state, test)) {
    const next = selectAdaptiveQuestion({
      pool,
      usedIds: used,
      ability: state.ability,
      rng,
      asked: asked.map((q) => q.category as Category),
      categories: test.categories,
    });
    if (!next) break;
    used.add(next.id);
    asked.push(next);
    responses[next.id] = respond(next, trueAbility, rng);
    state = estimateFromResponses(asked, responses);
  }
  return { asked, responses, score: scoreAttempt(asked, responses) };
}

const runAdaptive = (trueAbility: number, seed: number) =>
  runFor(adaptive, trueAbility, seed);

describe("item information", () => {
  it("peaks near the item's own difficulty", () => {
    const threshold = DIFFICULTY_THRESHOLD[3];
    const atThreshold = itemInformation(threshold, threshold, 0.25);
    expect(atThreshold).toBeGreaterThan(itemInformation(threshold - 40, threshold, 0.25));
    expect(atThreshold).toBeGreaterThan(itemInformation(threshold + 40, threshold, 0.25));
  });

  it("is never negative", () => {
    for (const ability of [40, 70, 100, 130, 170]) {
      for (const d of [1, 2, 3, 4, 5] as const) {
        expect(itemInformation(ability, DIFFICULTY_THRESHOLD[d], 0.25)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("adaptive selection", () => {
  it("opens with a single question from the middle of the scale", () => {
    const opening = adaptiveOpening(adaptive, {}, createRng(3));
    expect(opening).toHaveLength(1);
    expect(opening[0]!.difficulty).toBeLessThanOrEqual(4);
    expect(opening[0]!.difficulty).toBeGreaterThanOrEqual(2);
  });

  it("asks harder questions of a stronger taker", () => {
    const easy = selectAdaptiveQuestion({ pool, usedIds: new Set(), ability: 70, rng: createRng(1) });
    const hard = selectAdaptiveQuestion({ pool, usedIds: new Set(), ability: 145, rng: createRng(1) });
    expect(hard!.difficulty).toBeGreaterThan(easy!.difficulty);
  });

  it("never repeats a question within an attempt", () => {
    const { asked } = runAdaptive(110, 17);
    expect(new Set(asked.map((q) => q.id)).size).toBe(asked.length);
  });

  it("prefers questions the taker has not been served before", () => {
    const seen = Object.fromEntries(pool.slice(0, 200).map((q) => [q.id, 3]));
    const chosen = selectAdaptiveQuestion({
      pool,
      usedIds: new Set(),
      ability: 100,
      seen,
      rng: createRng(5),
    });
    expect(seen[chosen!.id]).toBeUndefined();
  });

  it("balances coverage across the domains rather than chasing information alone", () => {
    // Pure information-maximising would happily serve one domain repeatedly.
    for (const trueAbility of [85, 105, 125]) {
      const { asked } = runAdaptive(trueAbility, trueAbility * 31);
      const domains = new Set(asked.map((q) => q.category));
      expect(domains.size, `true ${trueAbility}`).toBe(5);
    }
  });

  it("returns null when the pool is exhausted", () => {
    const used = new Set(pool.map((q) => q.id));
    expect(selectAdaptiveQuestion({ pool, usedIds: used, ability: 100, rng: createRng(1) })).toBeNull();
  });
});

describe("stopping rule", () => {
  it("never stops before the minimum length", () => {
    expect(adaptiveShouldStop({ ability: 100, standardError: 0.1, answered: 3 }, adaptive)).toBe(false);
  });

  it("stops once the estimate is precise enough", () => {
    const min = adaptive.minQuestions ?? 10;
    expect(adaptiveShouldStop({ ability: 100, standardError: 1, answered: min }, adaptive)).toBe(true);
  });

  it("always stops at the maximum length", () => {
    expect(
      adaptiveShouldStop(
        { ability: 100, standardError: 15, answered: adaptive.questionCount },
        adaptive,
      ),
    ).toBe(true);
  });
});

describe("adaptive accuracy against a fixed paper", () => {
  /** Mean absolute error and standard error over many simulated takers. */
  function measure(trueAbility: number, runs = 40) {
    let adaptiveError = 0;
    let adaptiveSe = 0;
    let fixedError = 0;
    let fixedSe = 0;
    const quick = getTest("quick")!;

    for (let run = 0; run < runs; run++) {
      const { score } = runAdaptive(trueAbility, run * 977 + trueAbility);
      adaptiveError += Math.abs(score.iq - trueAbility);
      adaptiveSe += score.standardError;

      const rng = createRng(run * 331 + trueAbility);
      const { questions } = selectQuestions({ test: quick, rng: createRng(run * 331) });
      const responses: Record<string, ResponseValue> = {};
      for (const q of questions) responses[q.id] = respond(q, trueAbility, rng);
      const fixed = scoreAttempt(questions, responses);
      fixedError += Math.abs(fixed.iq - trueAbility);
      fixedSe += fixed.standardError;
    }
    return {
      adaptiveError: adaptiveError / runs,
      adaptiveSe: adaptiveSe / runs,
      fixedError: fixedError / runs,
      fixedSe: fixedSe / runs,
    };
  }

  it("estimates more precisely than the fixed short test", () => {
    // Standard error is the direct claim and holds at every ability with a wide
    // margin. Mean absolute error is a noisier statistic — at 40 runs per point
    // it can tie by coincidence — so it is pooled across abilities for a larger
    // sample rather than asserted strictly at each one, which would flake.
    let adaptiveError = 0;
    let fixedError = 0;
    const abilities = [90, 110, 130];

    for (const trueAbility of abilities) {
      const r = measure(trueAbility);
      expect(r.adaptiveSe, `SE at true ${trueAbility}`).toBeLessThan(r.fixedSe);
      expect(r.adaptiveError, `error at true ${trueAbility}`).toBeLessThanOrEqual(
        r.fixedError,
      );
      adaptiveError += r.adaptiveError;
      fixedError += r.fixedError;
    }

    expect(adaptiveError / abilities.length).toBeLessThan(
      fixedError / abilities.length,
    );
  });

  it("is far more accurate at the top of the range, where a fixed paper runs out of hard items", () => {
    const r = measure(145);
    expect(r.adaptiveError).toBeLessThan(r.fixedError / 2);
  });

  it("recovers the true ability within a few points on average", () => {
    for (const trueAbility of [85, 100, 115]) {
      expect(measure(trueAbility, 30).adaptiveError, `true ${trueAbility}`).toBeLessThan(6);
    }
  });

  it("earns a higher confidence figure than the fixed short test", () => {
    const conf = (score: { standardError: number; total: number }) =>
      attemptConfidence({
        iq: 100, low: 95, high: 105,
        standardError: score.standardError,
        total: score.total, answered: score.total, noveltyRatio: 1,
      }).percent;
    const { score } = runAdaptive(110, 4242);
    const quick = getTest("quick")!;
    const rng = createRng(99);
    const { questions } = selectQuestions({ test: quick, rng: createRng(99) });
    const responses: Record<string, ResponseValue> = {};
    for (const q of questions) responses[q.id] = respond(q, 110, rng);
    expect(conf(score)).toBeGreaterThan(conf(scoreAttempt(questions, responses)));
  });
});

describe("the widened reportable range", () => {
  it("reaches well above the old 145 ceiling on a strong paper", () => {
    const hardest = QUESTION_BANK.filter((q) => q.difficulty >= 4).slice(0, 30);
    const perfect: Record<string, ResponseValue> = {};
    for (const q of hardest) {
      perfect[q.id] = q.answer.kind === "numeric" ? q.answer.value : q.answer.correctIndex;
    }
    expect(scoreAttempt(hardest, perfect).iq).toBeGreaterThan(145);
  });

  it("bottoms out well above the grid floor, because guessing hides low ability", () => {
    // With four-option items a taker who knows nothing still scores about 25%,
    // so the likelihood stops separating very low abilities and the prior takes
    // over. The reported floor is therefore a property of the format, not a
    // clamp — and it is worth knowing that the bottom of the scale is blunt.
    const easiest = QUESTION_BANK.filter((q) => q.difficulty <= 2).slice(0, 30);
    const allWrong: Record<string, ResponseValue> = {};
    for (const q of easiest) {
      allWrong[q.id] = q.answer.kind === "numeric" ? q.answer.value + 99 : null;
    }
    const score = scoreAttempt(easiest, allWrong);
    expect(score.iq).toBeLessThan(70);
    expect(score.iq).toBeGreaterThan(MIN_ABILITY);
  });

  it("still refuses to report beyond the calibrated range", () => {
    const hardest = QUESTION_BANK.filter((q) => q.difficulty === 5);
    const perfect: Record<string, ResponseValue> = {};
    for (const q of hardest) {
      perfect[q.id] = q.answer.kind === "numeric" ? q.answer.value : q.answer.correctIndex;
    }
    const score = scoreAttempt(hardest, perfect);
    expect(score.iq).toBeLessThanOrEqual(MAX_ABILITY);
    expect(score.iq).toBeGreaterThanOrEqual(MIN_ABILITY);
  });
});

describe("the quick adaptive test", () => {
  const quickAdaptive = getTest("quick-adaptive")!;

  it("is declared shorter than the full adaptive test", () => {
    expect(quickAdaptive.adaptive).toBe(true);
    expect(quickAdaptive.questionCount).toBeLessThan(adaptive.questionCount);
    expect(quickAdaptive.minQuestions!).toBeLessThan(adaptive.minQuestions!);
    // A shorter test cannot reach the same precision, and says so rather than
    // promising a target it can never hit and running to the maximum every time.
    expect(quickAdaptive.targetStandardError!).toBeGreaterThan(
      adaptive.targetStandardError!,
    );
  });

  it("stays inside its declared length, and sometimes stops early", () => {
    const lengths = new Set<number>();
    for (const trueAbility of [80, 95, 110, 125, 140]) {
      for (let run = 0; run < 8; run++) {
        const { asked } = runFor(quickAdaptive, trueAbility, run * 613 + trueAbility);
        expect(asked.length).toBeGreaterThanOrEqual(quickAdaptive.minQuestions!);
        expect(asked.length).toBeLessThanOrEqual(quickAdaptive.questionCount);
        lengths.add(asked.length);
      }
    }
    // If it always ran to the maximum, the stopping rule would be decorative.
    expect(lengths.size).toBeGreaterThan(1);
    expect(Math.min(...lengths)).toBeLessThan(quickAdaptive.questionCount);
  });

  it("still covers all five domains despite being short", () => {
    for (const trueAbility of [85, 105, 130]) {
      const { asked } = runFor(quickAdaptive, trueAbility, trueAbility * 71);
      expect(new Set(asked.map((q) => q.category)).size, `true ${trueAbility}`).toBe(5);
    }
  });

  it("beats the fixed Quick test it replaces, at no greater length", () => {
    const quick = getTest("quick")!;
    let adaptiveError = 0;
    let adaptiveSe = 0;
    let adaptiveLength = 0;
    let fixedError = 0;
    let fixedSe = 0;
    const abilities = [80, 100, 120, 140];
    const runs = 12;

    for (const trueAbility of abilities) {
      for (let run = 0; run < runs; run++) {
        const { asked, responses } = runFor(quickAdaptive, trueAbility, run * 977 + trueAbility);
        const score = scoreAttempt(asked, responses);
        adaptiveError += Math.abs(score.iq - trueAbility);
        adaptiveSe += score.standardError;
        adaptiveLength += asked.length;

        const rng = createRng(run * 331 + trueAbility);
        const { questions } = selectQuestions({ test: quick, rng: createRng(run * 331) });
        const fixedResponses: Record<string, ResponseValue> = {};
        for (const q of questions) fixedResponses[q.id] = respond(q, trueAbility, rng);
        const fixed = scoreAttempt(questions, fixedResponses);
        fixedError += Math.abs(fixed.iq - trueAbility);
        fixedSe += fixed.standardError;
      }
    }
    const n = abilities.length * runs;
    expect(adaptiveSe / n).toBeLessThan(fixedSe / n);
    expect(adaptiveError / n).toBeLessThan(fixedError / n);
    expect(adaptiveLength / n).toBeLessThanOrEqual(quick.questionCount);
  });

  it("is less precise than the full adaptive test, as its length implies", () => {
    const se = (test: typeof adaptive) => {
      let total = 0;
      for (let run = 0; run < 12; run++) {
        const { asked, responses } = runFor(test, 110, run * 149);
        total += scoreAttempt(asked, responses).standardError;
      }
      return total / 12;
    };
    expect(se(quickAdaptive)).toBeGreaterThan(se(adaptive));
  });
});
