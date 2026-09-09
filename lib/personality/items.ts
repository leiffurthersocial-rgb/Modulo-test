import { createRng, shuffle } from "@/lib/rng";
import type { PersonalityItem, Trait } from "./types";
import { TRAITS } from "./types";

/**
 * Eight statements per trait: four keyed forward and four reversed.
 *
 * The balance is deliberate. Acquiescence bias — the tendency to agree with
 * whatever is put in front of you — cancels exactly when a trait has as many
 * reversed items as forward ones, and only approximately when it does not. Four
 * of the eight in each trait are marked `core` (two forward, two reversed) and
 * make up the balanced 36-item short form.
 *
 * Source order is grouped by trait for maintenance. Presentation order is
 * interleaved by `interleave` below, so that consecutive statements never
 * measure the same thing: a run of five leadership items in a row invites the
 * taker to answer the theme rather than the statement.
 */

let seq = 0;
const item = (
  trait: Trait,
  text: string,
  reverse: boolean,
  core: boolean,
): PersonalityItem => ({
  id: `p-${trait.slice(0, 3)}-${String(++seq).padStart(2, "0")}`,
  trait,
  text,
  reverse,
  core,
});

const GROUPED: PersonalityItem[] = [
  // Leadership
  item("leadership", "When a group has no clear direction, I am the one who sets it.", false, true),
  item("leadership", "People naturally look to me to make the final call.", false, true),
  item("leadership", "I enjoy taking responsibility for outcomes that affect other people.", false, false),
  item("leadership", "I am comfortable being the one held accountable when a group's plan fails.", false, false),
  item("leadership", "I would rather follow a plan someone else made than make one myself.", true, true),
  item("leadership", "I avoid roles where others depend on my decisions.", true, true),
  item("leadership", "In a group I would rather contribute quietly than direct.", true, false),
  item("leadership", "Taking charge of other people's work feels like a burden to me.", true, false),

  // Independence
  item("independence", "I make important decisions without needing anyone's approval.", false, true),
  item("independence", "I would rather work alone than as part of a team.", false, true),
  item("independence", "I would rather do something imperfectly my own way than perfectly someone else's.", false, false),
  item("independence", "I trust my own read of a situation over the majority view.", false, false),
  item("independence", "I feel uneasy when I have to rely only on my own judgement.", true, true),
  item("independence", "I look for consensus before I commit to a course of action.", true, true),
  item("independence", "I prefer clear instructions to being left to work things out.", true, false),
  item("independence", "I check with someone else before making a decision that matters.", true, false),

  // Discipline
  item("discipline", "I finish what I start, even once the initial excitement is gone.", false, true),
  item("discipline", "I keep to routines that I have set for myself.", false, true),
  item("discipline", "I plan my week rather than take it as it comes.", false, false),
  item("discipline", "I do the boring parts of a task properly rather than rushing them.", false, false),
  item("discipline", "I often put things off until a deadline forces me.", true, true),
  item("discipline", "My workspace and my schedule tend to be disorganised.", true, true),
  item("discipline", "I lose momentum on a project once the novelty wears off.", true, false),
  item("discipline", "I start more things than I finish.", true, false),

  // Sociability
  item("sociability", "I gain energy from being around other people.", false, true),
  item("sociability", "I start conversations with people I do not know.", false, true),
  item("sociability", "I keep in regular contact with a wide circle of people.", false, false),
  item("sociability", "I look forward to events where I will meet new people.", false, false),
  item("sociability", "Long social events leave me drained.", true, true),
  item("sociability", "I would rather spend a free evening alone than out with a group.", true, true),
  item("sociability", "I need a good deal of time alone to feel like myself.", true, false),
  item("sociability", "I find small talk tiring rather than enjoyable.", true, false),

  // Risk tolerance
  item("riskTolerance", "I am comfortable deciding before I have all the information.", false, true),
  item("riskTolerance", "I would leave a secure position for an uncertain but promising one.", false, true),
  item("riskTolerance", "A calculated gamble appeals to me more than a guaranteed small gain.", false, false),
  item("riskTolerance", "I would back an idea I believe in before it is proven.", false, false),
  item("riskTolerance", "I avoid situations where the outcome is unpredictable.", true, true),
  item("riskTolerance", "I check every possible downside before I act.", true, true),
  item("riskTolerance", "I would rather take the safe option than the promising one.", true, false),
  item("riskTolerance", "Uncertainty makes me want to wait rather than act.", true, false),

  // Curiosity
  item("curiosity", "I read or research subjects that have nothing to do with my work.", false, true),
  item("curiosity", "I enjoy problems that have no obvious method of solution.", false, true),
  item("curiosity", "I actively seek out ideas that contradict what I already believe.", false, false),
  item("curiosity", "I follow a question past the point where the answer is useful to me.", false, false),
  item("curiosity", "Once I understand something well enough to use it, I stop digging.", true, true),
  item("curiosity", "Abstract questions with no practical use bore me.", true, true),
  item("curiosity", "I prefer subjects with settled answers to open ones.", true, false),
  item("curiosity", "I rarely look into things beyond what I need to know.", true, false),

  // Assertiveness
  item("assertiveness", "I say what I think even when it is unwelcome.", false, true),
  item("assertiveness", "I push back directly when I am treated unfairly.", false, true),
  item("assertiveness", "I ask for what I want without softening it.", false, false),
  item("assertiveness", "I state my position clearly even when I am outnumbered.", false, false),
  item("assertiveness", "I stay quiet to keep the peace.", true, true),
  item("assertiveness", "I find it hard to turn down a request.", true, true),
  item("assertiveness", "I let things go rather than raise them.", true, false),
  item("assertiveness", "I soften my opinions so that they land more easily.", true, false),

  // Empathy
  item("empathy", "I notice quickly when someone's mood has changed.", false, true),
  item("empathy", "I adjust what I say based on how the other person is likely to feel.", false, true),
  item("empathy", "I find it easy to see a disagreement from the other side.", false, false),
  item("empathy", "I can usually tell what someone is feeling before they say so.", false, false),
  item("empathy", "Other people's problems are largely their own to solve.", true, true),
  item("empathy", "I have little patience for people who are upset over small things.", true, true),
  item("empathy", "I focus on what needs doing rather than on how people are taking it.", true, false),
  item("empathy", "I find it hard to imagine how a situation looks to someone else.", true, false),

  // Competitiveness
  item("competitiveness", "I keep track of how I am doing compared with others.", false, true),
  item("competitiveness", "Losing bothers me long after the event.", false, true),
  item("competitiveness", "I raise my effort when I know I am being measured against someone.", false, false),
  item("competitiveness", "I want to be the best in the room, not merely good at what I do.", false, false),
  item("competitiveness", "I am satisfied as long as I did my best, wherever I placed.", true, true),
  item("competitiveness", "Competition brings out the worst in me rather than the best.", true, true),
  item("competitiveness", "I am indifferent to how my results compare with other people's.", true, false),
  item("competitiveness", "Rankings and leaderboards hold no interest for me.", true, false),
];

/**
 * Round-robin the traits so that no two consecutive statements measure the same
 * one, alternating keying where possible so a run of agreements cannot quietly
 * accumulate on a single trait. Deterministic: the questionnaire reads the same
 * way for everyone, which keeps results comparable.
 */
function interleave(items: readonly PersonalityItem[]): PersonalityItem[] {
  const rng = createRng(0x50524f46); // "PROF"
  const queues = new Map<Trait, PersonalityItem[]>();
  for (const trait of TRAITS) {
    const forTrait = items.filter((i) => i.trait === trait);
    const forward = forTrait.filter((i) => !i.reverse);
    const reverse = forTrait.filter((i) => i.reverse);
    // Alternate keying within each trait's queue.
    const merged: PersonalityItem[] = [];
    for (let i = 0; i < Math.max(forward.length, reverse.length); i++) {
      const a = i % 2 === 0 ? forward[i] : reverse[i];
      const b = i % 2 === 0 ? reverse[i] : forward[i];
      if (a) merged.push(a);
      if (b) merged.push(b);
    }
    queues.set(trait, merged);
  }

  const out: PersonalityItem[] = [];
  let round = 0;
  while (out.length < items.length) {
    const order = shuffle(TRAITS, rng);
    let placedThisRound = false;
    for (const trait of order) {
      const queue = queues.get(trait);
      const next = queue?.shift();
      if (!next) continue;
      // Never place two items of the same trait back to back.
      if (out[out.length - 1]?.trait === next.trait) {
        queue?.unshift(next);
        continue;
      }
      out.push(next);
      placedThisRound = true;
    }
    round += 1;
    if (!placedThisRound || round > items.length) {
      // Drain anything left, preserving the no-adjacent-duplicates rule loosely.
      for (const queue of queues.values()) out.push(...queue.splice(0));
      break;
    }
  }
  return out;
}

/** Every statement, in presentation order. */
export const PERSONALITY_ITEMS: PersonalityItem[] = interleave(GROUPED);

/** The balanced 36-item short form. */
export const SHORT_FORM_ITEMS: PersonalityItem[] = PERSONALITY_ITEMS.filter((i) => i.core);

export const ITEMS_PER_TRAIT = 8;
export const CORE_ITEMS_PER_TRAIT = 4;

export function itemsForForm(form: "short" | "full"): PersonalityItem[] {
  return form === "short" ? SHORT_FORM_ITEMS : PERSONALITY_ITEMS;
}
