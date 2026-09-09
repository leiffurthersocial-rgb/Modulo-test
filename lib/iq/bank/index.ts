import type { Category, Difficulty, Question } from "../types";
import { logicalQuestions } from "./logical";
import { numericalQuestions } from "./numerical";
import { patternTextQuestions } from "./pattern";
import { spatialTextQuestions } from "./spatial";
import { verbalQuestions } from "./verbal";
import { visualQuestions } from "./visual";

export const QUESTION_BANK: readonly Question[] = Object.freeze([
  ...logicalQuestions,
  ...numericalQuestions,
  ...patternTextQuestions,
  ...spatialTextQuestions,
  ...verbalQuestions,
  ...visualQuestions,
]);

const byId = new Map(QUESTION_BANK.map((q) => [q.id, q] as const));

export function getQuestion(id: string): Question | undefined {
  return byId.get(id);
}

export function questionsByCategory(category: Category): Question[] {
  return QUESTION_BANK.filter((q) => q.category === category);
}

export interface BankIssue {
  id: string;
  problem: string;
}

/**
 * Structural checks the bank must satisfy. Exercised by the unit tests so a
 * malformed item can never ship: duplicate ids, out-of-range answers and
 * duplicate answer options would all silently corrupt scoring.
 */
export function validateBank(bank: readonly Question[] = QUESTION_BANK): BankIssue[] {
  const issues: BankIssue[] = [];
  const seen = new Set<string>();

  for (const q of bank) {
    if (seen.has(q.id)) issues.push({ id: q.id, problem: "duplicate id" });
    seen.add(q.id);

    if (!q.prompt.trim()) issues.push({ id: q.id, problem: "empty prompt" });
    if (q.difficulty < 1 || q.difficulty > 5) {
      issues.push({ id: q.id, problem: `difficulty out of range: ${q.difficulty}` });
    }

    if (q.answer.kind === "numeric") {
      if (!Number.isFinite(q.answer.value)) {
        issues.push({ id: q.id, problem: "numeric answer is not finite" });
      }
    } else {
      const { options, correctIndex } = q.answer;
      if (options.length < 3) issues.push({ id: q.id, problem: "fewer than 3 options" });
      if (correctIndex < 0 || correctIndex >= options.length) {
        issues.push({ id: q.id, problem: "correctIndex out of range" });
      }
      const keys = options.map((o) =>
        typeof o === "string"
          ? o.trim().toLowerCase()
          : `${o.shape}|${o.fill}|${((o.rotation % 360) + 360) % 360}|${o.count}`,
      );
      if (new Set(keys).size !== keys.length) {
        issues.push({ id: q.id, problem: "duplicate answer options" });
      }
    }

    if (q.stimulus?.kind === "glyph-matrix") {
      if (q.stimulus.cells.length !== 9) {
        issues.push({ id: q.id, problem: "matrix must have 9 cells" });
      }
      if (q.stimulus.cells.filter((c) => c === null).length !== 1) {
        issues.push({ id: q.id, problem: "matrix must have exactly one blank cell" });
      }
    }
  }

  return issues;
}

export function bankCoverage(): Record<Category, Record<Difficulty, number>> {
  const empty = () => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }) as Record<Difficulty, number>;
  const out = {
    logical: empty(),
    numerical: empty(),
    pattern: empty(),
    spatial: empty(),
    verbal: empty(),
  } as Record<Category, Record<Difficulty, number>>;
  for (const q of QUESTION_BANK) out[q.category][q.difficulty] += 1;
  return out;
}
