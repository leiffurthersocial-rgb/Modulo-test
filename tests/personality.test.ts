import { describe, expect, it } from "vitest";
import { ARCHETYPES } from "@/lib/personality/archetypes";
import {
  CORE_ITEMS_PER_TRAIT,
  ITEMS_PER_TRAIT,
  PERSONALITY_ITEMS,
  SHORT_FORM_ITEMS,
  itemsForForm,
} from "@/lib/personality/items";
import { buildNarrative } from "@/lib/personality/narrative";
import { assessQuality } from "@/lib/personality/quality";
import {
  archetypeSimilarity,
  confidenceFor,
  keyedValue,
  matchArchetypes,
  pickSecondary,
  scorePersonality,
  scoreTraits,
} from "@/lib/personality/scoring";
import { compareProfiles } from "@/lib/personality/stability";
import { findCombinations } from "@/lib/personality/tensions";
import { TRAITS, type LikertValue, type Trait } from "@/lib/personality/types";

const all = (value: LikertValue, items = PERSONALITY_ITEMS) =>
  Object.fromEntries(items.map((i) => [i.id, value]));

/** Answer high on the listed traits, low on everything else. */
function profile(
  high: Trait[],
  highValue: LikertValue = 5,
  lowValue: LikertValue = 1,
  items = PERSONALITY_ITEMS,
) {
  return Object.fromEntries(
    items.map((item) => {
      const target = high.includes(item.trait) ? highValue : lowValue;
      return [item.id, (item.reverse ? 6 - target : target) as LikertValue];
    }),
  );
}

describe("item bank", () => {
  it("has unique ids", () => {
    expect(new Set(PERSONALITY_ITEMS.map((i) => i.id)).size).toBe(PERSONALITY_ITEMS.length);
  });

  it("has no duplicate statements", () => {
    const texts = PERSONALITY_ITEMS.map((i) => i.text.toLowerCase().trim());
    expect(new Set(texts).size).toBe(texts.length);
  });

  it("covers every trait with the same number of items", () => {
    for (const trait of TRAITS) {
      expect(PERSONALITY_ITEMS.filter((i) => i.trait === trait), trait).toHaveLength(
        ITEMS_PER_TRAIT,
      );
    }
  });

  it("balances forward and reversed keying exactly within every trait", () => {
    // Equal counts make acquiescence bias cancel rather than merely shrink.
    for (const trait of TRAITS) {
      const forTrait = PERSONALITY_ITEMS.filter((i) => i.trait === trait);
      const reverse = forTrait.filter((i) => i.reverse).length;
      expect(reverse * 2, trait).toBe(forTrait.length);
    }
  });

  it("keeps the short form balanced too", () => {
    expect(SHORT_FORM_ITEMS).toHaveLength(TRAITS.length * CORE_ITEMS_PER_TRAIT);
    for (const trait of TRAITS) {
      const forTrait = SHORT_FORM_ITEMS.filter((i) => i.trait === trait);
      expect(forTrait, trait).toHaveLength(CORE_ITEMS_PER_TRAIT);
      expect(forTrait.filter((i) => i.reverse).length * 2, trait).toBe(forTrait.length);
    }
  });

  it("never places two statements about the same trait back to back", () => {
    for (const items of [PERSONALITY_ITEMS, SHORT_FORM_ITEMS]) {
      for (let i = 1; i < items.length; i++) {
        expect(items[i]!.trait, `${items[i - 1]!.id} then ${items[i]!.id}`).not.toBe(
          items[i - 1]!.trait,
        );
      }
    }
  });

  it("returns the requested form", () => {
    expect(itemsForForm("short")).toHaveLength(36);
    expect(itemsForForm("full")).toHaveLength(72);
  });
});

describe("trait scoring", () => {
  it("flips reverse-keyed responses", () => {
    const forward = { id: "x", trait: "empathy" as Trait, text: "", reverse: false, core: true };
    expect(keyedValue(forward, 5)).toBe(5);
    expect(keyedValue({ ...forward, reverse: true }, 5)).toBe(1);
    expect(keyedValue({ ...forward, reverse: true }, 3)).toBe(3);
  });

  it("puts uniform agreement exactly in the middle", () => {
    // The balanced keying is what guarantees this: agreeing with everything
    // must not produce a high profile on any trait.
    for (const value of [1, 2, 4, 5] as LikertValue[]) {
      for (const score of scoreTraits(all(value))) {
        expect(score.score, `${value} on ${score.trait}`).toBe(50);
      }
    }
  });

  it("reaches both ends of the scale", () => {
    for (const s of scoreTraits(profile([...TRAITS]))) expect(s.score, s.trait).toBe(100);
    for (const s of scoreTraits(profile([]))) expect(s.score, s.trait).toBe(0);
  });

  it("treats unanswered items as neutral rather than as zero", () => {
    for (const score of scoreTraits({})) {
      expect(score.score).toBe(50);
      expect(score.answered).toBe(0);
    }
  });

  it("reports each trait's distance from the taker's own average", () => {
    const outcome = scorePersonality(profile(["curiosity", "discipline"]));
    const curiosity = outcome.traits.find((t) => t.trait === "curiosity")!;
    const sociability = outcome.traits.find((t) => t.trait === "sociability")!;
    expect(curiosity.relative).toBeGreaterThan(0);
    expect(sociability.relative).toBeLessThan(0);
  });
});

describe("response quality", () => {
  it("passes a considered, varied set of answers", () => {
    const quality = assessQuality(profile(["leadership", "curiosity"]), PERSONALITY_ITEMS);
    expect(quality.level).toBe("good");
    expect(quality.flags).toEqual([]);
  });

  it("catches straight-lining", () => {
    const quality = assessQuality(all(4), PERSONALITY_ITEMS);
    expect(quality.level).toBe("questionable");
    expect(quality.flags.map((f) => f.code)).toContain("straight-lining");
    expect(quality.longestRun).toBe(PERSONALITY_ITEMS.length);
  });

  it("catches an all-neutral profile", () => {
    const quality = assessQuality(all(3), PERSONALITY_ITEMS);
    expect(quality.flags.map((f) => f.code)).toContain("midpoint");
    expect(quality.midpointShare).toBe(1);
  });

  it("catches self-contradiction between forward and reversed statements", () => {
    // Agreeing strongly with both "I take charge" and "I avoid taking charge".
    const responses = Object.fromEntries(
      PERSONALITY_ITEMS.map((i) => [i.id, 5 as LikertValue]),
    );
    const quality = assessQuality(responses, PERSONALITY_ITEMS);
    expect(quality.inconsistency).toBeGreaterThanOrEqual(1.5);
    expect(quality.flags.map((f) => f.code)).toContain("inconsistent");
  });

  it("reports a consistency figure per trait", () => {
    const quality = assessQuality(profile(["empathy"]), PERSONALITY_ITEMS);
    expect(Object.keys(quality.traitInconsistency)).toHaveLength(TRAITS.length);
    for (const value of Object.values(quality.traitInconsistency)) {
      expect(value).toBeLessThan(0.5);
    }
  });

  it("flags an incomplete profile without refusing to score it", () => {
    const partial = Object.fromEntries(
      PERSONALITY_ITEMS.slice(0, 40).map((i) => [i.id, 4 as LikertValue]),
    );
    const quality = assessQuality(partial, PERSONALITY_ITEMS);
    expect(quality.flags.map((f) => f.code)).toContain("incomplete");
    expect(quality.answered).toBe(40);
  });
});

describe("archetype matching", () => {
  it("ranks every archetype within bounds", () => {
    const flat = Object.fromEntries(TRAITS.map((t) => [t, 50])) as Record<Trait, number>;
    const ranking = matchArchetypes(flat);
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

  it("picks a solitary, deep archetype for a curious independent profile", () => {
    const result = scorePersonality(profile(["curiosity", "discipline", "independence"]));
    expect(["scholar", "craftsman", "strategist"]).toContain(result.primary.archetype.id);
  });

  it("picks an exploratory archetype for a curious risk-taker", () => {
    const result = scorePersonality(profile(["curiosity", "riskTolerance", "independence"]));
    expect(["explorer", "maverick"]).toContain(result.primary.archetype.id);
  });

  it("picks a people-first archetype for a warm, social profile", () => {
    const result = scorePersonality(profile(["empathy", "sociability"]));
    expect(["diplomat", "advocate", "catalyst"]).toContain(result.primary.archetype.id);
  });

  it("distinguishes a warm profile that speaks up from one that does not", () => {
    const quiet = scorePersonality(profile(["empathy", "sociability"]));
    const outspoken = scorePersonality(profile(["empathy", "sociability", "assertiveness"]));
    expect(outspoken.primary.archetype.id).not.toBe(quiet.primary.archetype.id);
  });

  it("uses the whole profile, not a single answer", () => {
    const base = profile(["leadership", "assertiveness", "sociability", "competitiveness"]);
    const tweaked = { ...base, [PERSONALITY_ITEMS[0]!.id]: 1 as LikertValue };
    expect(scorePersonality(tweaked).primary.archetype.id).toBe(
      scorePersonality(base).primary.archetype.id,
    );
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

  it("scores the short and full forms consistently", () => {
    const short = scorePersonality(
      profile(["leadership", "assertiveness", "competitiveness"], 5, 1, SHORT_FORM_ITEMS),
      SHORT_FORM_ITEMS,
    );
    const full = scorePersonality(profile(["leadership", "assertiveness", "competitiveness"]));
    expect(short.primary.archetype.id).toBe(full.primary.archetype.id);
  });
});

describe("secondary archetype selection", () => {
  it("never returns the primary", () => {
    for (const trait of TRAITS) {
      const result = scorePersonality(profile([trait]));
      expect(result.secondary.archetype.id, trait).not.toBe(result.primary.archetype.id);
    }
  });

  it("skips a runner-up that is a near-clone of the primary", () => {
    // Scholar and Craftsman describe substantially the same person; reporting
    // both would tell the taker nothing they did not learn from the first.
    const scholar = ARCHETYPES.find((a) => a.id === "scholar")!;
    const craftsman = ARCHETYPES.find((a) => a.id === "craftsman")!;
    expect(archetypeSimilarity(scholar, craftsman)).toBeGreaterThan(0.72);

    const ranking = [
      { archetype: scholar, match: 90 },
      { archetype: craftsman, match: 89 },
      { archetype: ARCHETYPES.find((a) => a.id === "catalyst")!, match: 40 },
    ];
    expect(pickSecondary(ranking, ranking[0]!).archetype.id).toBe("catalyst");
  });

  it("keeps the runner-up when it is genuinely different", () => {
    const leader = ARCHETYPES.find((a) => a.id === "leader")!;
    const scholar = ARCHETYPES.find((a) => a.id === "scholar")!;
    const ranking = [
      { archetype: leader, match: 88 },
      { archetype: scholar, match: 70 },
    ];
    expect(pickSecondary(ranking, ranking[0]!).archetype.id).toBe("scholar");
  });
});

describe("match confidence", () => {
  const goodQuality = assessQuality(profile(["leadership"]), PERSONALITY_ITEMS);

  it("calls a wide margin clear", () => {
    expect(confidenceFor(12, goodQuality)).toBe("clear");
  });

  it("calls a narrow margin borderline", () => {
    expect(confidenceFor(0.4, goodQuality)).toBe("borderline");
  });

  it("refuses to claim a clear fit on unreliable answers", () => {
    const bad = assessQuality(all(4), PERSONALITY_ITEMS);
    expect(bad.level).toBe("questionable");
    expect(confidenceFor(30, bad)).toBe("borderline");
  });

  it("reports the margin alongside the primary", () => {
    const result = scorePersonality(profile(["leadership", "assertiveness"]));
    expect(result.margin).toBeGreaterThanOrEqual(0);
    expect(result.margin).toBeCloseTo(result.primary.match - result.secondary.match, 5);
  });
});

describe("trait combinations", () => {
  it("finds the blunt-instrument pattern", () => {
    const result = scorePersonality(profile(["assertiveness", "leadership"]));
    const ids = result.combinations.map((c) => c.id);
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

describe("narrative", () => {
  it("names the taker's own standout traits", () => {
    const result = scorePersonality(profile(["curiosity", "riskTolerance"]));
    const text = buildNarrative(result).join(" ").toLowerCase();
    expect(text).toContain("curiosity");
    expect(text).toContain("risk tolerance");
  });

  it("differs between two different profiles", () => {
    const a = buildNarrative(scorePersonality(profile(["leadership", "competitiveness"]))).join(" ");
    const b = buildNarrative(scorePersonality(profile(["empathy", "sociability"]))).join(" ");
    expect(a).not.toBe(b);
  });

  it("says so when the answers do not support the result", () => {
    const text = buildNarrative(scorePersonality(all(4))).join(" ");
    expect(text.toLowerCase()).toContain("not because it has been earned");
  });

  it("describes a flat profile honestly rather than dramatically", () => {
    const text = buildNarrative(scorePersonality(all(3))).join(" ").toLowerCase();
    expect(text).toContain("unusually close together");
  });
});

describe("retake stability", () => {
  const base = Object.fromEntries(TRAITS.map((t, i) => [t, 30 + i * 6])) as Record<Trait, number>;

  it("calls a near-identical retake stable", () => {
    const after = Object.fromEntries(TRAITS.map((t) => [t, base[t] + 2])) as Record<Trait, number>;
    const report = compareProfiles(base, after, { sameArchetype: true });
    expect(report.verdict).toBe("stable");
    expect(report.agreement).toBeGreaterThan(0.95);
  });

  it("calls a reversed profile unstable", () => {
    const after = Object.fromEntries(TRAITS.map((t) => [t, 100 - base[t]])) as Record<Trait, number>;
    const report = compareProfiles(base, after, { sameArchetype: false });
    expect(report.verdict).toBe("unstable");
    expect(report.agreement).toBeLessThan(0);
  });

  it("ranks the biggest movers first", () => {
    const after = { ...base, empathy: base.empathy + 40 };
    const report = compareProfiles(base, after, { sameArchetype: true });
    expect(report.shifts[0]!.trait).toBe("empathy");
    expect(report.shifts[0]!.delta).toBe(40);
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

