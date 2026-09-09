import { describe, expect, it } from "vitest";
import { ARCHETYPES } from "@/lib/personality/archetypes";
import {
  ARCHETYPES_4,
  ARCHETYPE_4_DEFINITIONS,
  archetype4ForFacet,
  type Archetype4,
} from "@/lib/personality/archetypes4";
import {
  ASPIRATION_ITEMS,
  aspirationBalance,
  aspirationForForm,
  scoreAspiration,
} from "@/lib/personality/aspiration";
import {
  buildFourArchetypeProfile,
  computeConfidence,
  facetFor,
  readContexts,
  readShadow,
  shareToScore,
  tallyScenarios,
  traitsFromScenarios,
} from "@/lib/personality/profile";
import {
  CONTEXTS,
  CORE_SCENARIOS,
  SCENARIOS,
  scenariosForForm,
} from "@/lib/personality/scenarios";
import { scoreFourArchetypes } from "@/lib/personality/scoring";
import { TRAITS } from "@/lib/personality/types";

const standing = SCENARIOS.filter((s) => s.kind === "standing");
const pressure = SCENARIOS.filter((s) => s.kind === "pressure");

/** Answer every standing situation as one archetype. */
const chooseAll = (archetype: Archetype4, list = SCENARIOS) => {
  const choices: Record<string, string> = {};
  for (const scenario of list.filter((s) => s.kind === "standing")) {
    const option = scenario.options.find((o) => o.archetype === archetype);
    if (option) choices[scenario.id] = option.id;
  }
  return choices;
};

const wantAll = (archetype: Archetype4, items = ASPIRATION_ITEMS) => {
  const choices: Record<string, "left" | "right"> = {};
  for (const item of items) {
    if (item.left.pillar === archetype) choices[item.id] = "left";
    else if (item.right.pillar === archetype) choices[item.id] = "right";
    else choices[item.id] = "left";
  }
  return choices;
};

describe("the four archetypes", () => {
  it("uses the framework's own names", () => {
    expect(ARCHETYPES_4).toEqual(["king", "warrior", "magician", "lover"]);
    expect(ARCHETYPE_4_DEFINITIONS.king.name).toBe("The King");
  });

  it("gives each one a desire, a fear, a function and both shadow poles", () => {
    for (const id of ARCHETYPES_4) {
      const a = ARCHETYPE_4_DEFINITIONS[id];
      expect(a.desires.length, id).toBeGreaterThan(60);
      expect(a.fear.length, id).toBeGreaterThan(20);
      expect(a.function.length, id).toBeGreaterThan(60);
      expect(a.inWork.length, id).toBeGreaterThan(40);
      expect(a.inRelationships.length, id).toBeGreaterThan(40);
      expect(a.whenMissing.length, id).toBeGreaterThan(40);
      expect(a.shadow.active.name, id).toBeTruthy();
      expect(a.shadow.passive.name, id).toBeTruthy();
      expect(a.shadow.active.tell.length, id).toBeGreaterThan(20);
      expect(a.immature.name, id).toBeTruthy();
      expect(a.development.length, id).toBeGreaterThanOrEqual(3);
      expect(a.gifts.length, id).toBeGreaterThanOrEqual(3);
    }
  });

  it("carries the canonical shadow and boy-psychology names", () => {
    expect(ARCHETYPE_4_DEFINITIONS.king.shadow.active.name).toBe("The Tyrant");
    expect(ARCHETYPE_4_DEFINITIONS.king.shadow.passive.name).toBe("The Weakling");
    expect(ARCHETYPE_4_DEFINITIONS.warrior.shadow.active.name).toBe("The Sadist");
    expect(ARCHETYPE_4_DEFINITIONS.warrior.shadow.passive.name).toBe("The Masochist");
    expect(ARCHETYPE_4_DEFINITIONS.magician.shadow.active.name).toBe("The Manipulator");
    expect(ARCHETYPE_4_DEFINITIONS.lover.shadow.active.name).toBe("The Addicted Lover");
    expect(ARCHETYPE_4_DEFINITIONS.lover.shadow.passive.name).toBe("The Impotent Lover");
    expect(ARCHETYPE_4_DEFINITIONS.king.immature.name).toBe("The Divine Child");
    expect(ARCHETYPE_4_DEFINITIONS.warrior.immature.name).toBe("The Hero");
    expect(ARCHETYPE_4_DEFINITIONS.magician.immature.name).toBe("The Precocious Child");
    expect(ARCHETYPE_4_DEFINITIONS.lover.immature.name).toBe("The Oedipal Child");
  });

  it("assigns every sub-archetype to exactly one energy", () => {
    const all = ARCHETYPES_4.flatMap((a) => ARCHETYPE_4_DEFINITIONS[a].facets);
    expect(new Set(all).size).toBe(all.length);
    expect(new Set(all)).toEqual(new Set(ARCHETYPES.map((a) => a.id)));
    for (const id of ARCHETYPES_4) {
      expect(ARCHETYPE_4_DEFINITIONS[id].facets.length, id).toBe(3);
    }
    expect(archetype4ForFacet("leader")).toBe("king");
    expect(archetype4ForFacet("nope")).toBeNull();
  });
});

describe("scenario bank", () => {
  it("is short enough to finish", () => {
    // Core form must stay under ~30 items, or nobody completes it.
    expect(CORE_SCENARIOS.length + aspirationForForm("core").length).toBeLessThanOrEqual(30);
    expect(scenariosForForm("deep").length).toBe(SCENARIOS.length);
  });

  it("offers one mature option per archetype in every standing situation", () => {
    for (const scenario of standing) {
      expect(scenario.options, scenario.id).toHaveLength(4);
      expect(new Set(scenario.options.map((o) => o.archetype)).size, scenario.id).toBe(4);
      expect(scenario.options.every((o) => o.mode === "mature"), scenario.id).toBe(true);
      expect(scenario.options.every((o) => Boolean(o.facet)), scenario.id).toBe(true);
    }
  });

  it("labels every standing option with a facet belonging to its own energy", () => {
    for (const scenario of standing) {
      for (const option of scenario.options) {
        expect(
          ARCHETYPE_4_DEFINITIONS[option.archetype].facets,
          `${option.id} (${option.archetype})`,
        ).toContain(option.facet);
      }
    }
  });

  it("gives every pressure situation one mature escape and at least two shadow options", () => {
    for (const scenario of pressure) {
      const modes = scenario.options.map((o) => o.mode);
      expect(modes.filter((m) => m === "mature").length, scenario.id).toBe(1);
      expect(modes.filter((m) => m !== "mature").length, scenario.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("covers all three facets of every energy across the standing set", () => {
    const seen = new Set(standing.flatMap((s) => s.options.map((o) => o.facet)));
    for (const id of ARCHETYPES_4) {
      for (const facet of ARCHETYPE_4_DEFINITIONS[id].facets) {
        expect(seen, `${id}/${facet}`).toContain(facet);
      }
    }
  });

  it("has unique scenario and option ids", () => {
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(SCENARIOS.length);
    const optionIds = SCENARIOS.flatMap((s) => s.options.map((o) => o.id));
    expect(new Set(optionIds).size).toBe(optionIds.length);
  });

  it("does not repeat an option's wording within a situation", () => {
    for (const scenario of SCENARIOS) {
      const texts = scenario.options.map((o) => o.text.toLowerCase().trim());
      expect(new Set(texts).size, scenario.id).toBe(texts.length);
    }
  });
});

describe("access scoring", () => {
  it("puts chance at the midpoint rather than at a quarter", () => {
    expect(shareToScore(0.25)).toBe(50);
    expect(shareToScore(0)).toBe(0);
    expect(shareToScore(1)).toBe(100);
  });

  it("tops out the energy chosen every time", () => {
    const tally = tallyScenarios(chooseAll("warrior"), standing);
    expect(tally.access.warrior).toBe(100);
    expect(tally.access.lover).toBe(0);
  });

  it("names the energy the situations point to, for each of the four", () => {
    for (const id of ARCHETYPES_4) {
      const profile = buildFourArchetypeProfile({
        scenarioChoices: chooseAll(id),
        scenarios: SCENARIOS,
        aspirationChoices: {},
        aspirationItems: ASPIRATION_ITEMS,
      });
      expect(profile.dominant, id).toBe(id);
      expect(profile.neglected, id).not.toBe(id);
    }
  });

  it("derives a trait signature from the same answers", () => {
    const warrior = traitsFromScenarios(chooseAll("warrior"), SCENARIOS);
    const lover = traitsFromScenarios(chooseAll("lover"), SCENARIOS);
    expect(warrior.competitiveness).toBeGreaterThan(lover.competitiveness);
    expect(lover.empathy).toBeGreaterThan(warrior.empathy);
    for (const trait of TRAITS) {
      expect(warrior[trait], trait).toBeGreaterThanOrEqual(0);
      expect(warrior[trait], trait).toBeLessThanOrEqual(100);
    }
  });

  it("identifies which sub-archetype of the dominant energy was expressed", () => {
    // Take the Guardian flavour of King wherever it is offered, and nothing
    // else King-flavoured, so the reading can only come from the choices.
    const choices: Record<string, string> = {};
    for (const scenario of standing) {
      const guardian = scenario.options.find((o) => o.facet === "guardian");
      choices[scenario.id] = (guardian ?? scenario.options.find((o) => o.archetype !== "king")!).id;
    }
    const facet = facetFor("king", tallyScenarios(choices, standing).facets);
    expect(facet?.archetype.id).toBe("guardian");
  });

  it("offers each sub-archetype equally often, so none wins on availability", () => {
    // An unbalanced bank would label a man by which option was offered most,
    // not by what he chose.
    for (const id of ARCHETYPES_4) {
      const counts = ARCHETYPE_4_DEFINITIONS[id].facets.map(
        (facet) => standing.filter((s) => s.options.some((o) => o.facet === facet)).length,
      );
      expect(new Set(counts).size, `${id}: ${counts.join("/")}`).toBe(1);
    }
  });
});

describe("shadow reading", () => {
  const pick = (mode: "active" | "passive" | "mature") => {
    const choices: Record<string, string> = {};
    for (const scenario of pressure) {
      const option = scenario.options.find((o) => o.mode === mode);
      if (option) choices[scenario.id] = option.id;
    }
    return choices;
  };

  it("reads the active pole", () => {
    const shadow = readShadow(tallyScenarios(pick("active"), pressure));
    expect(shadow.pole).toBe("active");
    expect(shadow.archetype).not.toBeNull();
  });

  it("reads the passive pole", () => {
    expect(readShadow(tallyScenarios(pick("passive"), pressure)).pole).toBe("passive");
  });

  it("reports no lean and full maturity when the mature option is taken throughout", () => {
    const shadow = readShadow(tallyScenarios(pick("mature"), pressure));
    expect(shadow.pole).toBe("balanced");
    expect(shadow.maturity).toBe(1);
    expect(shadow.matureCount).toBe(pressure.length);
  });
});

describe("confidence", () => {
  it("is high for a long, concentrated, decisive set of answers", () => {
    const profile = buildFourArchetypeProfile({
      scenarioChoices: chooseAll("magician"),
      scenarios: SCENARIOS,
      aspirationChoices: wantAll("magician"),
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(profile.confidence.percent).toBeGreaterThanOrEqual(75);
    expect(profile.confidence.label).toBe("high");
    expect(profile.confidence.margin).toBeGreaterThanOrEqual(0);
  });

  it("is low when the four are chosen evenly", () => {
    const choices: Record<string, string> = {};
    standing.forEach((scenario, i) => {
      const target = ARCHETYPES_4[i % 4] as Archetype4;
      choices[scenario.id] = scenario.options.find((o) => o.archetype === target)!.id;
    });
    const profile = buildFourArchetypeProfile({
      scenarioChoices: choices,
      scenarios: SCENARIOS,
      aspirationChoices: {},
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(profile.confidence.percent).toBeLessThan(55);
    expect(profile.confidence.reasons.join(" ")).toMatch(/spread almost evenly/);
    expect(profile.contested).toBe(true);
  });

  it("widens the band on the shorter form", () => {
    const core = buildFourArchetypeProfile({
      scenarioChoices: chooseAll("king", CORE_SCENARIOS),
      scenarios: CORE_SCENARIOS,
      aspirationChoices: {},
      aspirationItems: aspirationForForm("core"),
    });
    const deep = buildFourArchetypeProfile({
      scenarioChoices: chooseAll("king"),
      scenarios: SCENARIOS,
      aspirationChoices: {},
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(core.confidence.percent).toBeLessThan(deep.confidence.percent);
    expect(core.confidence.reasons.join(" ")).toMatch(/shorter form/);
  });

  it("reports a usable range around the leading score", () => {
    const profile = buildFourArchetypeProfile({
      scenarioChoices: chooseAll("lover"),
      scenarios: SCENARIOS,
      aspirationChoices: {},
      aspirationItems: ASPIRATION_ITEMS,
    });
    const c = profile.confidence;
    expect(c.low).toBeLessThanOrEqual(c.high);
    expect(c.low).toBeGreaterThanOrEqual(0);
    expect(c.high).toBeLessThanOrEqual(100);
  });

  it("returns zero confidence rather than a fake reading with no answers", () => {
    const c = computeConfidence(tallyScenarios({}, SCENARIOS), 0);
    expect(c.percent).toBe(0);
    expect(c.label).toBe("low");
  });
});

describe("aspiration and the growth gap", () => {
  it("balances every energy across the forced choices on both forms", () => {
    for (const form of ["core", "deep"] as const) {
      const counts = aspirationBalance(aspirationForForm(form));
      expect(new Set(Object.values(counts)).size, form).toBe(1);
    }
  });

  it("pairs two different energies in every item", () => {
    for (const item of ASPIRATION_ITEMS) {
      expect(item.left.pillar, item.id).not.toBe(item.right.pillar);
    }
  });

  it("only counts answered contests", () => {
    const scores = scoreAspiration({});
    for (const id of ARCHETYPES_4) expect(scores[id], id).toBe(50);
  });

  it("finds the growth edge where what you value outruns what you reach for", () => {
    const profile = buildFourArchetypeProfile({
      scenarioChoices: chooseAll("warrior"),
      scenarios: SCENARIOS,
      aspirationChoices: wantAll("lover"),
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(profile.dominant).toBe("warrior");
    expect(profile.growthEdge).toBe("lover");
    expect(profile.growthGap).toBeGreaterThan(30);
  });
});

describe("scoreFourArchetypes", () => {
  it("produces a complete result from situations alone", () => {
    const outcome = scoreFourArchetypes({
      scenarioChoices: chooseAll("king"),
      scenarios: SCENARIOS,
      aspirationChoices: wantAll("king"),
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(outcome.four.dominant).toBe("king");
    expect(outcome.facet).not.toBeNull();
    expect(ARCHETYPE_4_DEFINITIONS.king.facets).toContain(outcome.facet!.archetype.id);
    expect(outcome.ranking.length).toBeGreaterThan(0);
    expect(outcome.definingTraits.length).toBeGreaterThan(0);
  });

  it("describes balance across the four rather than naming a type", () => {
    const even: Record<string, string> = {};
    standing.forEach((scenario, i) => {
      const target = ARCHETYPES_4[i % 4] as Archetype4;
      even[scenario.id] = scenario.options.find((o) => o.archetype === target)!.id;
    });
    const outcome = scoreFourArchetypes({
      scenarioChoices: even,
      scenarios: SCENARIOS,
      aspirationChoices: {},
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(outcome.four.balanceLabel).toBe("balanced");
    expect(outcome.four.spread).toBeLessThan(25);
  });

  it("calls a one-sided profile concentrated", () => {
    const outcome = scoreFourArchetypes({
      scenarioChoices: chooseAll("magician"),
      scenarios: SCENARIOS,
      aspirationChoices: {},
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(outcome.four.balanceLabel).toBe("concentrated");
  });
});

describe("the confidence interval", () => {
  it("does not collapse to zero width when every choice went the same way", () => {
    // The normal approximation gives ±0 here, which would present a short,
    // perfectly consistent form as having no uncertainty at all.
    const profile = buildFourArchetypeProfile({
      scenarioChoices: chooseAll("king", CORE_SCENARIOS),
      scenarios: CORE_SCENARIOS,
      aspirationChoices: {},
      aspirationItems: aspirationForForm("core"),
    });
    expect(profile.confidence.margin).toBeGreaterThan(0);
    expect(profile.confidence.low).toBeLessThan(100);
  });

  it("stays inside the reportable range at both extremes", () => {
    for (const list of [CORE_SCENARIOS, SCENARIOS]) {
      for (const id of ARCHETYPES_4) {
        const c = buildFourArchetypeProfile({
          scenarioChoices: chooseAll(id, list),
          scenarios: list,
          aspirationChoices: {},
          aspirationItems: ASPIRATION_ITEMS,
        }).confidence;
        expect(c.low, id).toBeGreaterThanOrEqual(0);
        expect(c.high, id).toBeLessThanOrEqual(100);
        expect(c.low, id).toBeLessThanOrEqual(c.high);
      }
    }
  });

  it("narrows as more situations are answered", () => {
    const core = buildFourArchetypeProfile({
      scenarioChoices: chooseAll("lover", CORE_SCENARIOS),
      scenarios: CORE_SCENARIOS,
      aspirationChoices: {},
      aspirationItems: aspirationForForm("core"),
    }).confidence;
    const deep = buildFourArchetypeProfile({
      scenarioChoices: chooseAll("lover"),
      scenarios: SCENARIOS,
      aspirationChoices: {},
      aspirationItems: ASPIRATION_ITEMS,
    }).confidence;
    expect(deep.margin).toBeLessThan(core.margin);
    expect(deep.percent).toBeGreaterThanOrEqual(core.percent);
  });
});

describe("school-set situations", () => {
  it("gives every situation a concrete, imaginable setting", () => {
    for (const scenario of SCENARIOS) {
      // A scenario only measures behaviour if the taker can picture being in it.
      expect(scenario.setting.length, scenario.id).toBeGreaterThan(90);
      expect(scenario.prompt.length, scenario.id).toBeGreaterThan(8);
      expect(CONTEXTS, scenario.id).toContain(scenario.context);
    }
  });

  it("covers every part of school life", () => {
    const covered = new Set(standing.map((s) => s.context));
    for (const context of CONTEXTS) expect(covered, context).toContain(context);
  });

  it("gives each context enough standing situations to report on", () => {
    for (const context of CONTEXTS) {
      const count = standing.filter((s) => s.context === context).length;
      expect(count, context).toBeGreaterThanOrEqual(4);
    }
  });

  it("reads which energy is reached for in each context", () => {
    // Answer as the Lover in friendships and the Warrior everywhere else.
    const choices: Record<string, string> = {};
    for (const scenario of standing) {
      const want = scenario.context === "friendship" ? "lover" : "warrior";
      choices[scenario.id] = scenario.options.find((o) => o.archetype === want)!.id;
    }
    const contexts = readContexts(choices, SCENARIOS);
    const friendship = contexts.find((c) => c.context === "friendship")!;
    const classroom = contexts.find((c) => c.context === "classroom")!;
    expect(friendship.dominant).toBe("lover");
    expect(classroom.dominant).toBe("warrior");

    const profile = buildFourArchetypeProfile({
      scenarioChoices: choices,
      scenarios: SCENARIOS,
      aspirationChoices: {},
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(profile.contextSplit).toBe(true);
  });

  it("does not claim a split when the same energy is used everywhere", () => {
    const profile = buildFourArchetypeProfile({
      scenarioChoices: chooseAll("magician"),
      scenarios: SCENARIOS,
      aspirationChoices: {},
      aspirationItems: ASPIRATION_ITEMS,
    });
    expect(profile.contextSplit).toBe(false);
  });

  it("marks a context unreliable when too few situations covered it", () => {
    const single = standing.slice(0, 1);
    const choices = { [single[0]!.id]: single[0]!.options[0]!.id };
    const reading = readContexts(choices, single)[0]!;
    expect(reading.answered).toBe(1);
    expect(reading.reliable).toBe(false);
  });
});
