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
import {
  ASPIRATION_ITEMS,
  aspirationBalance,
  aspirationForForm,
  scoreAspiration,
} from "@/lib/personality/aspiration";
import { PILLARS, PILLAR_DEFINITIONS, type Pillar } from "@/lib/personality/pillars";
import {
  buildFourPillarProfile,
  pillarsFromTraits,
  readShadow,
  shareToScore,
  tallyScenarios,
} from "@/lib/personality/profile";
import { SCENARIOS } from "@/lib/personality/scenarios";
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

describe("four-pillar model", () => {
  it("assigns every archetype to exactly one pillar", () => {
    const assigned = PILLARS.flatMap((p) => PILLAR_DEFINITIONS[p].archetypes);
    expect(new Set(assigned).size).toBe(assigned.length);
    expect(new Set(assigned)).toEqual(new Set(ARCHETYPES.map((a) => a.id)));
    for (const pillar of PILLARS) {
      expect(PILLAR_DEFINITIONS[pillar].archetypes.length, pillar).toBe(3);
    }
  });

  it("gives every pillar both shadow poles and development steps", () => {
    for (const pillar of PILLARS) {
      const d = PILLAR_DEFINITIONS[pillar];
      expect(d.shadow.inflated.name, pillar).toBeTruthy();
      expect(d.shadow.deflated.name, pillar).toBeTruthy();
      expect(d.shadow.inflated.tell.length, pillar).toBeGreaterThan(20);
      expect(d.development.length, pillar).toBeGreaterThanOrEqual(3);
      expect(d.gifts.length, pillar).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps the pillar trait vectors distinct from one another", () => {
    for (let i = 0; i < PILLARS.length; i++) {
      for (let j = i + 1; j < PILLARS.length; j++) {
        const a = PILLAR_DEFINITIONS[PILLARS[i]!].vector;
        const b = PILLAR_DEFINITIONS[PILLARS[j]!].vector;
        const shared = TRAITS.reduce((s, t) => s + a[t] * b[t], 0);
        const magnitude =
          Math.sqrt(TRAITS.reduce((s, t) => s + a[t] ** 2, 0)) *
          Math.sqrt(TRAITS.reduce((s, t) => s + b[t] ** 2, 0));
        expect(shared / magnitude, `${PILLARS[i]} vs ${PILLARS[j]}`).toBeLessThan(0.75);
      }
    }
  });

  it("maps a trait profile onto the pillar its traits describe", () => {
    const build = (high: Trait[]) =>
      Object.fromEntries(TRAITS.map((t) => [t, high.includes(t) ? 90 : 25])) as Record<Trait, number>;
    const best = (scores: Record<Pillar, number>) =>
      PILLARS.reduce((a, b) => (scores[a] >= scores[b] ? a : b));

    expect(best(pillarsFromTraits(build(["leadership", "empathy", "discipline"])))).toBe("sovereign");
    expect(best(pillarsFromTraits(build(["competitiveness", "assertiveness"])))).toBe("warrior");
    expect(best(pillarsFromTraits(build(["curiosity", "independence"])))).toBe("magician");
    expect(best(pillarsFromTraits(build(["empathy", "sociability"])))).toBe("lover");
  });
});

describe("scenario scoring", () => {
  const standing = SCENARIOS.filter((s) => s.kind === "standing");

  it("offers one mature option per pillar in every standing scenario", () => {
    for (const scenario of standing) {
      expect(scenario.options, scenario.id).toHaveLength(4);
      const pillars = scenario.options.map((o) => o.pillar);
      expect(new Set(pillars).size, scenario.id).toBe(4);
      expect(scenario.options.every((o) => o.mode === "mature"), scenario.id).toBe(true);
    }
  });

  it("gives every pressure scenario a mature escape and at least two shadow options", () => {
    for (const scenario of SCENARIOS.filter((s) => s.kind === "pressure")) {
      const modes = scenario.options.map((o) => o.mode);
      expect(modes.filter((m) => m === "mature").length, scenario.id).toBe(1);
      expect(modes.filter((m) => m !== "mature").length, scenario.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("has unique scenario and option ids", () => {
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(SCENARIOS.length);
    const optionIds = SCENARIOS.flatMap((s) => s.options.map((o) => o.id));
    expect(new Set(optionIds).size).toBe(optionIds.length);
  });

  it("puts chance at the midpoint rather than at a quarter", () => {
    // Choosing a pillar 1 time in 4 is no preference at all.
    expect(shareToScore(0.25)).toBe(50);
    expect(shareToScore(0)).toBe(0);
    expect(shareToScore(1)).toBe(100);
    expect(shareToScore(0.5)).toBeGreaterThan(50);
  });

  it("scores a taker who always picks the same pillar at the top of that pillar", () => {
    const choices: Record<string, string> = {};
    for (const scenario of standing) {
      choices[scenario.id] = scenario.options.find((o) => o.pillar === "warrior")!.id;
    }
    const tally = tallyScenarios(choices, standing);
    expect(tally.pillars.warrior).toBe(100);
    expect(tally.pillars.lover).toBe(0);
  });

  it("reads the inflated shadow when pressure choices are inflated", () => {
    const pressure = SCENARIOS.filter((s) => s.kind === "pressure");
    const choices: Record<string, string> = {};
    for (const scenario of pressure) {
      const inflated = scenario.options.find((o) => o.mode === "inflated");
      if (inflated) choices[scenario.id] = inflated.id;
    }
    const shadow = readShadow(tallyScenarios(choices, pressure));
    expect(shadow.pole).toBe("inflated");
    expect(shadow.pillar).not.toBeNull();
  });

  it("reads the deflated shadow when pressure choices are deflated", () => {
    const pressure = SCENARIOS.filter((s) => s.kind === "pressure");
    const choices: Record<string, string> = {};
    for (const scenario of pressure) {
      const deflated = scenario.options.find((o) => o.mode === "deflated");
      if (deflated) choices[scenario.id] = deflated.id;
    }
    expect(readShadow(tallyScenarios(choices, pressure)).pole).toBe("deflated");
  });

  it("reports no shadow lean when the mature option is chosen throughout", () => {
    const pressure = SCENARIOS.filter((s) => s.kind === "pressure");
    const choices: Record<string, string> = {};
    for (const scenario of pressure) {
      choices[scenario.id] = scenario.options.find((o) => o.mode === "mature")!.id;
    }
    const shadow = readShadow(tallyScenarios(choices, pressure));
    expect(shadow.pole).toBe("balanced");
    expect(shadow.matureCount).toBe(pressure.length);
  });
});

describe("aspiration (forced choice)", () => {
  it("gives every pillar the same number of appearances on both forms", () => {
    for (const form of ["short", "full"] as const) {
      const counts = aspirationBalance(aspirationForForm(form));
      const values = Object.values(counts);
      expect(new Set(values).size, form).toBe(1);
      expect(values[0], form).toBeGreaterThan(0);
    }
  });

  it("pairs two different pillars in every item", () => {
    for (const item of ASPIRATION_ITEMS) {
      expect(item.left.pillar, item.id).not.toBe(item.right.pillar);
    }
  });

  it("scores a pillar at 100 when it wins every contest it appears in", () => {
    const choices: Record<string, "left" | "right"> = {};
    for (const item of ASPIRATION_ITEMS) {
      if (item.left.pillar === "lover") choices[item.id] = "left";
      else if (item.right.pillar === "lover") choices[item.id] = "right";
      else choices[item.id] = "left";
    }
    expect(scoreAspiration(choices).lover).toBe(100);
  });

  it("defaults to the midpoint when nothing was answered", () => {
    // A pillar must not read as "not valued" merely because the section is
    // unfinished — only answered contests count towards a pillar's share.
    const scores = scoreAspiration({});
    for (const pillar of PILLARS) expect(scores[pillar], pillar).toBe(50);
  });

  it("ignores unanswered pairs rather than counting them as losses", () => {
    const answered = ASPIRATION_ITEMS[0]!;
    const winner =
      answered.left.pillar === "sovereign" || answered.right.pillar === "sovereign"
        ? "sovereign"
        : answered.left.pillar;
    const side = answered.left.pillar === winner ? "left" : "right";
    const scores = scoreAspiration({ [answered.id]: side });
    expect(scores[winner]).toBe(100);
    const loser = side === "left" ? answered.right.pillar : answered.left.pillar;
    expect(scores[loser]).toBe(0);
    // Pillars in no answered contest stay neutral.
    for (const pillar of PILLARS) {
      if (pillar !== winner && pillar !== loser) expect(scores[pillar], pillar).toBe(50);
    }
  });
});

describe("combined four-pillar profile", () => {
  const traitProfile = (high: Trait[]) =>
    Object.fromEntries(TRAITS.map((t) => [t, high.includes(t) ? 85 : 30])) as Record<Trait, number>;

  const pickPillar = (pillar: Pillar) => {
    const scenarioChoices: Record<string, string> = {};
    for (const scenario of SCENARIOS.filter((s) => s.kind === "standing")) {
      scenarioChoices[scenario.id] = scenario.options.find((o) => o.pillar === pillar)!.id;
    }
    return scenarioChoices;
  };

  const wantPillar = (pillar: Pillar) => {
    const choices: Record<string, "left" | "right"> = {};
    for (const item of ASPIRATION_ITEMS) {
      if (item.left.pillar === pillar) choices[item.id] = "left";
      else if (item.right.pillar === pillar) choices[item.id] = "right";
      else choices[item.id] = "left";
    }
    return choices;
  };

  it("names the pillar the situational choices point to", () => {
    const profile = buildFourPillarProfile({
      traitScores: traitProfile(["curiosity", "independence"]),
      scenarioChoices: pickPillar("magician"),
      scenarios: SCENARIOS,
      aspirationChoices: wantPillar("magician"),
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(profile.primary).toBe("magician");
    expect(profile.leastDeveloped).not.toBe("magician");
  });

  it("finds the growth edge where aspiration outruns expression", () => {
    // Acts like a Warrior throughout, but says the Lover matters most.
    const profile = buildFourPillarProfile({
      traitScores: traitProfile(["competitiveness", "assertiveness", "discipline"]),
      scenarioChoices: pickPillar("warrior"),
      scenarios: SCENARIOS,
      aspirationChoices: wantPillar("lover"),
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(profile.primary).toBe("warrior");
    expect(profile.growthEdge).toBe("lover");
    expect(profile.growthGap).toBeGreaterThan(20);
  });

  it("weights situational choices above self-description", () => {
    // Describes himself as a Lover, acts like a Warrior everywhere.
    const profile = buildFourPillarProfile({
      traitScores: traitProfile(["empathy", "sociability"]),
      scenarioChoices: pickPillar("warrior"),
      scenarios: SCENARIOS,
      aspirationChoices: {},
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(profile.primary).toBe("warrior");
    expect(profile.divergentPillar).not.toBeNull();
    expect(profile.selfReportDivergence).toBeGreaterThan(20);
  });

  it("flows through scorePersonality and picks a sub-archetype in the dominant pillar", () => {
    const responses = Object.fromEntries(
      PERSONALITY_ITEMS.map((item) => {
        const target = ["curiosity", "independence", "discipline"].includes(item.trait) ? 5 : 1;
        return [item.id, (item.reverse ? 6 - target : target) as LikertValue];
      }),
    );
    const outcome = scorePersonality(responses, PERSONALITY_ITEMS, {
      scenarioChoices: pickPillar("magician"),
      scenarios: SCENARIOS,
      aspirationChoices: wantPillar("magician"),
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(outcome.pillars).not.toBeNull();
    expect(outcome.pillars!.primary).toBe("magician");
    expect(outcome.pillarArchetype).not.toBeNull();
    expect(PILLAR_DEFINITIONS.magician.archetypes).toContain(
      outcome.pillarArchetype!.archetype.id,
    );
  });

  it("still scores without the situational sections", () => {
    const outcome = scorePersonality(profile(["leadership"]));
    expect(outcome.pillars).toBeNull();
    expect(outcome.pillarArchetype).toBeNull();
    expect(outcome.primary.archetype).toBeDefined();
  });
});

describe("pillar ties", () => {
  const flat = Object.fromEntries(TRAITS.map((t) => [t, 50])) as Record<Trait, number>;

  it("reports a near-tie instead of presenting an arbitrary winner as a finding", () => {
    // Two situational choices each for two pillars: genuinely level.
    const standing = SCENARIOS.filter((s) => s.kind === "standing").slice(0, 4);
    const scenarioChoices: Record<string, string> = {};
    standing.forEach((scenario, i) => {
      const pillar = i < 2 ? "warrior" : "lover";
      scenarioChoices[scenario.id] = scenario.options.find((o) => o.pillar === pillar)!.id;
    });
    const profile = buildFourPillarProfile({
      traitScores: flat,
      scenarioChoices,
      scenarios: standing,
      aspirationChoices: {},
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(profile.primaryMargin).toBeLessThan(4);
    expect(profile.primaryContested).toBe(true);
  });

  it("does not flag a decisive lead as contested", () => {
    const standing = SCENARIOS.filter((s) => s.kind === "standing");
    const scenarioChoices: Record<string, string> = {};
    for (const scenario of standing) {
      scenarioChoices[scenario.id] = scenario.options.find((o) => o.pillar === "magician")!.id;
    }
    const profile = buildFourPillarProfile({
      traitScores: flat,
      scenarioChoices,
      scenarios: standing,
      aspirationChoices: {},
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(profile.primary).toBe("magician");
    expect(profile.primaryContested).toBe(false);
    expect(profile.primaryMargin).toBeGreaterThan(20);
  });
});
