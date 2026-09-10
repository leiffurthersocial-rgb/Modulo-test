import { createRng, shuffle } from "@/lib/rng";
import type { Question } from "./types";

/**
 * Option order as presented to the taker.
 *
 * Questions are authored with the correct option written first, which is
 * readable for whoever maintains the bank and useless for whoever sits the
 * test: it would put the answer at A every time. Options are therefore
 * shuffled per attempt, which makes the correct answer equally likely to land
 * in any position and — because the order is keyed to the attempt — also moves
 * it between retakes, so a remembered position is worth nothing.
 *
 * The order is derived rather than stored: the same attempt seed and question
 * id always produce the same permutation, so the runner and the results page
 * agree without persisting a permutation per question. An attempt saved before
 * this existed has no seed, and falls back to the authored order so its review
 * still lines up with the answers it recorded.
 */

/** Stable 32-bit hash of a question id, so each question shuffles differently. */
function hashId(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Permutation of option indices: `order[displayed] = original`. */
export function optionOrder(questionId: string, seed: number, count: number): number[] {
  const indices = Array.from({ length: count }, (_, i) => i);
  if (count < 2) return indices;
  const rng = createRng((hashId(questionId) ^ (seed >>> 0)) >>> 0);
  return shuffle(indices, rng);
}

/**
 * A question with its options in presentation order and `correctIndex` remapped
 * to match. Numeric-entry questions have no options and pass through unchanged.
 */
export function presentQuestion(question: Question, seed: number | undefined): Question {
  if (seed === undefined) return question;
  const spec = question.answer;
  if (spec.kind === "numeric") return question;

  const order = optionOrder(question.id, seed, spec.options.length);
  const correctIndex = order.indexOf(spec.correctIndex);

  if (spec.kind === "choice") {
    return {
      ...question,
      answer: {
        kind: "choice",
        options: order.map((i) => spec.options[i] as string),
        correctIndex,
      },
    };
  }

  return {
    ...question,
    answer: {
      kind: "glyph-choice",
      options: order.map((i) => spec.options[i]!),
      correctIndex,
    },
  };
}

export function presentQuestions(
  questions: readonly Question[],
  seed: number | undefined,
): Question[] {
  return questions.map((question) => presentQuestion(question, seed));
}
