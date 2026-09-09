import { ARCHETYPES, type Archetype } from "./archetypes";
import type { Archetype4 } from "./archetypes4";
import type { AspirationChoice, AspirationItem } from "./aspiration";
import {
  buildFourArchetypeProfile,
  facetFor,
  type FourArchetypeProfile,
} from "./profile";
import type { Scenario } from "./scenarios";
import { findCombinations, type TraitCombination } from "./tensions";
import { TRAITS, type Trait } from "./types";

export interface ArchetypeMatch {
  archetype: Archetype;
  /** Fit of the trait profile's shape to the sub-archetype, 0–100. */
  match: number;
}

function dot(a: Record<Trait, number>, b: Record<Trait, number>): number {
  return TRAITS.reduce((sum, t) => sum + a[t] * b[t], 0);
}

function norm(a: Record<Trait, number>): number {
  return Math.sqrt(dot(a, a));
}

/**
 * Sub-archetype vectors are compared in the same centred space as the trait
 * profile. Without this, a sub-archetype whose weights are mostly positive — a
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

/** Cosine similarity between two sub-archetypes: 1 = they describe the same man. */
export function archetypeSimilarity(a: Archetype, b: Archetype): number {
  const va = centredVector(a);
  const vb = centredVector(b);
  const magnitude = norm(va) * norm(vb);
  return magnitude < 1e-9 ? 0 : dot(va, vb) / magnitude;
}

/**
 * Rank the sub-archetypes against a trait profile.
 *
 * The profile is centred on its own average, so what counts is which traits
 * stand out relative to the others rather than their absolute height.
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
  // scale midpoint so the match stays meaningful rather than arbitrary.
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
      return { archetype, match: Math.round(((cosine + 1) / 2) * 1000) / 10 };
    })
    .sort((a, b) => b.match - a.match || a.archetype.id.localeCompare(b.archetype.id));
}

export interface FourArchetypeOutcome {
  four: FourArchetypeProfile;
  /** Which sub-archetype of the dominant energy the answers expressed. */
  facet: { archetype: Archetype; count: number } | null;
  ranking: ArchetypeMatch[];
  traitScores: Record<Trait, number>;
  definingTraits: Trait[];
  counterTraits: Trait[];
  combinations: TraitCombination[];
}

/**
 * Score an assessment made entirely of situations and priorities.
 *
 * The trait layer is derived from the same answers rather than asked for
 * separately, which is what keeps the assessment to six minutes without losing
 * the per-trait read.
 */
export function scoreFourArchetypes(input: {
  scenarioChoices: Readonly<Record<string, string | undefined>>;
  scenarios: readonly Scenario[];
  aspirationChoices: Readonly<Record<string, AspirationChoice | undefined>>;
  aspirationItems: readonly AspirationItem[];
}): FourArchetypeOutcome {
  const four = buildFourArchetypeProfile(input);
  const ranking = matchArchetypes(four.traitScores);
  const facet = facetFor(four.dominant, four.facets);
  const mean = TRAITS.reduce((sum, t) => sum + four.traitScores[t], 0) / TRAITS.length;
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

export type { Archetype4 };
