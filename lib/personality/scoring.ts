import { ARCHETYPES, type Archetype } from "./archetypes";
import type { AspirationChoice, AspirationItem } from "./aspiration";
import { ASPIRATION_ITEMS } from "./aspiration";
import type { Archetype4 } from "./archetypes4";
import {
  buildFourArchetypeProfile,
  facetFor,
  type FourArchetypeProfile,
} from "./profile";
import { SCENARIOS, type Scenario } from "./scenarios";
import { CORE_ITEMS_PER_TRAIT, ITEMS_PER_TRAIT, PERSONALITY_ITEMS } from "./items";
import { assessQuality, type ResponseQuality } from "./quality";
import { findCombinations, type TraitCombination } from "./tensions";
import {
  TRAITS,
  type LikertValue,
  type PersonalityItem,
  type Trait,
} from "./types";

export interface TraitScore {
  trait: Trait;
  /** Sum of the keyed responses across this trait's items. */
  raw: number;
  /** Normalised 0–100. */
  score: number;
  /** Distance from the taker's own profile average, in points. */
  relative: number;
  level: "low" | "moderate" | "high";
  answered: number;
  total: number;
  /**
   * How far this trait's forward and reversed items disagree, in scale points.
   * A high value means this particular trait score should be trusted less.
   */
  inconsistency: number | null;
}

export interface ArchetypeMatch {
  archetype: Archetype;
  /** Fit of the profile shape to the archetype, 0–100. */
  match: number;
}

export type MatchConfidence = "clear" | "moderate" | "borderline";

export interface PersonalityOutcome {
  traits: TraitScore[];
  traitScores: Record<Trait, number>;
  ranking: ArchetypeMatch[];
  primary: ArchetypeMatch;
  secondary: ArchetypeMatch;
  /**
   * How far clear the primary is. When two archetypes are within a point or two
   * the profile genuinely sits between them, and saying so is more honest than
   * naming a winner.
   */
  confidence: MatchConfidence;
  /** Gap in match points between the primary and the reported secondary. */
  margin: number;
  /** Traits furthest above the taker's own average. */
  definingTraits: Trait[];
  /** Traits furthest below it. */
  counterTraits: Trait[];
  combinations: TraitCombination[];
  quality: ResponseQuality;
  answered: number;
  total: number;
  /** Present when situational and forced-choice sections were completed. */
  four: FourArchetypeProfile | null;
  /** Which sub-archetype of the dominant energy you actually expressed. */
  facet: { archetype: Archetype; count: number } | null;
}

export function keyedValue(item: PersonalityItem, value: LikertValue): number {
  return item.reverse ? 6 - value : value;
}

export function levelFor(score: number): "low" | "moderate" | "high" {
  if (score < 40) return "low";
  if (score < 65) return "moderate";
  return "high";
}

export function scoreTraits(
  responses: Readonly<Record<string, LikertValue | undefined>>,
  items: readonly PersonalityItem[] = PERSONALITY_ITEMS,
): Omit<TraitScore, "relative">[] {
  const quality = assessQuality(responses, items);

  return TRAITS.map((trait) => {
    const traitItems = items.filter((i) => i.trait === trait);
    let raw = 0;
    let answered = 0;
    for (const item of traitItems) {
      const value = responses[item.id];
      // Unanswered items score as neutral so a partial profile stays centred
      // rather than collapsing towards zero.
      raw += value === undefined ? 3 : keyedValue(item, value);
      if (value !== undefined) answered += 1;
    }
    const min = traitItems.length;
    const max = traitItems.length * 5;
    const score = max === min ? 50 : ((raw - min) / (max - min)) * 100;
    return {
      trait,
      raw,
      score: Math.round(score * 10) / 10,
      level: levelFor(score),
      answered,
      total: traitItems.length,
      inconsistency: quality.traitInconsistency[trait] ?? null,
    };
  });
}

function dot(a: Record<Trait, number>, b: Record<Trait, number>): number {
  return TRAITS.reduce((sum, t) => sum + a[t] * b[t], 0);
}

function norm(a: Record<Trait, number>): number {
  return Math.sqrt(dot(a, a));
}

/**
 * Archetype vectors are compared in the same centred space as the taker's
 * profile. Without this an archetype whose weights are mostly positive — a
 * generally "high" description — matches everyone slightly better than one
 * built from a mix, which biases the whole set towards a few traits.
 */
const centredVectors = new WeakMap<Archetype, Record<Trait, number>>();

export function centredVector(archetype: Archetype): Record<Trait, number> {
  const cached = centredVectors.get(archetype);
  if (cached) return cached;
  const mean = TRAITS.reduce((sum, t) => sum + archetype.vector[t], 0) / TRAITS.length;
  const centred = TRAITS.reduce(
    (acc, t) => {
      acc[t] = archetype.vector[t] - mean;
      return acc;
    },
    {} as Record<Trait, number>,
  );
  centredVectors.set(archetype, centred);
  return centred;
}

/** Cosine similarity between two archetypes: 1 = they describe the same person. */
export function archetypeSimilarity(a: Archetype, b: Archetype): number {
  const va = centredVector(a);
  const vb = centredVector(b);
  const magnitude = norm(va) * norm(vb);
  return magnitude < 1e-9 ? 0 : dot(va, vb) / magnitude;
}

/**
 * Archetype fit uses the *shape* of the profile, not its height.
 *
 * Trait scores are centred on the taker's own average, so what counts is which
 * traits stand out relative to their others — someone who agrees with
 * everything and someone who agrees with nothing can still have different
 * profiles. Cosine similarity against each archetype vector then maps to a
 * 0–100 match, which is why no single answer can decide the result.
 */
export function matchArchetypes(
  traitScores: Record<Trait, number>,
  archetypes: readonly Archetype[] = ARCHETYPES,
): ArchetypeMatch[] {
  const mean = TRAITS.reduce((sum, t) => sum + traitScores[t], 0) / TRAITS.length;

  let centred = TRAITS.reduce(
    (acc, t) => {
      acc[t] = traitScores[t] - mean;
      return acc;
    },
    {} as Record<Trait, number>,
  );

  // A perfectly flat profile carries no shape; fall back to distance from the
  // scale midpoint so the match is still meaningful rather than arbitrary.
  if (norm(centred) < 1e-6) {
    centred = TRAITS.reduce(
      (acc, t) => {
        acc[t] = traitScores[t] - 50;
        return acc;
      },
      {} as Record<Trait, number>,
    );
  }

  const profileNorm = norm(centred);

  return archetypes
    .map((archetype) => {
      const vector = centredVector(archetype);
      const vectorNorm = norm(vector);
      const cosine =
        profileNorm < 1e-6 || vectorNorm < 1e-6
          ? 0
          : dot(centred, vector) / (profileNorm * vectorNorm);
      return {
        archetype,
        match: Math.round(((cosine + 1) / 2) * 1000) / 10,
      };
    })
    .sort((a, b) => b.match - a.match || a.archetype.id.localeCompare(b.archetype.id));
}

/** Archetypes closer than this describe substantially the same person. */
const SECONDARY_DISTINCTNESS = 0.72;

/**
 * The runner-up is often a near-clone of the winner — The Scholar and The
 * Craftsman share most of their emphasis — and reporting both tells the taker
 * nothing they did not already learn from the primary. Pick instead the highest
 * ranked archetype that actually describes a different person.
 */
export function pickSecondary(
  ranking: readonly ArchetypeMatch[],
  primary: ArchetypeMatch,
): ArchetypeMatch {
  const distinct = ranking.find(
    (entry) =>
      entry.archetype.id !== primary.archetype.id &&
      archetypeSimilarity(entry.archetype, primary.archetype) < SECONDARY_DISTINCTNESS,
  );
  return distinct ?? ranking[1] ?? primary;
}

export function confidenceFor(margin: number, quality: ResponseQuality): MatchConfidence {
  if (quality.level === "questionable") return "borderline";
  if (margin >= 6) return "clear";
  if (margin >= 2.5) return "moderate";
  return "borderline";
}

export const CONFIDENCE_BLURBS: Record<MatchConfidence, string> = {
  clear:
    "Your profile sits distinctly closer to this archetype than to any other with a different shape.",
  moderate:
    "This archetype fits best, but the runner-up is not far behind — read both descriptions and take what rings true.",
  borderline:
    "Your profile sits genuinely between two archetypes rather than inside one. Neither description alone will fit well; the pair together will fit better than either.",
};

export interface ScoreOptions {
  scenarioChoices?: Readonly<Record<string, string | undefined>>;
  scenarios?: readonly Scenario[];
  aspirationChoices?: Readonly<Record<string, AspirationChoice | undefined>>;
  aspirationItems?: readonly AspirationItem[];
}

export function scorePersonality(
  responses: Readonly<Record<string, LikertValue | undefined>>,
  items: readonly PersonalityItem[] = PERSONALITY_ITEMS,
  options: ScoreOptions = {},
): PersonalityOutcome {
  const base = scoreTraits(responses, items);
  const traitScores = base.reduce(
    (acc, t) => {
      acc[t.trait] = t.score;
      return acc;
    },
    {} as Record<Trait, number>,
  );

  const mean = TRAITS.reduce((sum, t) => sum + traitScores[t], 0) / TRAITS.length;
  const traits: TraitScore[] = base.map((t) => ({
    ...t,
    relative: Math.round((t.score - mean) * 10) / 10,
  }));

  const ranking = matchArchetypes(traitScores);
  const primary = ranking[0] as ArchetypeMatch;
  const secondary = pickSecondary(ranking, primary);
  const margin = Math.round((primary.match - secondary.match) * 10) / 10;

  const quality = assessQuality(responses, items);
  const ordered = [...TRAITS].sort((a, b) => traitScores[b] - traitScores[a]);

  const hasSituational =
    options.scenarioChoices !== undefined && options.aspirationChoices !== undefined;
  const four = hasSituational
    ? buildFourArchetypeProfile({
        scenarioChoices: options.scenarioChoices ?? {},
        scenarios: options.scenarios ?? SCENARIOS,
        aspirationChoices: options.aspirationChoices ?? {},
        aspirationItems: options.aspirationItems ?? ASPIRATION_ITEMS,
      })
    : null;

  // The energy says what you reach for; the sub-archetype says which flavour of
  // it you actually chose across the situations.
  const facet = four ? facetFor(four.dominant, four.facets) : null;

  return {
    traits,
    traitScores,
    ranking,
    primary,
    secondary,
    confidence: confidenceFor(margin, quality),
    margin,
    definingTraits: ordered.filter((t) => traitScores[t] > mean).slice(0, 3),
    counterTraits: ordered.filter((t) => traitScores[t] < mean).slice(-2).reverse(),
    combinations: findCombinations(traitScores),
    quality,
    answered: items.filter((i) => responses[i.id] !== undefined).length,
    total: items.length,
    four,
    facet,
  };
}

export type { Archetype4 };

export const FULL_ITEM_COUNT = TRAITS.length * ITEMS_PER_TRAIT;
export const SHORT_ITEM_COUNT = TRAITS.length * CORE_ITEMS_PER_TRAIT;

/**
 * Score an assessment made entirely of situations and priorities.
 *
 * The trait layer is derived from the same answers rather than asked for
 * separately, which is what keeps the assessment short without losing the
 * per-trait read.
 */
export function scoreFourArchetypes(input: {
  scenarioChoices: Readonly<Record<string, string | undefined>>;
  scenarios: readonly Scenario[];
  aspirationChoices: Readonly<Record<string, AspirationChoice | undefined>>;
  aspirationItems: readonly AspirationItem[];
}) {
  const four = buildFourArchetypeProfile(input);
  const ranking = matchArchetypes(four.traitScores);
  const facet = facetFor(four.dominant, four.facets);
  const mean =
    TRAITS.reduce((sum, t) => sum + four.traitScores[t], 0) / TRAITS.length;
  const ordered = [...TRAITS].sort((a, b) => four.traitScores[b] - four.traitScores[a]);

  return {
    four,
    facet,
    ranking,
    traitScores: four.traitScores,
    definingTraits: ordered.filter((t) => four.traitScores[t] > mean).slice(0, 3),
    counterTraits: ordered.filter((t) => four.traitScores[t] < mean).slice(-2).reverse(),
    combinations: findCombinations(four.traitScores),
  };
}
