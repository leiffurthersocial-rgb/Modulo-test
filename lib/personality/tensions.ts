import { TRAITS, type Trait } from "./types";

/**
 * Notable trait combinations.
 *
 * A ranked list of nine traits tells you the parts but not how they interact:
 * high assertiveness reads very differently alongside high empathy than
 * alongside low empathy. These rules name the combinations that change how a
 * profile actually plays out, and are what let the write-up say something the
 * trait bars do not.
 */

export interface TraitCombination {
  id: string;
  /** Traits that must be relatively high, then relatively low. */
  high: Trait[];
  low: Trait[];
  title: string;
  body: string;
}

export const COMBINATIONS: TraitCombination[] = [
  {
    id: "blunt-instrument",
    high: ["assertiveness"],
    low: ["empathy"],
    title: "Clear, and not always kind",
    body: "You say what you think without much padding, and you are not tracking closely how it lands. That makes you fast and unambiguous to work with — and occasionally more expensive than you realise, because the person you were direct with remembers it longer than you do.",
  },
  {
    id: "diplomatic-force",
    high: ["assertiveness", "empathy"],
    low: [],
    title: "Direct without the collateral",
    body: "You hold a position and read the room at the same time, which is rarer than it sounds. Most people trade one for the other. Your risk is not conflict but exhaustion: doing both takes real effort, and you may be absorbing more of it than anyone notices.",
  },
  {
    id: "starts-not-finishes",
    high: ["curiosity"],
    low: ["discipline"],
    title: "Many openings, fewer endings",
    body: "New problems pull hard at you and finished ones stop paying. Expect a trail of promising half-built things. The fix that tends to work is not more willpower but shorter projects — get to something complete before the novelty runs out.",
  },
  {
    id: "deep-executor",
    high: ["curiosity", "discipline"],
    low: [],
    title: "Curiosity that actually ships",
    body: "You follow questions a long way and you still finish. This combination compounds: over years it produces genuine depth rather than a collection of enthusiasms. The cost is that you are slow to abandon a line of work that has stopped being worth it.",
  },
  {
    id: "quiet-command",
    high: ["leadership"],
    low: ["sociability"],
    title: "Authority without the room",
    body: "You will take charge, but you are not drawing energy from the group while you do it. People often read this as detachment when it is closer to economy. Saying out loud what you are already thinking usually buys you more than another decision does.",
  },
  {
    id: "bold-and-methodical",
    high: ["riskTolerance", "discipline"],
    low: [],
    title: "Bold bets, executed carefully",
    body: "Appetite for uncertainty usually comes bundled with impatience for detail. In you it does not. You can take a position early and then do the unglamorous work that makes it pay, which is the combination most large undertakings actually require.",
  },
  {
    id: "cautious-inquiry",
    high: ["curiosity"],
    low: ["riskTolerance"],
    title: "Wants to know, not to gamble",
    body: "You will go a long way to understand something and stop short of betting on it. That makes you an unusually good analyst of decisions you will not personally make. Watch for the point where more information has stopped changing the answer.",
  },
  {
    id: "lone-competitor",
    high: ["competitiveness", "independence"],
    low: ["sociability"],
    title: "Keeping score, privately",
    body: "You measure yourself constantly and do it without an audience. Nobody has to be watching for the standard to hold. The failure mode is that the scoreboard is entirely internal, so it never says you have done enough.",
  },
  {
    id: "conflicted-competitor",
    high: ["competitiveness", "empathy"],
    low: [],
    title: "Wanting to win, minding the cost",
    body: "You want to come first and you notice what that does to the people you beat. This is a genuine tension rather than a flaw, and it usually resolves in one of two ways: choosing arenas where winning is not zero-sum, or quietly under-competing to protect the relationship.",
  },
  {
    id: "steady-hand",
    high: ["discipline", "empathy"],
    low: ["riskTolerance"],
    title: "The one people rely on",
    body: "You are dependable and you pay attention to people, and you do not take chances with either. Others end up leaning on this more than they say. Guard against the version where you absorb everyone's strain in silence because you are the one who can.",
  },
  {
    id: "restless-independent",
    high: ["independence", "riskTolerance"],
    low: ["discipline"],
    title: "Ungovernable, in the useful sense",
    body: "You back your own read and you move on it before anyone has approved. When you are right this is how things get unstuck. The recurring cost is process you discarded that was doing quiet work — the second-order damage usually shows up later, and elsewhere.",
  },
  {
    id: "social-strategist",
    high: ["sociability", "leadership", "empathy"],
    low: [],
    title: "Influence through people",
    body: "You lead by alignment rather than authority: you know who needs to be brought along and in what order. This travels well in almost any organisation. Its weakness is that consensus can dull a call that needed to be sharp and unpopular.",
  },
];

export function findCombinations(
  traitScores: Record<Trait, number>,
  limit = 3,
): TraitCombination[] {
  const mean = TRAITS.reduce((sum, t) => sum + traitScores[t], 0) / TRAITS.length;
  // Relative to the taker's own profile, so an agreeable respondent and a
  // reserved one can both trigger the same combination.
  const relative = (trait: Trait) => traitScores[trait] - mean;

  const scored = COMBINATIONS.map((combination) => {
    const highs = combination.high.map(relative);
    const lows = combination.low.map(relative);
    const qualifies =
      highs.every((v) => v > 4) && lows.every((v) => v < -4);
    const strength =
      highs.reduce((s, v) => s + v, 0) - lows.reduce((s, v) => s + v, 0);
    return { combination, qualifies, strength };
  })
    .filter((c) => c.qualifies)
    .sort((a, b) => b.strength - a.strength);

  return scored.slice(0, limit).map((c) => c.combination);
}
