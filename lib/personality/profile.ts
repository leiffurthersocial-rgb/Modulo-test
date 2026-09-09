import { ARCHETYPES, type Archetype } from "./archetypes";
import { scoreAspiration, type AspirationChoice, type AspirationItem } from "./aspiration";
import { PILLARS, PILLAR_DEFINITIONS, type Pillar } from "./pillars";
import type { Scenario } from "./scenarios";
import { TRAITS, type Trait } from "./types";

/**
 * Combining the three measurement modes into one picture.
 *
 * Each pillar is scored from what you say about yourself (traits), what you say
 * you would do (scenarios) and what you would not give up (forced choice). They
 * are kept separate on purpose: where they disagree is the most informative
 * part of the result.
 */

/** Behaviour beats self-description, so situational choices carry more weight. */
const SCENARIO_WEIGHT = 0.62;
const TRAIT_WEIGHT = 0.38;

function dot(a: Record<Trait, number>, b: Record<Trait, number>): number {
  return TRAITS.reduce((sum, t) => sum + a[t] * b[t], 0);
}

function norm(a: Record<Trait, number>): number {
  return Math.sqrt(dot(a, a));
}

function centre(values: Record<Trait, number>): Record<Trait, number> {
  const mean = TRAITS.reduce((sum, t) => sum + values[t], 0) / TRAITS.length;
  return TRAITS.reduce(
    (acc, t) => {
      acc[t] = values[t] - mean;
      return acc;
    },
    {} as Record<Trait, number>,
  );
}

/** Pillar expression implied by the trait questionnaire, 0–100 per pillar. */
export function pillarsFromTraits(
  traitScores: Record<Trait, number>,
): Record<Pillar, number> {
  let profile = centre(traitScores);
  if (norm(profile) < 1e-6) {
    profile = TRAITS.reduce(
      (acc, t) => {
        acc[t] = traitScores[t] - 50;
        return acc;
      },
      {} as Record<Trait, number>,
    );
  }
  const profileNorm = norm(profile);

  const out = {} as Record<Pillar, number>;
  for (const pillar of PILLARS) {
    const vector = centre(PILLAR_DEFINITIONS[pillar].vector);
    const magnitude = profileNorm * norm(vector);
    const cosine = magnitude < 1e-9 ? 0 : dot(profile, vector) / magnitude;
    out[pillar] = Math.round(((cosine + 1) / 2) * 1000) / 10;
  }
  return out;
}

/**
 * Map a share of choices to a 0–100 scale on which chance sits at 50.
 * With four options, picking a pillar a quarter of the time is no preference at
 * all, and a linear percentage would misleadingly call that 25.
 */
export function shareToScore(share: number, options = 4): number {
  const chance = 1 / options;
  if (share <= chance) return Math.round((50 * (share / chance)) * 10) / 10;
  return Math.round((50 + 50 * ((share - chance) / (1 - chance))) * 10) / 10;
}

export interface ScenarioTally {
  pillars: Record<Pillar, number>;
  /** Shadow choices, counted per pillar. */
  inflated: Record<Pillar, number>;
  deflated: Record<Pillar, number>;
  mature: Record<Pillar, number>;
  answered: number;
  pressureAnswered: number;
}

const emptyPillarCounts = (): Record<Pillar, number> => ({
  sovereign: 0,
  warrior: 0,
  magician: 0,
  lover: 0,
});

export function tallyScenarios(
  choices: Readonly<Record<string, string | undefined>>,
  scenarios: readonly Scenario[],
): ScenarioTally {
  const standingCounts = emptyPillarCounts();
  const inflated = emptyPillarCounts();
  const deflated = emptyPillarCounts();
  const mature = emptyPillarCounts();
  let standingAnswered = 0;
  let pressureAnswered = 0;

  for (const scenario of scenarios) {
    const chosenId = choices[scenario.id];
    if (!chosenId) continue;
    const option = scenario.options.find((o) => o.id === chosenId);
    if (!option) continue;

    if (scenario.kind === "standing") {
      standingCounts[option.pillar] += 1;
      standingAnswered += 1;
    } else {
      pressureAnswered += 1;
      if (option.mode === "inflated") inflated[option.pillar] += 1;
      else if (option.mode === "deflated") deflated[option.pillar] += 1;
      else mature[option.pillar] += 1;
    }
  }

  const pillars = {} as Record<Pillar, number>;
  for (const pillar of PILLARS) {
    pillars[pillar] =
      standingAnswered === 0 ? 50 : shareToScore(standingCounts[pillar] / standingAnswered);
  }

  return {
    pillars,
    inflated,
    deflated,
    mature,
    answered: standingAnswered,
    pressureAnswered,
  };
}

export type ShadowPole = "inflated" | "deflated" | "balanced";

export interface ShadowReading {
  pole: ShadowPole;
  /** Which pillar the shadow showed up in most. */
  pillar: Pillar | null;
  inflatedCount: number;
  deflatedCount: number;
  matureCount: number;
  total: number;
}

export function readShadow(tally: ScenarioTally): ShadowReading {
  const inflatedCount = PILLARS.reduce((s, p) => s + tally.inflated[p], 0);
  const deflatedCount = PILLARS.reduce((s, p) => s + tally.deflated[p], 0);
  const matureCount = PILLARS.reduce((s, p) => s + tally.mature[p], 0);
  const total = inflatedCount + deflatedCount + matureCount;

  const pole: ShadowPole =
    inflatedCount === deflatedCount
      ? "balanced"
      : inflatedCount > deflatedCount
        ? "inflated"
        : "deflated";

  const source = pole === "inflated" ? tally.inflated : tally.deflated;
  let pillar: Pillar | null = null;
  let best = 0;
  for (const p of PILLARS) {
    if (source[p] > best) {
      best = source[p];
      pillar = p;
    }
  }

  return { pole, pillar, inflatedCount, deflatedCount, matureCount, total };
}

export interface PillarReading {
  pillar: Pillar;
  /** Blended behavioural + self-report score, 0–100. */
  expression: number;
  /** From the trait questionnaire alone. */
  fromTraits: number;
  /** From situational choices alone. */
  fromScenarios: number;
  /** From forced-choice priorities: what you are aiming at. */
  aspiration: number;
  /** aspiration − expression. Positive means you value it more than you live it. */
  gap: number;
}

export interface FourPillarProfile {
  readings: PillarReading[];
  byPillar: Record<Pillar, PillarReading>;
  /** Strongest current expression. */
  primary: Pillar;
  /** Second strongest. */
  supporting: Pillar;
  /** Weakest current expression. */
  leastDeveloped: Pillar;
  /** Largest positive gap between what you value and what you express. */
  growthEdge: Pillar;
  growthGap: number;
  shadow: ShadowReading;
  /** How much self-description and situational choice disagree, in points. */
  selfReportDivergence: number;
  divergentPillar: Pillar | null;
  /** Spread of expression across the four pillars. */
  balance: number;
  /**
   * Points between the leading pillar and the next. A stable sort over a fixed
   * pillar order would otherwise resolve every tie to the same pillar and
   * present it as a finding, so a small margin is reported rather than hidden.
   */
  primaryMargin: number;
  /** True when the top two pillars are close enough to be effectively level. */
  primaryContested: boolean;
}

export function buildFourPillarProfile(input: {
  traitScores: Record<Trait, number>;
  scenarioChoices: Readonly<Record<string, string | undefined>>;
  scenarios: readonly Scenario[];
  aspirationChoices: Readonly<Record<string, AspirationChoice | undefined>>;
  aspirationItems: readonly AspirationItem[];
}): FourPillarProfile {
  const fromTraits = pillarsFromTraits(input.traitScores);
  const tally = tallyScenarios(input.scenarioChoices, input.scenarios);
  const aspiration = scoreAspiration(input.aspirationChoices, input.aspirationItems);

  const readings: PillarReading[] = PILLARS.map((pillar) => {
    const expression =
      Math.round(
        (SCENARIO_WEIGHT * tally.pillars[pillar] + TRAIT_WEIGHT * fromTraits[pillar]) * 10,
      ) / 10;
    return {
      pillar,
      expression,
      fromTraits: fromTraits[pillar],
      fromScenarios: tally.pillars[pillar],
      aspiration: aspiration[pillar],
      gap: Math.round((aspiration[pillar] - expression) * 10) / 10,
    };
  });

  const byPillar = readings.reduce(
    (acc, r) => {
      acc[r.pillar] = r;
      return acc;
    },
    {} as Record<Pillar, PillarReading>,
  );

  const byExpression = [...readings].sort((a, b) => b.expression - a.expression);
  const byGap = [...readings].sort((a, b) => b.gap - a.gap);

  // Where saying and doing diverge most.
  let divergentPillar: Pillar | null = null;
  let selfReportDivergence = 0;
  for (const reading of readings) {
    const delta = Math.abs(reading.fromScenarios - reading.fromTraits);
    if (delta > selfReportDivergence) {
      selfReportDivergence = delta;
      divergentPillar = reading.pillar;
    }
  }

  const expressions = readings.map((r) => r.expression);
  const primaryMargin =
    Math.round(
      ((byExpression[0] as PillarReading).expression -
        (byExpression[1] as PillarReading).expression) *
        10,
    ) / 10;

  return {
    readings,
    byPillar,
    primary: (byExpression[0] as PillarReading).pillar,
    supporting: (byExpression[1] as PillarReading).pillar,
    leastDeveloped: (byExpression[byExpression.length - 1] as PillarReading).pillar,
    growthEdge: (byGap[0] as PillarReading).pillar,
    growthGap: (byGap[0] as PillarReading).gap,
    shadow: readShadow(tally),
    selfReportDivergence: Math.round(selfReportDivergence * 10) / 10,
    divergentPillar,
    balance: Math.round((Math.max(...expressions) - Math.min(...expressions)) * 10) / 10,
    primaryMargin,
    primaryContested: primaryMargin < 4,
  };
}

/** The best-fitting sub-archetype inside a pillar, from the trait profile. */
export function subArchetypeFor(
  pillar: Pillar,
  ranking: readonly { archetype: Archetype; match: number }[],
): { archetype: Archetype; match: number } | null {
  const ids = PILLAR_DEFINITIONS[pillar].archetypes;
  const withinPillar = ranking.filter((r) => ids.includes(r.archetype.id));
  if (withinPillar.length > 0) return withinPillar[0] as { archetype: Archetype; match: number };
  const fallback = ARCHETYPES.find((a) => ids.includes(a.id));
  return fallback ? { archetype: fallback, match: 50 } : null;
}
