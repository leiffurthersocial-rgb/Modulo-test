import type { Trait } from "./types";

/**
 * The four-pillar model.
 *
 * The structure — four domains of mature masculine character, each with an
 * inflated and a deflated shadow — follows the King / Warrior / Magician /
 * Lover framework set out by Robert Moore and Douglas Gillette in 1990, itself
 * drawn from Jungian archetype theory. Modulo uses the structure and writes its
 * own content: the descriptions, sub-archetypes, trait loadings and scoring
 * here are ours, and neither the framework nor our implementation of it is an
 * empirically validated instrument.
 *
 * Each pillar is measured three ways, because self-report alone measures
 * self-image as much as behaviour:
 *
 *   1. Trait loadings from the statement questionnaire — how you describe yourself.
 *   2. Situational choices — what you say you would actually do.
 *   3. Forced-choice priorities — what you would refuse to give up.
 *
 * (2) minus (1) is where self-image and habit diverge; (3) minus (2) is the gap
 * between what you value and what you currently do, which is the most useful
 * thing the assessment produces.
 */

export type Pillar = "sovereign" | "warrior" | "magician" | "lover";

export const PILLARS: Pillar[] = ["sovereign", "warrior", "magician", "lover"];

export interface PillarShadow {
  /** Too much of the pillar, unchecked. */
  inflated: { name: string; description: string; tell: string };
  /** Too little — the capacity present but unclaimed. */
  deflated: { name: string; description: string; tell: string };
}

export interface PillarDefinition {
  id: Pillar;
  name: string;
  /** The classical name from the framework this structure follows. */
  classical: string;
  tagline: string;
  question: string;
  description: string;
  /** What this pillar contributes when it is working. */
  gifts: string[];
  shadow: PillarShadow;
  /** How the nine traits load onto this pillar. */
  vector: Record<Trait, number>;
  /** Concrete practices that develop it, shown when it is the growth edge. */
  development: string[];
  /** Archetype ids belonging to this pillar. */
  archetypes: string[];
}

const v = (partial: Partial<Record<Trait, number>>): Record<Trait, number> => ({
  leadership: 0,
  independence: 0,
  discipline: 0,
  sociability: 0,
  riskTolerance: 0,
  curiosity: 0,
  assertiveness: 0,
  empathy: 0,
  competitiveness: 0,
  ...partial,
});

export const PILLAR_DEFINITIONS: Record<Pillar, PillarDefinition> = {
  sovereign: {
    id: "sovereign",
    name: "The Sovereign",
    classical: "King",
    tagline: "Order, responsibility, and making room for other people.",
    question: "Do you take responsibility for the whole, not just your part?",
    description:
      "The Sovereign is the ordering function: deciding what matters, holding the centre steady, and creating conditions in which other people can do their best work. Its signature is not command but responsibility — the willingness to own an outcome that depends on people you cannot control. A working Sovereign is calm under pressure, gives credit outward, and is not threatened by talent beneath him.",
    gifts: [
      "Holds the centre when others are reacting",
      "Sets direction people can actually act on",
      "Recognises and promotes ability rather than guarding against it",
    ],
    shadow: {
      inflated: {
        name: "The Tyrant",
        description:
          "Order enforced for its own sake. The Tyrant confuses being in charge with being correct, treats disagreement as disloyalty, and cannot let a decision be made by anyone else.",
        tell: "You find yourself relitigating decisions other people were entitled to make.",
      },
      deflated: {
        name: "The Abdicator",
        description:
          "Authority present but declined. The Abdicator has the standing to make the call and leaves the vacuum open, then resents the person who eventually fills it.",
        tell: "You saw the decision that needed making and waited for someone else to make it.",
      },
    },
    vector: v({
      leadership: 1.0,
      discipline: 0.6,
      empathy: 0.5,
      assertiveness: 0.4,
      sociability: 0.3,
      independence: 0.2,
      competitiveness: 0.1,
    }),
    development: [
      "Make one decision this week that you have been leaving to the group.",
      "Name publicly a piece of work that was not yours — credit is the Sovereign's cheapest and most underused instrument.",
      "Take responsibility once for an outcome you did not personally cause.",
    ],
    archetypes: ["leader", "guardian", "strategist"],
  },

  warrior: {
    id: "warrior",
    name: "The Warrior",
    classical: "Warrior",
    tagline: "Will, boundaries, and finishing what is difficult.",
    question: "Do you act when acting costs you something?",
    description:
      "The Warrior is the executing function: deciding what to do and then actually doing it, including the parts that are unpleasant, unglamorous or unpopular. Its signature is a clean relationship with difficulty — not the absence of fear but the willingness to move anyway. A working Warrior holds boundaries without cruelty, and knows what he is in service of.",
    gifts: [
      "Moves decisively when the cost of waiting is real",
      "Holds a boundary without needing to justify it repeatedly",
      "Finishes the unglamorous eighty per cent",
    ],
    shadow: {
      inflated: {
        name: "The Brute",
        description:
          "Force with no cause behind it. The Brute treats every disagreement as a contest, mistakes damage for strength, and cannot tell the difference between a boundary and an attack.",
        tell: "You have won an argument recently that you would have been better off losing.",
      },
      deflated: {
        name: "The Avoider",
        description:
          "Capacity present, never spent. The Avoider mistakes conflict-avoidance for peacefulness, lets small violations accumulate, and calls it being easy to work with.",
        tell: "There is a conversation you have been not-having for more than a month.",
      },
    },
    vector: v({
      competitiveness: 0.9,
      assertiveness: 0.9,
      discipline: 0.7,
      riskTolerance: 0.5,
      independence: 0.4,
      leadership: 0.3,
      empathy: -0.4,
      sociability: -0.1,
      curiosity: -0.1,
    }),
    development: [
      "Have the conversation you have been postponing, this week, without softening the ask.",
      "Pick one commitment and keep it exactly, at a cost, to re-establish that your word is load-bearing.",
      "Say no to something you would normally absorb.",
    ],
    archetypes: ["competitor", "maverick", "builder"],
  },

  magician: {
    id: "magician",
    name: "The Magician",
    classical: "Magician",
    tagline: "Knowledge, insight, and seeing what is actually happening.",
    question: "Do you understand the thing, or only operate it?",
    description:
      "The Magician is the knowing function: mastery of a domain deep enough to see the mechanism rather than the surface, and the detachment to read a situation without being inside it. Its signature is the useful question nobody else thought to ask. A working Magician uses what he sees in service of others, and says plainly what he knows.",
    gifts: [
      "Sees the mechanism under the symptom",
      "Stays analytical when everyone else is reacting",
      "Turns hard-won understanding into something others can use",
    ],
    shadow: {
      inflated: {
        name: "The Manipulator",
        description:
          "Insight used privately. The Manipulator knows more than he says, withholds to preserve advantage, and steers people who believe they are deciding freely.",
        tell: "You have let someone proceed on an understanding you knew was incomplete.",
      },
      deflated: {
        name: "The Bystander",
        description:
          "Understanding without engagement. The Bystander sees exactly what is going wrong, says nothing, and treats being right in private as a substitute for acting.",
        tell: "You watched something fail in a way you had predicted, and had not said so out loud.",
      },
    },
    vector: v({
      curiosity: 1.0,
      independence: 0.6,
      discipline: 0.4,
      empathy: 0.1,
      riskTolerance: -0.1,
      leadership: -0.2,
      competitiveness: -0.2,
      assertiveness: -0.3,
      sociability: -0.5,
    }),
    development: [
      "Say the thing you can see, out loud, to the person who needs it — not to the room afterwards.",
      "Teach one thing you know well to someone who does not; withheld knowledge decays.",
      "Go one level deeper on something you currently only operate.",
    ],
    archetypes: ["scholar", "craftsman", "explorer"],
  },

  lover: {
    id: "lover",
    name: "The Lover",
    classical: "Lover",
    tagline: "Connection, feeling, and being genuinely present.",
    question: "Are you actually in your life, or managing it from a distance?",
    description:
      "The Lover is the connecting function: appetite for the world, attention to people as people, and the capacity to be affected. Its signature is aliveness — the difference between a life executed competently and one that is actually inhabited. A working Lover feels things fully without being run by them, and lets other people matter.",
    gifts: [
      "Notices the person, not just the task they represent",
      "Brings energy that makes other people want to be there",
      "Stays open to being moved, changed and delighted",
    ],
    shadow: {
      inflated: {
        name: "The Consumed",
        description:
          "Feeling with no structure under it. The Consumed is run by whatever is most vivid right now, mistakes intensity for meaning, and leaves a trail of things begun in earnest.",
        tell: "Your commitments track your enthusiasm rather than your judgement.",
      },
      deflated: {
        name: "The Detached",
        description:
          "Life at one remove. The Detached manages relationships rather than having them, treats feeling as a category error, and is competent, reliable and not quite present.",
        tell: "You cannot remember the last time something moved you.",
      },
    },
    vector: v({
      empathy: 1.0,
      sociability: 0.9,
      riskTolerance: 0.3,
      curiosity: 0.3,
      assertiveness: 0.0,
      leadership: 0.0,
      competitiveness: -0.3,
      discipline: -0.3,
      independence: -0.3,
    }),
    development: [
      "Have one conversation this week with no agenda and no useful outcome.",
      "Notice something for its own sake — a piece of music, a walk, a meal — without it being productive.",
      "Tell someone directly that they matter to you, without hedging it as a joke.",
    ],
    archetypes: ["diplomat", "advocate", "catalyst"],
  },
};

export const PILLAR_LIST: PillarDefinition[] = PILLARS.map((p) => PILLAR_DEFINITIONS[p]);

export function pillarForArchetype(archetypeId: string): Pillar | null {
  for (const pillar of PILLARS) {
    if (PILLAR_DEFINITIONS[pillar].archetypes.includes(archetypeId)) return pillar;
  }
  return null;
}

export const FRAMEWORK_NOTE =
  "The four-pillar structure follows the King / Warrior / Magician / Lover model described by Robert Moore and Douglas Gillette (1990), which draws on Jungian archetype theory. The pillar content, sub-archetypes, scenarios and scoring here are Modulo's own. Neither the underlying framework nor this implementation is an empirically validated psychological instrument.";
