import type { Trait } from "./types";

export interface Archetype {
  id: string;
  /** Set from the pillar definitions; see pillars.ts. */
  name: string;
  tagline: string;
  description: string;
  /** Trait emphasis, roughly −1 … +1. Positive = the archetype scores high. */
  vector: Record<Trait, number>;
  strengths: string[];
  weaknesses: string[];
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

/**
 * Modulo archetypes are our own construction. They are a readable summary of
 * the shape of your trait profile — not a scientifically established personality
 * typology, and not equivalent to any clinical or academic instrument.
 */
export const ARCHETYPES: Archetype[] = [
  {
    id: "strategist",
    name: "The Strategist",
    tagline: "Plays the long game and rarely shows the whole hand.",
    description:
      "You think several moves ahead and prefer position to momentum. Decisions get made once the ground has been surveyed, and you would rather be right slowly than fast and wrong. You work best where the problem is genuinely hard and the timeline is yours to shape.",
    vector: v({
      discipline: 0.7,
      curiosity: 0.6,
      leadership: 0.5,
      independence: 0.4,
      competitiveness: 0.3,
      assertiveness: 0.2,
      empathy: -0.2,
      sociability: -0.3,
      riskTolerance: -0.4,
    }),
    strengths: [
      "Sees second-order consequences other people miss",
      "Holds a plan together under pressure",
      "Comfortable committing resources to a slow-burning bet",
    ],
    weaknesses: [
      "Can over-plan when the situation rewards moving first",
      "Keeps reasoning private, so others feel steered rather than led",
      "Impatient with decisions made on instinct",
    ],
  },
  {
    id: "leader",
    name: "The Leader",
    tagline: "Takes the room and takes the responsibility with it.",
    description:
      "You move naturally into the gap when a group has no direction, and you are willing to own the result. Your instinct is to align people rather than out-work them, and you would rather make a decision that can be corrected than leave a vacuum.",
    vector: v({
      leadership: 1.0,
      assertiveness: 0.8,
      sociability: 0.6,
      competitiveness: 0.5,
      discipline: 0.4,
      empathy: 0.3,
      riskTolerance: 0.2,
      independence: 0.1,
      curiosity: -0.1,
    }),
    strengths: [
      "Turns an undirected group into a moving one",
      "Absorbs accountability instead of distributing blame",
      "Decisive when information is incomplete",
    ],
    weaknesses: [
      "Fills silences that others needed in order to contribute",
      "Can mistake agreement for alignment",
      "Reluctant to hand over work that would grow someone else",
    ],
  },
  {
    id: "explorer",
    name: "The Explorer",
    tagline: "Chases the edge of the map, not the centre of it.",
    description:
      "Novelty is the fuel. You would rather start five things and learn what is out there than optimise one thing you already understand. Uncertainty reads as opportunity to you, and routine reads as cost.",
    vector: v({
      curiosity: 1.0,
      riskTolerance: 0.9,
      independence: 0.6,
      sociability: 0.3,
      assertiveness: 0.2,
      competitiveness: -0.1,
      empathy: 0.0,
      leadership: 0.0,
      discipline: -0.5,
    }),
    strengths: [
      "Finds openings before anyone has mapped them",
      "Unbothered by ambiguity and false starts",
      "Learns quickly across unrelated fields",
    ],
    weaknesses: [
      "Loses interest once a problem becomes maintenance",
      "Under-values the compounding that comes from staying put",
      "Commitments made in enthusiasm can outrun follow-through",
    ],
  },
  {
    id: "builder",
    name: "The Builder",
    tagline: "Turns intent into something that actually stands up.",
    description:
      "You judge ideas by whether they survive contact with execution. Progress is measured in finished work, and you have the patience to keep going long after the interesting part is over. What you make tends to outlast the enthusiasm that started it.",
    vector: v({
      discipline: 1.0,
      independence: 0.4,
      competitiveness: 0.3,
      leadership: 0.2,
      curiosity: 0.1,
      assertiveness: 0.1,
      empathy: 0.0,
      sociability: -0.2,
      riskTolerance: -0.4,
    }),
    strengths: [
      "Delivers reliably without needing external pressure",
      "Builds systems rather than one-off fixes",
      "Steady when a project enters its unglamorous phase",
    ],
    weaknesses: [
      "Can keep building something that should have been abandoned",
      "Prefers a known method over a better unfamiliar one",
      "Undersells finished work because the doing mattered more",
    ],
  },
  {
    id: "diplomat",
    name: "The Diplomat",
    tagline: "Reads the room, then quietly changes its temperature.",
    description:
      "You track how people are actually feeling, not just what they said, and you use that to find the version of a decision everyone can live with. Influence, for you, runs through trust rather than volume.",
    vector: v({
      empathy: 1.0,
      sociability: 0.9,
      leadership: 0.3,
      curiosity: 0.3,
      discipline: 0.2,
      independence: -0.3,
      riskTolerance: -0.3,
      assertiveness: -0.4,
      competitiveness: -0.5,
    }),
    strengths: [
      "Defuses conflict before it hardens into position-taking",
      "Builds coalitions that hold without constant maintenance",
      "Hears the objection that nobody said out loud",
    ],
    weaknesses: [
      "Trades away your own position to preserve the peace",
      "Slow to force a decision that will upset someone",
      "Consensus can dilute a call that needed to be sharp",
    ],
  },
  {
    id: "maverick",
    name: "The Maverick",
    tagline: "Answers to the problem, not to the process.",
    description:
      "You trust your own read over the received one, and you are willing to be alone in it. Rules interest you only as far as they are load-bearing. When conventional approaches stall, you are the one with an unreasonable option that turns out to work.",
    vector: v({
      independence: 1.0,
      riskTolerance: 0.8,
      assertiveness: 0.6,
      curiosity: 0.5,
      competitiveness: 0.3,
      leadership: 0.1,
      discipline: -0.5,
      sociability: -0.4,
      empathy: -0.4,
    }),
    strengths: [
      "Unafraid to hold an unpopular position that is correct",
      "Cuts through process when the process has stopped serving anyone",
      "Moves while others are still seeking permission",
    ],
    weaknesses: [
      "Discards structure that was doing quiet, useful work",
      "Friction with collaborators becomes the story",
      "Contrarian by reflex rather than by analysis",
    ],
  },
  {
    id: "scholar",
    name: "The Scholar",
    tagline: "Not finished until it is genuinely understood.",
    description:
      "Depth is the point. You keep going past the level of understanding required to act, because a shallow model bothers you. Given quiet and a hard question, you produce work that other people build on.",
    vector: v({
      curiosity: 1.0,
      discipline: 0.6,
      independence: 0.5,
      empathy: 0.1,
      leadership: -0.2,
      competitiveness: -0.2,
      riskTolerance: -0.3,
      assertiveness: -0.4,
      sociability: -0.5,
    }),
    strengths: [
      "Builds models deep enough to predict, not just describe",
      "Comfortable with long periods of no visible output",
      "Spots the flawed assumption everyone else inherited",
    ],
    weaknesses: [
      "Delays action in search of a certainty that will not arrive",
      "Explains at a level the audience did not ask for",
      "Undervalues the political side of getting work adopted",
    ],
  },
  {
    id: "guardian",
    name: "The Guardian",
    tagline: "Holds the line so other people can take chances.",
    description:
      "You take responsibility for what must not break. Stability, in your hands, is an active achievement rather than an absence of change. People rely on you precisely because you do not need to be visible to be doing the work.",
    vector: v({
      empathy: 0.8,
      discipline: 0.8,
      sociability: 0.2,
      leadership: 0.2,
      assertiveness: 0.0,
      independence: -0.2,
      competitiveness: -0.3,
      // Guardians are actively sceptical of novelty, not merely indifferent:
      // the job is protecting arrangements that already work.
      curiosity: -0.35,
      riskTolerance: -0.7,
    }),
    strengths: [
      "Reliable in exactly the moments reliability is scarce",
      "Protects people and standards without making it a performance",
      "Anticipates failure modes long before they arrive",
    ],
    weaknesses: [
      "Defends arrangements that have outlived their purpose",
      "Absorbs strain silently until it becomes a problem",
      "Reads necessary risk as recklessness",
    ],
  },
  {
    id: "competitor",
    name: "The Competitor",
    tagline: "Finds the scoreboard, then finds another gear.",
    description:
      "Being measured focuses you. You raise your output when something is at stake and you keep an honest, sometimes uncomfortable account of where you stand. The drive is real, and it does not switch off easily.",
    vector: v({
      competitiveness: 1.0,
      assertiveness: 0.8,
      riskTolerance: 0.5,
      discipline: 0.5,
      leadership: 0.4,
      independence: 0.2,
      sociability: 0.1,
      curiosity: 0.0,
      empathy: -0.5,
    }),
    strengths: [
      "Performs at the top of your range when it counts",
      "Honest about results rather than about effort",
      "Raises the standard of everyone measured alongside you",
    ],
    weaknesses: [
      "Treats collaboration as a contest with extra steps",
      "Struggles to switch off when nothing is at stake",
      "A loss lands harder and lasts longer than it should",
    ],
  },
  {
    id: "craftsman",
    name: "The Craftsman",
    tagline: "Quality settled privately, long before anyone checks.",
    description:
      "You work to a standard that is yours rather than the room's, and you would rather do less at a level you can stand behind. Recognition is welcome but not the motive; the work itself has to be right.",
    vector: v({
      discipline: 0.9,
      independence: 0.7,
      curiosity: 0.4,
      empathy: 0.1,
      riskTolerance: -0.2,
      competitiveness: -0.2,
      assertiveness: -0.3,
      leadership: -0.3,
      sociability: -0.6,
    }),
    strengths: [
      "Consistently produces work above the required standard",
      "Needs no supervision to stay honest about quality",
      "Deep, transferable mastery of the tools you use",
    ],
    weaknesses: [
      "Polishes past the point where it changes the outcome",
      "Reluctant to ship something merely good enough",
      "Hard to delegate to, because the standard is unstated",
    ],
  },
  {
    id: "catalyst",
    name: "The Catalyst",
    tagline: "Starts the reaction, rarely stays for the whole of it.",
    description:
      "You create momentum. Rooms move faster with you in them, plans that were theoretical become things people are actually doing, and you are comfortable pushing before everything is settled. Sustaining what you started interests you far less than starting it.",
    vector: v({
      sociability: 0.9,
      riskTolerance: 0.7,
      assertiveness: 0.6,
      curiosity: 0.4,
      leadership: 0.3,
      competitiveness: 0.2,
      empathy: 0.1,
      independence: -0.2,
      discipline: -0.7,
    }),
    strengths: [
      "Converts talk into motion faster than anyone else present",
      "Comfortable acting before the picture is complete",
      "Draws other people into an idea without needing authority",
    ],
    weaknesses: [
      "Momentum stalls the moment you turn to something else",
      "Commitments outrun the follow-through behind them",
      "Mistakes activity for progress when the two diverge",
    ],
  },
  {
    id: "advocate",
    name: "The Advocate",
    tagline: "Reads the room, then says the thing nobody will.",
    description:
      "You notice who is being overlooked and you are willing to make it awkward on their behalf. Unlike most people who feel strongly about fairness, you actually raise it — and unlike most people who speak up, you have thought about how the other side sees it first.",
    vector: v({
      empathy: 0.9,
      assertiveness: 0.8,
      leadership: 0.5,
      sociability: 0.4,
      discipline: 0.3,
      independence: 0.3,
      riskTolerance: 0.2,
      curiosity: 0.1,
      competitiveness: -0.4,
    }),
    strengths: [
      "Raises the issue everyone else decided to live with",
      "Combines genuine warmth with a willingness to confront",
      "Trusted with things people would not tell a manager",
    ],
    weaknesses: [
      "Takes on fights that were not yours to carry",
      "Reads disagreement about method as disagreement about values",
      "Burns credibility on small injustices, leaving less for large ones",
    ],
  },
];

export const ARCHETYPE_DISCLAIMER =
  "Modulo archetypes are created by Modulo. They are a descriptive summary of your trait profile, not a scientifically established personality typology, and they are not equivalent to any clinical or academic instrument.";