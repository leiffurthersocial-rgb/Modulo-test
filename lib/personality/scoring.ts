import { ARCHETYPES, type Archetype } from "./archetypes";
import { ITEMS_PER_TRAIT, PERSONALITY_ITEMS } from "./items";
import { TRAITS, type LikertValue, type PersonalityItem, type Trait } from "./types";

export interface TraitScore {
  trait: Trait;
  /** Raw sum of the five keyed responses, 5–25. */
  raw: number;
  /** Normalised 0–100. */
  score: number;
  level: "low" | "moderate" | "high";
  answered: number;
}

export interface ArchetypeMatch {
  archetype: Archetype;
  /** Fit of the profile shape to the archetype, 0–100. */
  match: number;
}

export interface PersonalityOutcome {
  traits: TraitScore[];
  traitScores: Record<Trait, number>;
  ranking: ArchetypeMatch[];
  primary: ArchetypeMatch;
  secondary: ArchetypeMatch;
  /** Traits furthest above your own profile average — what defines you. */
  definingTraits: Trait[];
  /** Traits furthest below your own average. */
  counterTraits: Trait[];
  answered: number;
  total: number;
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
): TraitScore[] {
  return TRAITS.map((trait) => {
    const traitItems = items.filter((i) => i.trait === trait);
    let raw = 0;
    let answered = 0;
    for (const item of traitItems) {
      const value = responses[item.id];
      // Unanswered items score as neutral so a partial profile stays centred.
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
 * Archetype fit uses the *shape* of the profile, not its height.
 *
 * The trait scores are centred on the taker's own average, so what counts is
 * which traits stand out relative to the rest — someone who agrees with
 * everything and someone who agrees with nothing can still have different
 * profiles. Cosine similarity against each archetype vector then maps to a
 * 0–100 match, which is why no single question can decide the result.
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
      const vectorNorm = norm(archetype.vector);
      const cosine =
        profileNorm < 1e-6 || vectorNorm < 1e-6
          ? 0
          : dot(centred, archetype.vector) / (profileNorm * vectorNorm);
      return {
        archetype,
        match: Math.round(((cosine + 1) / 2) * 1000) / 10,
      };
    })
    .sort((a, b) => b.match - a.match || a.archetype.id.localeCompare(b.archetype.id));
}

export function scorePersonality(
  responses: Readonly<Record<string, LikertValue | undefined>>,
  items: readonly PersonalityItem[] = PERSONALITY_ITEMS,
): PersonalityOutcome {
  const traits = scoreTraits(responses, items);
  const traitScores = traits.reduce(
    (acc, t) => {
      acc[t.trait] = t.score;
      return acc;
    },
    {} as Record<Trait, number>,
  );

  const ranking = matchArchetypes(traitScores);
  const mean = TRAITS.reduce((sum, t) => sum + traitScores[t], 0) / TRAITS.length;
  const ordered = [...TRAITS].sort((a, b) => traitScores[b] - traitScores[a]);

  const primary = ranking[0] as ArchetypeMatch;
  const secondary = (ranking[1] ?? ranking[0]) as ArchetypeMatch;

  return {
    traits,
    traitScores,
    ranking,
    primary,
    secondary,
    definingTraits: ordered.filter((t) => traitScores[t] >= mean).slice(0, 3),
    counterTraits: ordered.slice(-2).reverse(),
    answered: items.filter((i) => responses[i.id] !== undefined).length,
    total: items.length,
  };
}

export const EXPECTED_ITEM_COUNT = TRAITS.length * ITEMS_PER_TRAIT;
