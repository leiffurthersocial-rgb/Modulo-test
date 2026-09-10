import { describe, expect, it } from "vitest";
import { QUESTION_BANK } from "@/lib/iq/bank";
import { optionOrder, presentQuestion, presentQuestions } from "@/lib/iq/present";
import { selectQuestions } from "@/lib/iq/select";
import { TESTS, getTest } from "@/lib/iq/tests";
import { isCorrect, type Question } from "@/lib/iq/types";
import { createRng, randomSeed } from "@/lib/rng";

const choiceQuestions = QUESTION_BANK.filter((q) => q.answer.kind !== "numeric");

describe("option presentation", () => {
  it("keeps the correct option correct after shuffling", () => {
    for (const question of choiceQuestions) {
      for (const seed of [1, 7, 12345, 99999]) {
        const shown = presentQuestion(question, seed);
        const spec = question.answer as { options: unknown[]; correctIndex: number };
        const shownSpec = shown.answer as { options: unknown[]; correctIndex: number };
        expect(shownSpec.options).toHaveLength(spec.options.length);
        expect(shownSpec.options[shownSpec.correctIndex]).toEqual(
          spec.options[spec.correctIndex],
        );
        expect(isCorrect(shown, shownSpec.correctIndex), question.id).toBe(true);
      }
    }
  });

  it("preserves the full set of options, losing and inventing none", () => {
    for (const question of choiceQuestions.slice(0, 40)) {
      const shown = presentQuestion(question, 4242);
      const before = JSON.stringify((question.answer as { options: unknown[] }).options.slice().sort());
      const after = JSON.stringify((shown.answer as { options: unknown[] }).options.slice().sort());
      expect(after, question.id).toBe(before);
    }
  });

  it("leaves numeric-entry questions alone", () => {
    const numeric = QUESTION_BANK.find((q) => q.answer.kind === "numeric") as Question;
    expect(presentQuestion(numeric, 999)).toBe(numeric);
  });

  it("is deterministic for a given seed and question", () => {
    const question = choiceQuestions[0] as Question;
    expect(presentQuestion(question, 55)).toEqual(presentQuestion(question, 55));
  });

  it("falls back to the authored order when an attempt has no seed", () => {
    // Attempts saved before option shuffling existed must still review correctly.
    const question = choiceQuestions[0] as Question;
    expect(presentQuestion(question, undefined)).toBe(question);
  });

  it("gives different questions different permutations under one seed", () => {
    const orders = choiceQuestions
      .slice(0, 30)
      .map((q) => optionOrder(q.id, 777, 4).join(""));
    expect(new Set(orders).size).toBeGreaterThan(1);
  });

  it("moves the answer between retakes of the same question", () => {
    const question = choiceQuestions[0] as Question;
    const positions = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
        (seed) => (presentQuestion(question, seed).answer as { correctIndex: number }).correctIndex,
      ),
    );
    expect(positions.size).toBeGreaterThan(1);
  });

  it("shuffles a whole paper at once", () => {
    const shown = presentQuestions(choiceQuestions.slice(0, 5), 31);
    expect(shown).toHaveLength(5);
    shown.forEach((q, i) => expect(q.id).toBe(choiceQuestions[i]!.id));
  });
});

describe("answer position across a real paper", () => {
  /** Count where the correct answer lands across many simulated attempts. */
  function positionCounts(runs: number) {
    const counts = [0, 0, 0, 0, 0, 0];
    let total = 0;
    const rngSeed = createRng(20260910);
    for (let run = 0; run < runs; run++) {
      const seed = Math.floor(rngSeed() * 0xffffffff) >>> 0;
      for (const test of TESTS) {
        const { questions } = selectQuestions({ test, rng: createRng(seed) });
        for (const question of presentQuestions(questions, seed)) {
          if (question.answer.kind === "numeric") continue;
          counts[question.answer.correctIndex] = (counts[question.answer.correctIndex] ?? 0) + 1;
          total++;
        }
      }
    }
    return { counts, total };
  }

  it("puts the answer in each of the four positions about equally often", () => {
    const { counts, total } = positionCounts(40);
    const fourOption = counts.slice(0, 4).reduce((a, b) => a + b, 0);
    // Most items have four options; a handful of visual items have five.
    expect(fourOption / total).toBeGreaterThan(0.9);

    const expected = fourOption / 4;
    for (let i = 0; i < 4; i++) {
      const share = (counts[i] as number) / fourOption;
      expect(share, `position ${"ABCD"[i]} share ${share.toFixed(3)}`).toBeGreaterThan(0.21);
      expect(share, `position ${"ABCD"[i]} share ${share.toFixed(3)}`).toBeLessThan(0.29);
    }

    // Chi-square against uniform, 3 df: 7.81 is the 95% critical value.
    const chi = counts
      .slice(0, 4)
      .reduce((sum, c) => sum + ((c as number) - expected) ** 2 / expected, 0);
    expect(chi, `chi-square ${chi.toFixed(2)}`).toBeLessThan(12);
  });

  it("no longer leaves the bank's authored answer-first order visible", () => {
    // Every hand-authored multiple-choice item is written answer-first, which is
    // exactly why the shuffle has to exist.
    const authored = QUESTION_BANK.filter(
      (q) => q.answer.kind === "choice" && !q.id.startsWith("vis-"),
    );
    const allFirst = authored.every(
      (q) => (q.answer as { correctIndex: number }).correctIndex === 0,
    );
    expect(allFirst).toBe(true);

    const test = getTest("standard")!;
    const seed = randomSeed();
    const { questions } = selectQuestions({ test, rng: createRng(seed) });
    const shown = presentQuestions(questions, seed).filter(
      (q) => q.answer.kind === "choice",
    );
    const positions = new Set(
      shown.map((q) => (q.answer as { correctIndex: number }).correctIndex),
    );
    expect(positions.size).toBeGreaterThan(1);
  });
});

describe("always picking A", () => {
  /** Score a paper where the taker clicks the first option every time. */
  function alwaysFirst(seed: number | undefined) {
    let correct = 0;
    let total = 0;
    for (let run = 0; run < 25; run++) {
      const runSeed = 5000 + run * 6151;
      const { questions } = selectQuestions({
        test: getTest("standard")!,
        rng: createRng(runSeed),
      });
      for (const question of presentQuestions(questions, seed === undefined ? undefined : runSeed)) {
        if (question.answer.kind === "numeric") continue;
        total++;
        if (question.answer.correctIndex === 0) correct++;
      }
    }
    return correct / total;
  }

  it("used to score far above chance, because the bank is authored answer-first", () => {
    // This is the behaviour the shuffle exists to remove.
    expect(alwaysFirst(undefined)).toBeGreaterThan(0.6);
  });

  it("now scores at chance", () => {
    const rate = alwaysFirst(1);
    expect(rate, `always-A rate ${(rate * 100).toFixed(1)}%`).toBeGreaterThan(0.18);
    expect(rate, `always-A rate ${(rate * 100).toFixed(1)}%`).toBeLessThan(0.32);
  });
});
