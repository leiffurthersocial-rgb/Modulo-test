import { describe, expect, it } from "vitest";
import { QUESTION_BANK, bankCoverage, validateBank } from "@/lib/iq/bank";
import { TESTS } from "@/lib/iq/tests";
import { CATEGORIES, isCorrect, type Question } from "@/lib/iq/types";

describe("question bank", () => {
  it("passes structural validation", () => {
    expect(validateBank()).toEqual([]);
  });

  it("has unique ids", () => {
    const ids = new Set(QUESTION_BANK.map((q) => q.id));
    expect(ids.size).toBe(QUESTION_BANK.length);
  });

  it("covers every category with a usable number of items", () => {
    for (const category of CATEGORIES) {
      const count = QUESTION_BANK.filter((q) => q.category === category).length;
      expect(count, category).toBeGreaterThanOrEqual(15);
    }
  });

  it("spreads items across difficulty levels in every category", () => {
    const coverage = bankCoverage();
    for (const category of CATEGORIES) {
      const levels = Object.values(coverage[category]).filter((n) => n > 0).length;
      expect(levels, category).toBeGreaterThanOrEqual(3);
    }
  });

  it("has enough items in each category to fill its dedicated test", () => {
    for (const test of TESTS) {
      const pool = QUESTION_BANK.filter((q) => test.categories.includes(q.category));
      expect(pool.length, test.id).toBeGreaterThanOrEqual(test.questionCount);
    }
  });

  it("marks the declared correct answer as correct and others as wrong", () => {
    for (const q of QUESTION_BANK as Question[]) {
      if (q.answer.kind === "numeric") {
        expect(isCorrect(q, q.answer.value)).toBe(true);
        expect(isCorrect(q, q.answer.value + 1000)).toBe(false);
      } else {
        expect(isCorrect(q, q.answer.correctIndex)).toBe(true);
        q.answer.options.forEach((_, index) => {
          if (index !== (q.answer as { correctIndex: number }).correctIndex) {
            expect(isCorrect(q, index)).toBe(false);
          }
        });
      }
      expect(isCorrect(q, null)).toBe(false);
    }
  });

  it("has exactly one solvable blank in every matrix item", () => {
    for (const q of QUESTION_BANK) {
      if (q.stimulus?.kind !== "glyph-matrix") continue;
      expect(q.stimulus.cells).toHaveLength(9);
      expect(q.stimulus.cells.filter((c) => c === null)).toHaveLength(1);
      expect(q.answer.kind).toBe("glyph-choice");
    }
  });
});

describe("bank validation catches real problems", () => {
  const base = QUESTION_BANK[0] as Question;

  it("flags a duplicate id", () => {
    const issues = validateBank([base, { ...base }]);
    expect(issues.some((i) => i.problem === "duplicate id")).toBe(true);
  });

  it("flags an identical question served under a new id", () => {
    const issues = validateBank([base, { ...base, id: "clone-1" }]);
    expect(issues.some((i) => i.problem.startsWith("duplicate of"))).toBe(true);
  });

  it("allows questions that share a prompt but differ in their options", () => {
    const oddOneOut = QUESTION_BANK.filter((q) =>
      q.prompt.startsWith("Which figure does not belong"),
    );
    expect(oddOneOut.length).toBeGreaterThan(4);
    expect(validateBank(oddOneOut)).toEqual([]);
  });

  it("flags an out-of-range correct answer", () => {
    const broken: Question = {
      ...base,
      id: "broken-1",
      answer: { kind: "choice", options: ["a", "b", "c"], correctIndex: 9 },
    };
    expect(validateBank([broken]).some((i) => i.problem === "correctIndex out of range")).toBe(true);
  });

  it("flags repeated answer options", () => {
    const broken: Question = {
      ...base,
      id: "broken-2",
      answer: { kind: "choice", options: ["same", "same", "other"], correctIndex: 0 },
    };
    expect(validateBank([broken]).some((i) => i.problem === "duplicate answer options")).toBe(true);
  });
});
