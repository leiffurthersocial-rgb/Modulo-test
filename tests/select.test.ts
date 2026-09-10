import { describe, expect, it } from "vitest";
import { QUESTION_BANK } from "@/lib/iq/bank";
import { categoryPlan, difficultyPlan, selectQuestions } from "@/lib/iq/select";
import { TESTS, getTest } from "@/lib/iq/tests";
import { createRng } from "@/lib/rng";

const standard = getTest("standard")!;
const logic = getTest("logic")!;

describe("difficultyPlan", () => {
  it("produces exactly one target per slot", () => {
    const plan = difficultyPlan({ 1: 2, 2: 3, 3: 3, 4: 2, 5: 1 }, 25, createRng(1));
    expect(plan).toHaveLength(25);
    expect(plan.every((d) => d >= 1 && d <= 5)).toBe(true);
  });

  it("follows the requested shape", () => {
    const plan = difficultyPlan({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 0 }, 10, createRng(2));
    expect(plan.every((d) => d === 3)).toBe(true);
  });

  it("falls back to the middle when every weight is zero", () => {
    const plan = difficultyPlan({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, 5, createRng(3));
    expect(plan).toEqual([3, 3, 3, 3, 3]);
  });
});

describe("categoryPlan", () => {
  it("spreads slots evenly across the requested categories", () => {
    const plan = categoryPlan(["logical", "verbal"], 10, createRng(4));
    expect(plan.filter((c) => c === "logical")).toHaveLength(5);
    expect(plan.filter((c) => c === "verbal")).toHaveLength(5);
  });
});

describe("selectQuestions", () => {
  it("returns the requested number of distinct questions", () => {
    for (const test of TESTS) {
      const { questions } = selectQuestions({ test, rng: createRng(7) });
      expect(questions, test.id).toHaveLength(test.questionCount);
      expect(new Set(questions.map((q) => q.id)).size, test.id).toBe(test.questionCount);
    }
  });

  it("only draws from the test's declared categories", () => {
    const { questions } = selectQuestions({ test: logic, rng: createRng(8) });
    expect(questions.every((q) => q.category === "logical")).toBe(true);
  });

  it("samples every domain on a full-spectrum test", () => {
    const { questions } = selectQuestions({ test: standard, rng: createRng(9) });
    const categories = new Set(questions.map((q) => q.category));
    expect(categories.size).toBe(5);
  });

  it("produces different papers for different seeds", () => {
    const a = selectQuestions({ test: standard, rng: createRng(11) }).questions.map((q) => q.id);
    const b = selectQuestions({ test: standard, rng: createRng(12) }).questions.map((q) => q.id);
    expect(a).not.toEqual(b);
    const overlap = a.filter((id) => b.includes(id)).length;
    expect(overlap).toBeLessThan(a.length);
  });

  it("is deterministic for a given seed", () => {
    const a = selectQuestions({ test: standard, rng: createRng(21) }).questions.map((q) => q.id);
    const b = selectQuestions({ test: standard, rng: createRng(21) }).questions.map((q) => q.id);
    expect(a).toEqual(b);
  });

  it("avoids questions already served when fresh ones remain", () => {
    const first = selectQuestions({ test: standard, rng: createRng(31) });
    const seen = Object.fromEntries(first.questions.map((q) => [q.id, 1]));
    const second = selectQuestions({ test: standard, seen, rng: createRng(32) });
    const repeats = second.questions.filter((q) => seen[q.id]).length;
    expect(repeats).toBe(0);
    expect(second.noveltyRatio).toBe(1);
  });

  it("keeps serving a full paper once the pool has been exhausted", () => {
    const pool = QUESTION_BANK.filter((q) => q.category === "logical");
    const seen = Object.fromEntries(pool.map((q) => [q.id, 3]));
    const result = selectQuestions({ test: logic, seen, rng: createRng(41) });
    expect(result.questions).toHaveLength(logic.questionCount);
    expect(result.noveltyRatio).toBe(0);
  });

  it("reports partial novelty when the pool is only partly used up", () => {
    const pool = QUESTION_BANK.filter((q) => q.category === "logical");
    // Leave fewer fresh questions than the test needs, so it must recycle some.
    const freshLeft = Math.floor(logic.questionCount / 2);
    const seen = Object.fromEntries(
      pool.slice(0, pool.length - freshLeft).map((q) => [q.id, 1]),
    );
    const result = selectQuestions({ test: logic, seen, rng: createRng(42) });
    expect(result.noveltyRatio).toBeCloseTo(freshLeft / logic.questionCount, 5);
    expect(result.noveltyRatio).toBeGreaterThan(0);
    expect(result.noveltyRatio).toBeLessThan(1);
  });

  it("roughly honours the difficulty profile of the test", () => {
    const { questions } = selectQuestions({ test: standard, rng: createRng(51) });
    const average =
      questions.reduce((sum, q) => sum + q.difficulty, 0) / questions.length;
    expect(average).toBeGreaterThan(2);
    expect(average).toBeLessThan(4);
  });

  it("never exceeds the size of the available pool", () => {
    const tiny = { ...logic, questionCount: 500 };
    const { questions } = selectQuestions({ test: tiny, rng: createRng(61) });
    const pool = QUESTION_BANK.filter((q) => q.category === "logical").length;
    expect(questions).toHaveLength(pool);
  });
});

describe("test catalogue", () => {
  it("keeps every test inside the bank's capacity per difficulty shape", () => {
    for (const test of TESTS) {
      const result = selectQuestions({ test, rng: createRng(101) });
      expect(result.questions, test.id).toHaveLength(test.questionCount);
    }
  });

  it("makes the challenge test harder than the standard one", () => {
    const hard = getTest("challenge")!;
    const standard = getTest("standard")!;
    const mean = (id: string) => {
      const test = getTest(id)!;
      const { questions } = selectQuestions({ test, rng: createRng(202) });
      return questions.reduce((s, q) => s + q.difficulty, 0) / questions.length;
    };
    expect(hard.questionCount).toBeGreaterThan(standard.questionCount);
    expect(mean("challenge")).toBeGreaterThan(mean("standard"));
  });
});

describe("domain coverage outranks novelty", () => {
  it("still samples a category whose questions have all been served", () => {
    // Otherwise a small or exhausted domain silently disappears from a
    // full-spectrum paper, and the per-domain breakdown goes with it.
    const verbal = QUESTION_BANK.filter((q) => q.category === "verbal");
    const seen = Object.fromEntries(verbal.map((q) => [q.id, 4]));
    for (const seedValue of [1, 2, 3, 4, 5]) {
      const { questions } = selectQuestions({
        test: standard,
        seen,
        rng: createRng(seedValue),
      });
      const categories = new Set(questions.map((q) => q.category));
      expect(categories.size, `seed ${seedValue}: ${[...categories].join(", ")}`).toBe(5);
    }
  });

  it("records the repetition in the novelty ratio rather than hiding it", () => {
    const verbal = QUESTION_BANK.filter((q) => q.category === "verbal");
    const seen = Object.fromEntries(verbal.map((q) => [q.id, 4]));
    const result = selectQuestions({ test: standard, seen, rng: createRng(9) });
    expect(result.noveltyRatio).toBeLessThan(1);
    expect(result.noveltyRatio).toBeGreaterThan(0);
  });

  it("still prefers unseen questions inside the requested domain", () => {
    const logical = QUESTION_BANK.filter((q) => q.category === "logical");
    const seen = Object.fromEntries(logical.slice(0, 20).map((q) => [q.id, 2]));
    const { questions } = selectQuestions({ test: logic, seen, rng: createRng(12) });
    const repeats = questions.filter((q) => seen[q.id]).length;
    expect(repeats).toBe(0);
  });
});
