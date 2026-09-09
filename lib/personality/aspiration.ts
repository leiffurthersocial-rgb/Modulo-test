import type { Pillar } from "./pillars";
import { PILLARS } from "./pillars";

/**
 * What you would refuse to give up.
 *
 * Expression measures what you do. This measures what you are aiming at, which
 * is a different question and frequently a different answer. The format is
 * forced-choice between two equally creditable options, which is what makes it
 * work: when both alternatives are admirable, picking one cannot be explained
 * by wanting to look good, so the choice carries information that a rating
 * scale does not.
 *
 * Every ordered pair of pillars appears twice across the full set — once framed
 * as what you want to become, once as the failure that would bother you more.
 * Asking it both ways matters, because loss aversion and aspiration do not
 * always point the same direction.
 */

export interface AspirationItem {
  id: string;
  frame: "want" | "fear";
  prompt: string;
  left: { text: string; pillar: Pillar };
  right: { text: string; pillar: Pillar };
  core: boolean;
}

const WANT = "Which matters more to you?";
const FEAR = "Which would bother you more, looking back?";

export const ASPIRATION_ITEMS: AspirationItem[] = [
  {
    id: "as-01",
    frame: "want",
    core: true,
    prompt: WANT,
    left: { text: "Being the person others rely on when it matters", pillar: "sovereign" },
    right: { text: "Being the person who understands it properly", pillar: "magician" },
  },
  {
    id: "as-02",
    frame: "want",
    core: true,
    prompt: WANT,
    left: { text: "Being hard to move once you have decided", pillar: "warrior" },
    right: { text: "Being genuinely close to the people in your life", pillar: "lover" },
  },
  {
    id: "as-03",
    frame: "want",
    core: true,
    prompt: WANT,
    left: { text: "Leaving things better ordered than you found them", pillar: "sovereign" },
    right: { text: "Doing the difficult thing when it costs you", pillar: "warrior" },
  },
  {
    id: "as-04",
    frame: "want",
    core: true,
    prompt: WANT,
    left: { text: "Seeing clearly what others have missed", pillar: "magician" },
    right: { text: "Being fully present rather than half elsewhere", pillar: "lover" },
  },
  {
    id: "as-05",
    frame: "want",
    core: true,
    prompt: WANT,
    left: { text: "Being trusted with responsibility for others", pillar: "sovereign" },
    right: { text: "Having a life that actually feels like yours", pillar: "lover" },
  },
  {
    id: "as-06",
    frame: "want",
    core: true,
    prompt: WANT,
    left: { text: "Mastery deep enough that the work is genuinely yours", pillar: "magician" },
    right: { text: "The nerve to act before it is safe to", pillar: "warrior" },
  },
  {
    id: "as-07",
    frame: "fear",
    core: false,
    prompt: FEAR,
    left: { text: "Having let down people who were counting on you", pillar: "sovereign" },
    right: { text: "Never having understood the thing you spent your life on", pillar: "magician" },
  },
  {
    id: "as-08",
    frame: "fear",
    core: false,
    prompt: FEAR,
    left: { text: "Having backed down every time it mattered", pillar: "warrior" },
    right: { text: "Having been physically present and never really there", pillar: "lover" },
  },
  {
    id: "as-09",
    frame: "fear",
    core: false,
    prompt: FEAR,
    left: { text: "Having left a mess for others to sort out", pillar: "sovereign" },
    right: { text: "Having avoided every fight worth having", pillar: "warrior" },
  },
  {
    id: "as-10",
    frame: "fear",
    core: false,
    prompt: FEAR,
    left: { text: "Having been fooled by something you should have seen", pillar: "magician" },
    right: { text: "Having been too guarded to let anyone close", pillar: "lover" },
  },
  {
    id: "as-11",
    frame: "fear",
    core: false,
    prompt: FEAR,
    left: { text: "Having had authority and used it badly", pillar: "sovereign" },
    right: { text: "Having lived carefully and enjoyed none of it", pillar: "lover" },
  },
  {
    id: "as-12",
    frame: "fear",
    core: false,
    prompt: FEAR,
    left: { text: "Having stayed shallow across a lot of things", pillar: "magician" },
    right: { text: "Having known what to do and not done it", pillar: "warrior" },
  },
];

export const CORE_ASPIRATION_ITEMS = ASPIRATION_ITEMS.filter((i) => i.core);

export function aspirationForForm(form: "short" | "full"): AspirationItem[] {
  return form === "short" ? CORE_ASPIRATION_ITEMS : ASPIRATION_ITEMS;
}

/** Which side of each pair was chosen: "left" or "right". */
export type AspirationChoice = "left" | "right";

/**
 * Share of contests each pillar won, scaled 0–100. A pillar that appears in
 * four pairs and wins all four scores 100; winning none scores 0.
 */
export function scoreAspiration(
  choices: Readonly<Record<string, AspirationChoice | undefined>>,
  items: readonly AspirationItem[] = ASPIRATION_ITEMS,
): Record<Pillar, number> {
  const wins: Record<Pillar, number> = { sovereign: 0, warrior: 0, magician: 0, lover: 0 };
  const appearances: Record<Pillar, number> = { sovereign: 0, warrior: 0, magician: 0, lover: 0 };

  // Only answered contests count. Counting an unanswered pair as an appearance
  // would score the pillar as though it had lost, so a partly-finished section
  // would report that the taker values nothing.
  for (const item of items) {
    const choice = choices[item.id];
    if (!choice) continue;
    appearances[item.left.pillar] += 1;
    appearances[item.right.pillar] += 1;
    wins[choice === "left" ? item.left.pillar : item.right.pillar] += 1;
  }

  const out = {} as Record<Pillar, number>;
  for (const pillar of PILLARS) {
    out[pillar] =
      appearances[pillar] === 0
        ? 50
        : Math.round((wins[pillar] / appearances[pillar]) * 1000) / 10;
  }
  return out;
}

/** Every pillar must appear the same number of times, or the scale is rigged. */
export function aspirationBalance(
  items: readonly AspirationItem[] = ASPIRATION_ITEMS,
): Record<Pillar, number> {
  const counts: Record<Pillar, number> = { sovereign: 0, warrior: 0, magician: 0, lover: 0 };
  for (const item of items) {
    counts[item.left.pillar] += 1;
    counts[item.right.pillar] += 1;
  }
  return counts;
}
