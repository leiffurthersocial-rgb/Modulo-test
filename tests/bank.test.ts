import { describe, expect, it } from "vitest";
import { QUESTION_BANK, bankCoverage, validateBank } from "@/lib/iq/bank";
import { TESTS, getTest } from "@/lib/iq/tests";
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

describe("language accessibility", () => {
  /**
   * Words whose meaning the taker would have to already know for the item to be
   * answerable. Every one of these was in the bank at some point; the list
   * exists so they cannot quietly come back.
   */
  const RARE_VOCABULARY = [
    "ephemeral", "laconic", "obfuscate", "intransigent", "sanguine",
    "perfunctory", "assiduous", "ostensible", "equivocate", "meticulous",
    "tacit", "ubiquitous", "recalcitrant", "pellucid", "inchoate",
    "ameliorate", "gregarious", "candid", "prudent", "stingy", "innate",
    "verbose", "derivative", "tenuous", "circumstantial", "scaffolding",
    "nurture", "insomnia", "impotent",
  ];

  /** Formats whose answer is a definition rather than a relationship. */
  const VOCABULARY_FORMATS = [
    /most nearly means/i,
    /closest in meaning to/i,
    /means the opposite of/i,
    /opposite of ['"]/i,
    /to ['"]\w+['"] is to:/i,
  ];

  it("asks no question whose answer is the meaning of a rare word", () => {
    for (const q of QUESTION_BANK) {
      const text = [q.prompt, ...(q.answer.kind === "choice" ? q.answer.options : [])]
        .join(" ")
        .toLowerCase();
      for (const word of RARE_VOCABULARY) {
        expect(text.includes(word), `${q.id} uses "${word}"`).toBe(false);
      }
    }
  });

  it("asks no pure vocabulary-definition question", () => {
    for (const q of QUESTION_BANK) {
      for (const format of VOCABULARY_FORMATS) {
        expect(format.test(q.prompt), `${q.id}: ${q.prompt}`).toBe(false);
      }
    }
  });

  it("has no anagram or English-word-initial item", () => {
    // Neither can be solved without English, whatever the reasoning behind it.
    for (const q of QUESTION_BANK) {
      expect(/rearranged to spell/i.test(q.prompt), q.id).toBe(false);
      const series =
        q.stimulus?.kind === "text-sequence" ? q.stimulus.items.join("") : "";
      for (const banned of ["OTTFFSS", "JFMAMJJ", "SMTW"]) {
        expect(series.startsWith(banned), `${q.id} series ${series}`).toBe(false);
      }
    }
  });

  it("keeps the verbal items short enough to read in a second language", () => {
    const verbal = QUESTION_BANK.filter((q) => q.category === "verbal");
    for (const q of verbal) {
      expect(q.prompt.split(/\s+/).length, `${q.id}: ${q.prompt}`).toBeLessThan(45);
      if (q.answer.kind === "choice") {
        for (const option of q.answer.options) {
          expect(option.split(/\s+/).length, `${q.id}: "${option}"`).toBeLessThan(12);
        }
      }
    }
  });

  it("still has enough verbal items, spread across the difficulty levels", () => {
    const verbal = QUESTION_BANK.filter((q) => q.category === "verbal");
    expect(verbal.length).toBeGreaterThanOrEqual(getTest("verbal")!.questionCount);
    const levels = new Set(verbal.map((q) => q.difficulty));
    expect(levels.size).toBe(5);
  });
});
