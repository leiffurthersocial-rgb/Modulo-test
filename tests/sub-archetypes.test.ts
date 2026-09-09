import { describe, expect, it } from "vitest";
import { ARCHETYPES } from "@/lib/personality/archetypes";
import { archetypeSimilarity, matchArchetypes } from "@/lib/personality/scoring";
import { findCombinations } from "@/lib/personality/tensions";
import { TRAITS, type Trait } from "@/lib/personality/types";

describe("trait combinations", () => {
  it("finds the blunt-instrument pattern", () => {
    const scores = Object.fromEntries(
      TRAITS.map((t) => [t, t === "assertiveness" ? 95 : t === "empathy" ? 10 : 50]),
    ) as Record<Trait, number>;
    const ids = findCombinations(scores).map((c) => c.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids).toContain("blunt-instrument");
  });

  it("finds the starts-not-finishes pattern", () => {
    const scores = Object.fromEntries(
      TRAITS.map((t) => [t, t === "curiosity" ? 95 : t === "discipline" ? 10 : 50]),
    ) as Record<Trait, number>;
    expect(findCombinations(scores).map((c) => c.id)).toContain("starts-not-finishes");
  });

  it("returns nothing for a flat profile rather than inventing a tension", () => {
    const flat = Object.fromEntries(TRAITS.map((t) => [t, 50])) as Record<Trait, number>;
    expect(findCombinations(flat)).toEqual([]);
  });

  it("caps how many it reports", () => {
    const scores = Object.fromEntries(
      TRAITS.map((t) => [t, ["assertiveness", "curiosity", "empathy", "competitiveness"].includes(t) ? 95 : 10]),
    ) as Record<Trait, number>;
    expect(findCombinations(scores).length).toBeLessThanOrEqual(3);
  });
});

describe("archetype definitions", () => {
  it("has at least eight archetypes with unique ids and names", () => {
    expect(ARCHETYPES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(ARCHETYPES.map((a) => a.id)).size).toBe(ARCHETYPES.length);
    expect(new Set(ARCHETYPES.map((a) => a.name)).size).toBe(ARCHETYPES.length);
  });

  it("gives every archetype content and a non-zero trait vector", () => {
    for (const archetype of ARCHETYPES) {
      expect(archetype.strengths.length, archetype.id).toBeGreaterThanOrEqual(3);
      expect(archetype.weaknesses.length, archetype.id).toBeGreaterThanOrEqual(3);
      expect(archetype.description.length, archetype.id).toBeGreaterThan(60);
      const magnitude = TRAITS.reduce((s, t) => s + Math.abs(archetype.vector[t]), 0);
      expect(magnitude, archetype.id).toBeGreaterThan(1);
    }
  });

  it("makes every archetype reachable by some profile", () => {
    const reachable = new Set<string>();
    for (const archetype of ARCHETYPES) {
      const traitScores = TRAITS.reduce(
        (acc, t) => {
          acc[t] = 50 + archetype.vector[t] * 50;
          return acc;
        },
        {} as Record<Trait, number>,
      );
      reachable.add(matchArchetypes(traitScores)[0]!.archetype.id);
    }
    expect(reachable.size).toBe(ARCHETYPES.length);
  });

  it("keeps no two archetypes effectively identical", () => {
    for (let i = 0; i < ARCHETYPES.length; i++) {
      for (let j = i + 1; j < ARCHETYPES.length; j++) {
        const similarity = archetypeSimilarity(ARCHETYPES[i]!, ARCHETYPES[j]!);
        expect(similarity, `${ARCHETYPES[i]!.name} vs ${ARCHETYPES[j]!.name}`).toBeLessThan(0.92);
      }
    }
  });

  it("covers both poles of every trait across the set", () => {
    // Without this, someone low on a trait has no archetype that fits them.
    for (const trait of TRAITS) {
      const weights = ARCHETYPES.map((a) => a.vector[trait]);
      expect(Math.max(...weights), `${trait} high pole`).toBeGreaterThan(0.3);
      expect(Math.min(...weights), `${trait} low pole`).toBeLessThan(-0.2);
    }
  });
});

/* ------------------------------------------------------- four-pillar model */

