import {
  CATEGORIES,
  guessRate,
  isCorrect,
  type Category,
  type Difficulty,
  type Question,
  type ResponseValue,
} from "./types";

/**
 * Modulo's ability estimator.
 *
 * Scores are NOT a percentage correct. Each item is treated as a probe with a
 * difficulty threshold expressed on the IQ scale, and the reported score is the
 * ability value that best explains the observed pattern of right and wrong
 * answers (a MAP estimate under a normal population prior). Getting an easy
 * item wrong therefore costs more than missing a hard one, and guessing is
 * discounted by the number of options.
 *
 * This is a well-behaved psychometric approximation, not a clinically
 * validated instrument. See DISCLAIMER.
 */

export const POPULATION_MEAN = 100;
export const POPULATION_SD = 15;

/** Ability at which a taker has a ~50% genuine chance on an item. */
export const DIFFICULTY_THRESHOLD: Record<Difficulty, number> = {
  1: 82,
  2: 94,
  3: 106,
  4: 118,
  5: 130,
};

/** Logistic slope, in IQ points. Smaller = sharper items. */
const SLOPE = 11;

const MIN_ABILITY = 55;
const MAX_ABILITY = 145;

export function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** Abramowitz & Stegun 7.1.26 approximation of the error function. */
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * z);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-z * z);
  return sign * y;
}

export function normalCdf(x: number, mean = 0, sd = 1): number {
  return 0.5 * (1 + erf((x - mean) / (sd * Math.SQRT2)));
}

/** Percentile of an IQ score in the reference population, 0.1–99.9. */
export function percentileFor(iq: number): number {
  const raw = normalCdf(iq, POPULATION_MEAN, POPULATION_SD) * 100;
  return Math.min(99.9, Math.max(0.1, Math.round(raw * 10) / 10));
}

/** Three-parameter probability of answering an item correctly. */
export function probabilityCorrect(
  ability: number,
  threshold: number,
  guess: number,
): number {
  const p = guess + (1 - guess) * logistic((ability - threshold) / SLOPE);
  return Math.min(0.999, Math.max(0.001, p));
}

export interface ScoredItem {
  questionId: string;
  category: Category;
  difficulty: Difficulty;
  correct: boolean;
  answered: boolean;
}

export function scoreItems(
  questions: readonly Question[],
  responses: Readonly<Record<string, ResponseValue>>,
): ScoredItem[] {
  return questions.map((q) => {
    const value = responses[q.id] ?? null;
    return {
      questionId: q.id,
      category: q.category,
      difficulty: q.difficulty,
      correct: isCorrect(q, value),
      answered: value !== null,
    };
  });
}

export interface AbilityEstimate {
  /** MAP ability on the IQ scale, clamped to the reportable range. */
  iq: number;
  /** Standard error of the estimate, in IQ points. */
  standardError: number;
  /** 68% interval derived from the standard error. */
  low: number;
  high: number;
}

/**
 * Maximum a-posteriori ability estimate. A grid search is used rather than
 * Newton's method: the grid is tiny, always converges, and never produces NaN
 * for degenerate response patterns (all correct / all wrong).
 */
export function estimateAbility(
  items: readonly { difficulty: Difficulty; correct: boolean; guess: number }[],
): AbilityEstimate {
  if (items.length === 0) {
    return { iq: POPULATION_MEAN, standardError: POPULATION_SD, low: 85, high: 115 };
  }

  let bestAbility = POPULATION_MEAN;
  let bestLogPosterior = -Infinity;

  for (let ability = MIN_ABILITY; ability <= MAX_ABILITY; ability += 0.25) {
    let logLikelihood = 0;
    for (const item of items) {
      const p = probabilityCorrect(ability, DIFFICULTY_THRESHOLD[item.difficulty], item.guess);
      logLikelihood += item.correct ? Math.log(p) : Math.log(1 - p);
    }
    const z = (ability - POPULATION_MEAN) / POPULATION_SD;
    const logPrior = -0.5 * z * z;
    const logPosterior = logLikelihood + logPrior;
    if (logPosterior > bestLogPosterior) {
      bestLogPosterior = logPosterior;
      bestAbility = ability;
    }
  }

  // Fisher information of the 3PL model at the estimate, plus the prior.
  let information = 1 / (POPULATION_SD * POPULATION_SD);
  for (const item of items) {
    const threshold = DIFFICULTY_THRESHOLD[item.difficulty];
    const p = probabilityCorrect(bestAbility, threshold, item.guess);
    const q = 1 - p;
    const c = item.guess;
    if (p <= c) continue;
    information += ((q / p) * Math.pow((p - c) / (1 - c), 2)) / (SLOPE * SLOPE);
  }

  const standardError = Math.min(POPULATION_SD, 1 / Math.sqrt(information));
  const iq = Math.round(bestAbility);
  return {
    iq,
    standardError: Math.round(standardError * 10) / 10,
    low: Math.round(iq - standardError),
    high: Math.round(iq + standardError),
  };
}

export type Band =
  | "Below average"
  | "Average"
  | "Above average"
  | "High"
  | "Very high";

export function bandFor(iq: number): Band {
  if (iq < 85) return "Below average";
  if (iq < 100) return "Average";
  if (iq < 115) return "Above average";
  if (iq < 130) return "High";
  return "Very high";
}

export const BAND_BLURBS: Record<Band, string> = {
  "Below average":
    "This session landed below the typical range. Fatigue, time pressure or an unfamiliar question format all move this number, so treat a single sitting as a rough signal rather than a verdict.",
  Average:
    "This sits inside the range where most people score. Performance across the five domains is usually more informative than the headline number here.",
  "Above average":
    "Comfortably above the midpoint. You handled a good share of the harder items, not just the easy ones.",
  High: "A strong session. You solved items that most takers miss, which is what moves the estimate up rather than simply answering quickly.",
  "Very high":
    "An unusually strong session, driven by the hardest items in the set. Estimates this far from the centre carry wider error bars — the repeat-attempt estimate is the more reliable figure.",
}; 

export interface CategoryResult {
  category: Category;
  total: number;
  correct: number;
  accuracy: number;
  /** Domain estimate on the IQ scale. Only meaningful with enough items. */
  score: number | null;
  reliable: boolean;
}

export interface AttemptScore {
  iq: number;
  low: number;
  high: number;
  standardError: number;
  percentile: number;
  band: Band;
  correct: number;
  total: number;
  answered: number;
  accuracy: number;
  categories: CategoryResult[];
  items: ScoredItem[];
}

const MIN_ITEMS_FOR_DOMAIN_SCORE = 3;

export function scoreAttempt(
  questions: readonly Question[],
  responses: Readonly<Record<string, ResponseValue>>,
): AttemptScore {
  const items = scoreItems(questions, responses);
  const byId = new Map(questions.map((q) => [q.id, q] as const));

  const modelItems = items.map((item) => {
    const question = byId.get(item.questionId);
    return {
      difficulty: item.difficulty,
      correct: item.correct,
      guess: question ? guessRate(question) : 0.25,
    };
  });

  const estimate = estimateAbility(modelItems);

  const categories: CategoryResult[] = CATEGORIES.map((category) => {
    const subset = items.filter((i) => i.category === category);
    const correct = subset.filter((i) => i.correct).length;
    const reliable = subset.length >= MIN_ITEMS_FOR_DOMAIN_SCORE;
    const domain = reliable
      ? estimateAbility(
          subset.map((item) => {
            const question = byId.get(item.questionId);
            return {
              difficulty: item.difficulty,
              correct: item.correct,
              guess: question ? guessRate(question) : 0.25,
            };
          }),
        )
      : null;
    return {
      category,
      total: subset.length,
      correct,
      accuracy: subset.length ? correct / subset.length : 0,
      score: domain ? domain.iq : null,
      reliable,
    };
  }).filter((c) => c.total > 0);

  const correct = items.filter((i) => i.correct).length;

  return {
    iq: estimate.iq,
    low: estimate.low,
    high: estimate.high,
    standardError: estimate.standardError,
    percentile: percentileFor(estimate.iq),
    band: bandFor(estimate.iq),
    correct,
    total: items.length,
    answered: items.filter((i) => i.answered).length,
    accuracy: items.length ? correct / items.length : 0,
    categories,
    items,
  };
}

export const DISCLAIMER =
  "Modulo: Test is an unsupervised practice assessment. It is not a clinically validated IQ test and the number it reports is an estimate produced by our own scoring model, not a diagnosis or an official score.";
