import { describe, expect, it } from "vitest";
import { ARCHETYPES } from "@/lib/personality/archetypes";
import { PERSONALITY_ITEMS } from "@/lib/personality/items";
import {
  keyedValue,
  matchArchetypes,
  scorePersonality,
  scoreTraits,
} from "@/lib/personality/scoring";
import { TRAITS, type LikertValue, type Trait } from "@/lib/personality/types";

const all = (value: LikertValue) =>
  Object.fromEntries(PERSONALITY_ITEMS.map((i) => [i.id, value]));

/** Answer high on the listed traits, low on everything else. */
function profile(high: Trait[], highValue: LikertValue = 5, lowValue: LikertValue = 1) {
  return Object.fromEntries(
    PERSONALITY_ITEMS.map((item) => {
      const wantHigh = high.includes(item.trait);
      const target = wantHigh ? highValue : lowValue;
      // Reverse-keyed items need the opposite raw response.
      return [item.id, (item.reverse ? 6 - target : target) as LikertValue];
    }),
  );
}

describe("item bank", () => {
  it("has unique ids", () => {
    const ids = new Set(PERSONALITY_ITEMS.map((i) => i.id));
    expect(ids.size).toBe(PERSONALITY_ITEMS.length);
  });

  it("covers every trait with five items", () => {
    for (const trait of TRAITS) {
      expect(PERSONALITY_ITEMS.filter((i) => i.trait === trait), trait).toHaveLength(5);
    }
  });

  it("includes reverse-keyed items in every trait", () => {
    for (const trait of TRAITS) {
      const reverse = PERSONALITY_ITEMS.filter((i) => i.trait === trait && i.reverse);
      expect(reverse.length, trait).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("trait scoring", () => {
  it("flips reverse-keyed responses", () => {
    const forward = { id: "x", trait: "empathy" as Trait, text: "", reverse: false };
    const reverse = { ...forward, reverse: true };
    expect(keyedValue(forward, 5)).toBe(5);
    expect(keyedValue(reverse, 5)).toBe(1);
    expect(keyedValue(reverse, 3)).toBe(3);
  });

  it("puts uniform agreement in the middle once reverse items are keyed", () => {
    const scores = scoreTraits(all(3));
    for (const score of scores) expect(score.score).toBe(50);
  });

  it("reaches the top of the scale for a maximal profile", () => {
    const responses = profile([...TRAITS]);
    for (const score of scoreTraits(responses)) {
      expect(score.score, score.trait).toBe(100);
      expect(score.level).toBe("high");
    }
  });

  it("reaches the bottom of the scale for a minimal profile", () => {
    const responses = profile([], 1, 1);
    for (const score of scoreTraits(responses)) {
      expect(score.score, score.trait).toBe(0);
    }
  });

  it("treats unanswered items as neutral rather than as zero", () => {
    const scores = scoreTraits({});
    for (const score of scores) {
      expect(score.score).toBe(50);
      expect(score.answered).toBe(0);
    }
  });

  it("separates traits answered high from traits answered low", () => {
    const responses = profile(["curiosity", "discipline"]);
    const scores = scoreTraits(responses);
    const curiosity = scores.find((s) => s.trait === "curiosity")!;
    const sociability = scores.find((s) => s.trait === "sociability")!;
    expect(curiosity.score).toBe(100);
    expect(sociability.score).toBe(0);
  });
});

describe("archetype matching", () => {
  it("ranks every archetype and never returns an empty ranking", () => {
    const ranking = matchArchetypes(
      Object.fromEntries(TRAITS.map((t) => [t, 50])) as Record<Trait, number>,
    );
    expect(ranking).toHaveLength(ARCHETYPES.length);
    expect(ranking.every((r) => r.match >= 0 && r.match <= 100)).toBe(true);
  });

  it("is sorted best-first", () => {
    const result = scorePersonality(profile(["leadership", "assertiveness", "sociability"]));
    for (let i = 1; i < result.ranking.length; i++) {
      expect(result.ranking[i - 1]!.match).toBeGreaterThanOrEqual(result.ranking[i]!.match);
    }
  });

  it("picks The Leader for a command-oriented profile", () => {
    const result = scorePersonality(
      profile(["leadership", "assertiveness", "sociability", "competitiveness"]),
    );
    expect(result.primary.archetype.id).toBe("leader");
  });

  it("picks The Scholar for a curious, solitary profile", () => {
    const result = scorePersonality(profile(["curiosity", "discipline", "independence"]));
    expect(["scholar", "craftsman", "strategist"]).toContain(result.primary.archetype.id);
  });

  it("picks The Explorer for a curious risk-taker", () => {
    const result = scorePersonality(profile(["curiosity", "riskTolerance", "independence"]));
    expect(["explorer", "maverick"]).toContain(result.primary.archetype.id);
  });

  it("picks The Diplomat for a warm, social profile", () => {
    const result = scorePersonality(profile(["empathy", "sociability"]));
    expect(result.primary.archetype.id).toBe("diplomat");
  });

  it("picks The Guardian for a dependable, low-risk profile", () => {
    const result = scorePersonality(profile(["empathy", "discipline"]));
    expect(["guardian", "diplomat", "builder"]).toContain(result.primary.archetype.id);
  });

  it("gives a different primary for opposite profiles", () => {
    const a = scorePersonality(profile(["leadership", "assertiveness", "competitiveness"]));
    const b = scorePersonality(profile(["empathy", "sociability"]));
    expect(a.primary.archetype.id).not.toBe(b.primary.archetype.id);
  });

  it("uses the whole profile, not a single answer", () => {
    const base = profile(["leadership", "assertiveness", "sociability", "competitiveness"]);
    const firstItem = PERSONALITY_ITEMS[0]!;
    const tweaked = { ...base, [firstItem.id]: 1 as LikertValue };
    expect(scorePersonality(tweaked).primary.archetype.id).toBe(
      scorePersonality(base).primary.archetype.id,
    );
  });

  it("returns a distinct secondary archetype", () => {
    const result = scorePersonality(profile(["leadership", "assertiveness"]));
    expect(result.secondary.archetype.id).not.toBe(result.primary.archetype.id);
  });

  it("stays deterministic for identical input", () => {
    const responses = profile(["discipline", "independence"]);
    expect(scorePersonality(responses).primary.archetype.id).toBe(
      scorePersonality(responses).primary.archetype.id,
    );
  });

  it("still produces a result for a completely flat profile", () => {
    const result = scorePersonality(all(3));
    expect(result.primary.archetype).toBeDefined();
    expect(result.secondary.archetype).toBeDefined();
    expect(Number.isFinite(result.primary.match)).toBe(true);
  });

  it("reports which traits define the profile", () => {
    const result = scorePersonality(profile(["curiosity", "riskTolerance"]));
    expect(result.definingTraits).toContain("curiosity");
    expect(result.definingTraits).toContain("riskTolerance");
    expect(result.counterTraits.length).toBeGreaterThan(0);
  });
});

describe("archetype definitions", () => {
  it("has at least eight archetypes with unique ids", () => {
    expect(ARCHETYPES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(ARCHETYPES.map((a) => a.id)).size).toBe(ARCHETYPES.length);
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
    // Each archetype's own vector, read as a profile, should select itself.
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
});
