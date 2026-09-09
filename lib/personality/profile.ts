import { ARCHETYPES, type Archetype } from "./archetypes";
import {
  ARCHETYPES_4,
  ARCHETYPE_4_DEFINITIONS,
  type Archetype4,
} from "./archetypes4";
import { scoreAspiration, type AspirationChoice, type AspirationItem } from "./aspiration";
import { CONTEXTS, type Context, type Scenario } from "./scenarios";
import { TRAITS, type Trait } from "./types";

/** Zeroed counter over the four energies. */
const zeros = (): Record<Archetype4, number> => ({
  king: 0,
  warrior: 0,
  magician: 0,
  lover: 0,
});

/**
 * Map a share of choices to a 0–100 access score on which chance sits at 50.
 * With four options, choosing an energy a quarter of the time is no preference
 * at all, and reporting that as 25 would be misleading.
 */
export function shareToScore(share: number, options = 4): number {
  const chance = 1 / options;
  if (share <= chance) return Math.round(50 * (share / chance) * 10) / 10;
  return Math.round((50 + 50 * ((share - chance) / (1 - chance))) * 10) / 10;
}

export type ShadowPole = "active" | "passive" | "balanced";

export interface ShadowReading {
  pole: ShadowPole;
  /** Which energy the shadow showed up in most. */
  archetype: Archetype4 | null;
  activeCount: number;
  passiveCount: number;
  matureCount: number;
  total: number;
  /** Share of pressure situations met in the mature form, 0–1. */
  maturity: number;
}

export interface ScenarioTally {
  access: Record<Archetype4, number>;
  counts: Record<Archetype4, number>;
  /** Sub-archetype choices, counted by facet id. */
  facets: Record<string, number>;
  active: Record<Archetype4, number>;
  passive: Record<Archetype4, number>;
  mature: Record<Archetype4, number>;
  standingAnswered: number;
  pressureAnswered: number;
}

export function tallyScenarios(
  choices: Readonly<Record<string, string | undefined>>,
  scenarios: readonly Scenario[],
): ScenarioTally {
  const counts = zeros();
  const active = zeros();
  const passive = zeros();
  const mature = zeros();
  const facets: Record<string, number> = {};
  let standingAnswered = 0;
  let pressureAnswered = 0;

  for (const scenario of scenarios) {
    const chosenId = choices[scenario.id];
    if (!chosenId) continue;
    const option = scenario.options.find((o) => o.id === chosenId);
    if (!option) continue;

    if (scenario.kind === "standing") {
      counts[option.archetype] += 1;
      standingAnswered += 1;
      if (option.facet) facets[option.facet] = (facets[option.facet] ?? 0) + 1;
    } else {
      pressureAnswered += 1;
      if (option.mode === "active") active[option.archetype] += 1;
      else if (option.mode === "passive") passive[option.archetype] += 1;
      else mature[option.archetype] += 1;
    }
  }

  const access = {} as Record<Archetype4, number>;
  for (const id of ARCHETYPES_4) {
    access[id] = standingAnswered === 0 ? 50 : shareToScore(counts[id] / standingAnswered);
  }

  return { access, counts, facets, active, passive, mature, standingAnswered, pressureAnswered };
}

export function readShadow(tally: ScenarioTally): ShadowReading {
  const activeCount = ARCHETYPES_4.reduce((s, a) => s + tally.active[a], 0);
  const passiveCount = ARCHETYPES_4.reduce((s, a) => s + tally.passive[a], 0);
  const matureCount = ARCHETYPES_4.reduce((s, a) => s + tally.mature[a], 0);
  const total = activeCount + passiveCount + matureCount;

  const pole: ShadowPole =
    activeCount === passiveCount ? "balanced" : activeCount > passiveCount ? "active" : "passive";

  const source = pole === "active" ? tally.active : tally.passive;
  let archetype: Archetype4 | null = null;
  let best = 0;
  for (const a of ARCHETYPES_4) {
    if (source[a] > best) {
      best = source[a];
      archetype = a;
    }
  }

  return {
    pole,
    archetype,
    activeCount,
    passiveCount,
    matureCount,
    total,
    maturity: total === 0 ? 0 : Math.round((matureCount / total) * 100) / 100,
  };
}

/**
 * Trait scores implied by the situations you chose.
 *
 * Each option carries the trait signature of its energy blended with that of
 * its sub-archetype, so the trait layer falls out of the same answers rather
 * than needing a separate questionnaire. That is what lets the whole
 * assessment be short.
 */
export function traitsFromScenarios(
  choices: Readonly<Record<string, string | undefined>>,
  scenarios: readonly Scenario[],
): Record<Trait, number> {
  const totals = TRAITS.reduce(
    (acc, t) => {
      acc[t] = 0;
      return acc;
    },
    {} as Record<Trait, number>,
  );
  let n = 0;

  for (const scenario of scenarios) {
    if (scenario.kind !== "standing") continue;
    const chosenId = choices[scenario.id];
    const option = scenario.options.find((o) => o.id === chosenId);
    if (!option) continue;

    const energy = ARCHETYPE_4_DEFINITIONS[option.archetype].vector;
    const facet = option.facet
      ? (ARCHETYPES.find((a) => a.id === option.facet)?.vector ?? null)
      : null;

    for (const t of TRAITS) {
      totals[t] += facet ? 0.5 * energy[t] + 0.5 * facet[t] : energy[t];
    }
    n += 1;
  }

  const out = {} as Record<Trait, number>;
  for (const t of TRAITS) {
    // Weights live in roughly −1…1; map the mean onto the 0–100 trait scale.
    const mean = n === 0 ? 0 : totals[t] / n;
    out[t] = Math.round(Math.min(100, Math.max(0, ((mean + 1) / 2) * 100)) * 10) / 10;
  }
  return out;
}

export interface ContextReading {
  context: Context;
  /** Which energy you reached for most in this part of school life. */
  dominant: Archetype4;
  counts: Record<Archetype4, number>;
  answered: number;
  /** False when too few situations covered it to say anything. */
  reliable: boolean;
}

const MIN_SITUATIONS_PER_CONTEXT = 3;

/**
 * The same man is not the same in every room. Reporting which energy he reaches
 * for in group work, in conflict, with teachers and on his own is usually more
 * useful than a single overall figure — and a gap between two contexts is a
 * finding in itself.
 */
export function readContexts(
  choices: Readonly<Record<string, string | undefined>>,
  scenarios: readonly Scenario[],
): ContextReading[] {
  return CONTEXTS.map((context) => {
    const counts = zeros();
    let answered = 0;
    for (const scenario of scenarios) {
      if (scenario.kind !== "standing" || scenario.context !== context) continue;
      const option = scenario.options.find((o) => o.id === choices[scenario.id]);
      if (!option) continue;
      counts[option.archetype] += 1;
      answered += 1;
    }
    let dominant: Archetype4 = "king";
    let best = -1;
    for (const id of ARCHETYPES_4) {
      if (counts[id] > best) {
        best = counts[id];
        dominant = id;
      }
    }
    return {
      context,
      dominant,
      counts,
      answered,
      reliable: answered >= MIN_SITUATIONS_PER_CONTEXT,
    };
  }).filter((r) => r.answered > 0);
}

export interface ArchetypeReading {
  archetype: Archetype4;
  /** How often you reach for this energy, 0–100 with chance at 50. */
  access: number;
  /** Raw number of situations in which you chose it. */
  chosen: number;
  /** What you said you would not give up, 0–100. */
  aspiration: number;
  /** aspiration − access. Positive means you value it more than you use it. */
  gap: number;
}

export interface Confidence {
  /** 0–100. How much the answers actually pin the reading down. */
  percent: number;
  label: "low" | "moderate" | "good" | "high";
  /** Plus-or-minus band on the leading access score, in points. */
  margin: number;
  low: number;
  high: number;
  reasons: string[];
}

/**
 * How much to trust the reading.
 *
 * Three things move it: how many situations were answered (more choices, less
 * noise), how concentrated the choices were (a man who spreads evenly across
 * all four has genuinely not revealed a dominant energy), and how far the
 * leading energy is clear of the next. The band is the binomial standard error
 * on the leading share, carried through the same share-to-score mapping, so it
 * widens honestly on a short form.
 */
export function computeConfidence(tally: ScenarioTally, margin: number): Confidence {
  const n = tally.standingAnswered;
  const reasons: string[] = [];

  if (n === 0) {
    return {
      percent: 0,
      label: "low",
      margin: 50,
      low: 0,
      high: 100,
      reasons: ["No situations were answered."],
    };
  }

  const counts = ARCHETYPES_4.map((a) => tally.counts[a]);
  const top = Math.max(...counts);
  const share = top / n;

  // Normalised entropy: 1 when the four are chosen equally, 0 when one is
  // chosen every time. Low spread means a clearer reading.
  let entropy = 0;
  for (const count of counts) {
    if (count === 0) continue;
    const p = count / n;
    entropy -= p * Math.log(p);
  }
  const normalisedEntropy = entropy / Math.log(4);
  const concentration = 1 - normalisedEntropy;

  const lengthFactor = n / (n + 6);
  const marginFactor = Math.min(1, margin / 25);
  const percent = Math.round(
    100 * (0.45 * lengthFactor + 0.35 * Math.min(1, concentration * 1.6) + 0.2 * marginFactor),
  );

  // Wilson score interval rather than the normal (Wald) approximation. Wald
  // collapses to zero width when every choice went the same way, which would
  // report a perfectly concentrated set of answers as having no uncertainty at
  // all — exactly backwards on a short form. Wilson stays sensible at the
  // boundaries, which is why it is the standard recommendation for proportions.
  const z = 1; // ≈68% interval, matching how the band is described.
  const denominator = 1 + (z * z) / n;
  const centre = (share + (z * z) / (2 * n)) / denominator;
  const halfWidth =
    (z / denominator) * Math.sqrt((share * (1 - share)) / n + (z * z) / (4 * n * n));

  const lowShare = Math.max(0, centre - halfWidth);
  const highShare = Math.min(1, centre + halfWidth);
  const leadScore = shareToScore(share);
  const lowScore = shareToScore(lowShare);
  const highScore = shareToScore(highShare);
  const band = Math.round(((highScore - lowScore) / 2) * 10) / 10;
  const label: Confidence["label"] =
    percent >= 75 ? "high" : percent >= 55 ? "good" : percent >= 35 ? "moderate" : "low";

  if (n < 14) reasons.push(`Only ${n} situations answered — the shorter form carries a wider band.`);
  if (concentration < 0.12)
    reasons.push("Your choices were spread almost evenly across the four, so no energy stands out.");
  if (margin < 8) reasons.push("The leading two energies are close together.");
  if (reasons.length === 0) reasons.push("Enough answers, clearly concentrated, with a decisive lead.");

  return {
    percent,
    label,
    margin: band,
    low: Math.max(0, Math.round(lowScore * 10) / 10),
    high: Math.min(100, Math.round(highScore * 10) / 10),
    reasons,
  };
}

export interface FourArchetypeProfile {
  readings: ArchetypeReading[];
  byArchetype: Record<Archetype4, ArchetypeReading>;
  /** Most accessed energy. Never "your type" — see NOT_A_TYPE_NOTE. */
  dominant: Archetype4;
  supporting: Archetype4;
  /** Least accessed: the one worth developing. */
  neglected: Archetype4;
  /** Largest positive gap between what you value and what you reach for. */
  growthEdge: Archetype4;
  growthGap: number;
  shadow: ShadowReading;
  /** Points between the leading energy and the next. */
  dominantMargin: number;
  contested: boolean;
  /** Spread across the four: low means well balanced. */
  spread: number;
  balanceLabel: "balanced" | "tilted" | "concentrated";
  confidence: Confidence;
  traitScores: Record<Trait, number>;
  facets: Record<string, number>;
  contexts: ContextReading[];
  /** True when at least two reliable contexts disagree about the leading energy. */
  contextSplit: boolean;
  answered: number;
  total: number;
}

export function buildFourArchetypeProfile(input: {
  scenarioChoices: Readonly<Record<string, string | undefined>>;
  scenarios: readonly Scenario[];
  aspirationChoices: Readonly<Record<string, AspirationChoice | undefined>>;
  aspirationItems: readonly AspirationItem[];
}): FourArchetypeProfile {
  const tally = tallyScenarios(input.scenarioChoices, input.scenarios);
  const aspiration = scoreAspiration(input.aspirationChoices, input.aspirationItems);

  const readings: ArchetypeReading[] = ARCHETYPES_4.map((archetype) => ({
    archetype,
    access: tally.access[archetype],
    chosen: tally.counts[archetype],
    aspiration: aspiration[archetype],
    gap: Math.round((aspiration[archetype] - tally.access[archetype]) * 10) / 10,
  }));

  const byArchetype = readings.reduce(
    (acc, r) => {
      acc[r.archetype] = r;
      return acc;
    },
    {} as Record<Archetype4, ArchetypeReading>,
  );

  const byAccess = [...readings].sort((a, b) => b.access - a.access);
  const byGap = [...readings].sort((a, b) => b.gap - a.gap);

  const dominantMargin =
    Math.round(((byAccess[0] as ArchetypeReading).access - (byAccess[1] as ArchetypeReading).access) * 10) / 10;

  const contexts = readContexts(input.scenarioChoices, input.scenarios);
  const accessValues = readings.map((r) => r.access);
  const spread = Math.round((Math.max(...accessValues) - Math.min(...accessValues)) * 10) / 10;

  return {
    readings,
    byArchetype,
    dominant: (byAccess[0] as ArchetypeReading).archetype,
    supporting: (byAccess[1] as ArchetypeReading).archetype,
    neglected: (byAccess[byAccess.length - 1] as ArchetypeReading).archetype,
    growthEdge: (byGap[0] as ArchetypeReading).archetype,
    growthGap: (byGap[0] as ArchetypeReading).gap,
    shadow: readShadow(tally),
    dominantMargin,
    contested: dominantMargin < 8,
    spread,
    balanceLabel: spread < 25 ? "balanced" : spread < 55 ? "tilted" : "concentrated",
    confidence: computeConfidence(tally, dominantMargin),
    traitScores: traitsFromScenarios(input.scenarioChoices, input.scenarios),
    facets: tally.facets,
    contexts,
    contextSplit:
      new Set(contexts.filter((c) => c.reliable).map((c) => c.dominant)).size > 1,
    answered: tally.standingAnswered + tally.pressureAnswered,
    total: input.scenarios.length,
  };
}

/** Which of the dominant energy's three sub-archetypes you actually expressed. */
export function facetFor(
  archetype: Archetype4,
  facets: Record<string, number>,
): { archetype: Archetype; count: number } | null {
  const ids = ARCHETYPE_4_DEFINITIONS[archetype].facets;
  let bestId: string | null = null;
  let best = -1;
  for (const id of ids) {
    const count = facets[id] ?? 0;
    if (count > best) {
      best = count;
      bestId = id;
    }
  }
  const found = ARCHETYPES.find((a) => a.id === bestId);
  return found ? { archetype: found, count: Math.max(0, best) } : null;
}
