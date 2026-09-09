import type { Pillar } from "./pillars";

/**
 * Situational items.
 *
 * A statement like "I take charge when a group has no direction" tells the
 * taker exactly what it measures, so it records self-image as much as
 * behaviour. A situation with four defensible responses does not: every option
 * is something a reasonable person might do, so choosing between them reveals
 * disposition rather than aspiration. Because exactly one option can be picked,
 * the format is also ipsative — you cannot claim all four pillars at once, the
 * way you can agree with every statement.
 *
 * Two kinds are used:
 *
 *  - `standing` scenarios offer one mature response per pillar, and measure
 *    which pillar you reach for by default.
 *  - `pressure` scenarios describe things going wrong, and their options map to
 *    the inflated and deflated shadows. Nobody picks a shadow described as a
 *    flaw, so these are written so that each option sounds reasonable from the
 *    inside — which is exactly how shadows operate.
 */

export interface ScenarioOption {
  id: string;
  text: string;
  /** Pillar this response expresses. */
  pillar: Pillar;
  /** Mature expression, or one of the two shadow poles. */
  mode: "mature" | "inflated" | "deflated";
}

export interface Scenario {
  id: string;
  kind: "standing" | "pressure";
  /** Included in the short form. */
  core: boolean;
  setting: string;
  prompt: string;
  options: ScenarioOption[];
}

const o = (
  id: string,
  pillar: Pillar,
  mode: ScenarioOption["mode"],
  text: string,
): ScenarioOption => ({ id, pillar, mode, text });

export const SCENARIOS: Scenario[] = [
  {
    id: "sc-01",
    kind: "standing",
    core: true,
    setting: "A meeting has run forty minutes and the decision is drifting.",
    prompt: "What do you actually do?",
    options: [
      o("sc-01-a", "sovereign", "mature", "Name the decision that needs making and put it to a call, then own the result."),
      o("sc-01-b", "warrior", "mature", "Say the thing everyone is avoiding, even though it will make the next ten minutes worse."),
      o("sc-01-c", "magician", "mature", "Point out the assumption the whole discussion is resting on, which nobody has checked."),
      o("sc-01-d", "lover", "mature", "Ask the two people who have not spoken what they think — the drift is usually about them."),
    ],
  },
  {
    id: "sc-02",
    kind: "standing",
    core: true,
    setting: "A friend tells you about a plan you think is a mistake.",
    prompt: "Your first move is to:",
    options: [
      o("sc-02-a", "lover", "mature", "Ask what he is hoping for from it, before saying anything about whether it will work."),
      o("sc-02-b", "warrior", "mature", "Tell him plainly that you think it is a mistake, and why."),
      o("sc-02-c", "magician", "mature", "Walk through the part of it he has not modelled, and let the conclusion land on its own."),
      o("sc-02-d", "sovereign", "mature", "Tell him you will back him either way, and then give him your honest read."),
    ],
  },
  {
    id: "sc-03",
    kind: "standing",
    core: true,
    setting: "You have a free Saturday with no obligations.",
    prompt: "The version of the day that would satisfy you most is:",
    options: [
      o("sc-03-a", "magician", "mature", "Getting properly into something you have been meaning to understand."),
      o("sc-03-b", "lover", "mature", "Time with people you actually like, with nothing scheduled and no purpose."),
      o("sc-03-c", "warrior", "mature", "Clearing the thing that has been sitting on you all week, and finishing it."),
      o("sc-03-d", "sovereign", "mature", "Sorting out something that will make the next month run better for everyone."),
    ],
  },
  {
    id: "sc-04",
    kind: "standing",
    core: true,
    setting: "Someone junior does work that is close, but not right.",
    prompt: "You:",
    options: [
      o("sc-04-a", "sovereign", "mature", "Tell him what standard it missed and why the standard exists, then let him redo it."),
      o("sc-04-b", "magician", "mature", "Show him the reasoning he skipped, so the next one is right for the right reason."),
      o("sc-04-c", "warrior", "mature", "Send it back with the gap marked. He will learn faster from the correction than the explanation."),
      o("sc-04-d", "lover", "mature", "Find out what he was up against first — the work is usually a symptom of something else."),
    ],
  },
  {
    id: "sc-05",
    kind: "standing",
    core: true,
    setting: "You are offered a role that pays better but is duller.",
    prompt: "What decides it for you?",
    options: [
      o("sc-05-a", "magician", "mature", "Whether there is anything left in it to learn once you are competent."),
      o("sc-05-b", "sovereign", "mature", "Whether it puts you in a position to affect things that matter."),
      o("sc-05-c", "lover", "mature", "Whether you would look forward to the days."),
      o("sc-05-d", "warrior", "mature", "Whether it is a harder job than the one you have."),
    ],
  },
  {
    id: "sc-06",
    kind: "standing",
    core: false,
    setting: "A group you are part of has quietly lowered its standards.",
    prompt: "You:",
    options: [
      o("sc-06-a", "warrior", "mature", "Say it out loud, knowing it will make you the difficult one."),
      o("sc-06-b", "sovereign", "mature", "Restate what the standard is and hold yourself to it visibly, first."),
      o("sc-06-c", "lover", "mature", "Work out why people stopped caring, because that is the actual problem."),
      o("sc-06-d", "magician", "mature", "Show concretely what the slippage is costing, so it stops being a matter of opinion."),
    ],
  },
  {
    id: "sc-07",
    kind: "standing",
    core: false,
    setting: "Someone criticises you publicly, and part of it is fair.",
    prompt: "In the moment, you:",
    options: [
      o("sc-07-a", "sovereign", "mature", "Concede the fair part immediately and take the rest up privately."),
      o("sc-07-b", "warrior", "mature", "Answer the unfair part on the spot; letting it stand is worse than the friction."),
      o("sc-07-c", "magician", "mature", "Ask a question that separates the fair part from the rest, for everyone's benefit."),
      o("sc-07-d", "lover", "mature", "Register that it stung, say so plainly, and deal with the substance after."),
    ],
  },
  {
    id: "sc-08",
    kind: "standing",
    core: false,
    setting: "A project you care about is going to miss its date.",
    prompt: "Your instinct is to:",
    options: [
      o("sc-08-a", "warrior", "mature", "Cut scope hard and hit the date with less."),
      o("sc-08-b", "sovereign", "mature", "Tell everyone affected now, take the hit, and reset expectations honestly."),
      o("sc-08-c", "magician", "mature", "Work out what actually caused the slip before deciding anything."),
      o("sc-08-d", "lover", "mature", "Check whether the team is still with you; a demoralised team misses the next one too."),
    ],
  },
  {
    id: "sc-09",
    kind: "standing",
    core: false,
    setting: "You discover you were wrong about something you argued strongly for.",
    prompt: "You:",
    options: [
      o("sc-09-a", "sovereign", "mature", "Say so to the people who acted on it, before they find out another way."),
      o("sc-09-b", "magician", "mature", "Work out what reasoning produced the error, because that will recur."),
      o("sc-09-c", "warrior", "mature", "Correct it and move; the wallowing costs more than the mistake did."),
      o("sc-09-d", "lover", "mature", "Sit with it for a bit. Being wrong about something you were sure of is worth feeling."),
    ],
  },
  {
    id: "sc-10",
    kind: "standing",
    core: false,
    setting: "An old friend has drifted out of contact.",
    prompt: "You:",
    options: [
      o("sc-10-a", "lover", "mature", "Get in touch without a reason, and say you have been thinking about him."),
      o("sc-10-b", "sovereign", "mature", "Reach out — keeping the people around you connected is your job, not the drift's."),
      o("sc-10-c", "magician", "mature", "Think about what changed. Friendships usually drift for a reason worth understanding."),
      o("sc-10-d", "warrior", "mature", "Call and say directly that you have missed him and want to fix it."),
    ],
  },
  {
    id: "sc-11",
    kind: "standing",
    core: false,
    setting: "You are given more authority than you expected.",
    prompt: "The first thing you do with it is:",
    options: [
      o("sc-11-a", "sovereign", "mature", "Work out who is now depending on you, and tell them what they can expect."),
      o("sc-11-b", "warrior", "mature", "Fix the thing that has been broken because nobody had the standing to fix it."),
      o("sc-11-c", "magician", "mature", "Find out how the system actually works before changing any of it."),
      o("sc-11-d", "lover", "mature", "Get to know the people properly; authority without trust is just noise."),
    ],
  },
  {
    id: "sc-12",
    kind: "standing",
    core: false,
    setting: "Something you built is being used in a way you did not intend.",
    prompt: "You:",
    options: [
      o("sc-12-a", "magician", "mature", "Get curious — how people actually use a thing usually beats how you meant it."),
      o("sc-12-b", "sovereign", "mature", "Decide whether the new use is acceptable, and say so clearly either way."),
      o("sc-12-c", "warrior", "mature", "Shut down the uses that will cause harm, without waiting for consensus."),
      o("sc-12-d", "lover", "mature", "Talk to the people using it that way and understand what they needed."),
    ],
  },
  {
    id: "sc-13",
    kind: "standing",
    core: false,
    setting: "You have an hour before an important meeting.",
    prompt: "You spend it:",
    options: [
      o("sc-13-a", "magician", "mature", "Understanding the other side's position better than they will expect."),
      o("sc-13-b", "sovereign", "mature", "Deciding in advance what outcome you will and will not accept."),
      o("sc-13-c", "warrior", "mature", "Rehearsing the hardest thing you have to say until it is clean."),
      o("sc-13-d", "lover", "mature", "Getting into a decent state of mind, so you turn up as yourself."),
    ],
  },
  {
    id: "sc-14",
    kind: "standing",
    core: false,
    setting: "A younger man asks you for advice about his life.",
    prompt: "What you give him is mostly:",
    options: [
      o("sc-14-a", "sovereign", "mature", "A straight account of what the responsibility will actually ask of him."),
      o("sc-14-b", "magician", "mature", "A better model of the situation than the one he arrived with."),
      o("sc-14-c", "warrior", "mature", "One concrete thing to do this week, and the expectation that he does it."),
      o("sc-14-d", "lover", "mature", "Your full attention, and the sense that he was heard rather than processed."),
    ],
  },

  /* ---------------------------------------------------------- pressure */

  {
    id: "sc-p1",
    kind: "pressure",
    core: true,
    setting: "A decision you made turns out badly, and it is visibly your call.",
    prompt: "What you are most likely to actually do:",
    options: [
      o("sc-p1-a", "sovereign", "inflated", "Defend the decision harder. Reversing in public costs more authority than the error does."),
      o("sc-p1-b", "sovereign", "deflated", "Go quiet and let it be absorbed. Drawing attention to it helps nobody."),
      o("sc-p1-c", "magician", "inflated", "Explain the reasoning in enough detail that the outcome stops looking like a choice."),
      o("sc-p1-d", "sovereign", "mature", "Say plainly that it was your call and it was wrong, then say what you are changing."),
    ],
  },
  {
    id: "sc-p2",
    kind: "pressure",
    core: true,
    setting: "Someone repeatedly crosses a line with you and does not notice.",
    prompt: "By the fourth time, you are most likely to:",
    options: [
      o("sc-p2-a", "warrior", "deflated", "Still not have said anything. It is not worth the friction, and you can absorb it."),
      o("sc-p2-b", "warrior", "inflated", "Let it out all at once, harder than the moment warrants, because it has been building."),
      o("sc-p2-c", "lover", "deflated", "Quietly reduce how much you are around him, without ever raising it."),
      o("sc-p2-d", "warrior", "mature", "Name it calmly at the next occurrence, in proportion, and hold the line after."),
    ],
  },
  {
    id: "sc-p3",
    kind: "pressure",
    core: true,
    setting: "You can see a decision being made on a false premise, and correcting it will cost you.",
    prompt: "You:",
    options: [
      o("sc-p3-a", "magician", "deflated", "Say nothing. You will be right, and being right will be its own record."),
      o("sc-p3-b", "magician", "inflated", "Say part of it — enough to be on record, not enough to change the outcome you benefit from."),
      o("sc-p3-c", "warrior", "inflated", "Force the point until it is conceded, whatever it does to the room."),
      o("sc-p3-d", "magician", "mature", "State the premise plainly and let the decision be made on it, including if it goes against you."),
    ],
  },
  {
    id: "sc-p4",
    kind: "pressure",
    core: false,
    setting: "You are under sustained stress and something has to give.",
    prompt: "What actually gives first:",
    options: [
      o("sc-p4-a", "lover", "deflated", "The relationships. They are the most patient and the least likely to escalate."),
      o("sc-p4-b", "warrior", "inflated", "Your patience with everyone else, well before your standards for the work."),
      o("sc-p4-c", "lover", "inflated", "Your judgement — you chase whatever gives relief, and call it a break."),
      o("sc-p4-d", "sovereign", "mature", "Nothing quietly: you decide out loud what you are dropping, and tell the people affected."),
    ],
  },
  {
    id: "sc-p5",
    kind: "pressure",
    core: false,
    setting: "Someone with less ability than you is promoted over you.",
    prompt: "Your honest reaction, a week later:",
    options: [
      o("sc-p5-a", "sovereign", "inflated", "You start keeping a private account of everywhere he is out of his depth."),
      o("sc-p5-b", "warrior", "deflated", "You disengage a little, and do not mention it to anyone who could change it."),
      o("sc-p5-c", "magician", "inflated", "You position yourself as the one who really runs things, without ever saying so."),
      o("sc-p5-d", "warrior", "mature", "You ask directly what was missing in your case, and take the answer seriously."),
    ],
  },
  {
    id: "sc-p6",
    kind: "pressure",
    core: false,
    setting: "Something in your life is genuinely going well.",
    prompt: "What most often happens next:",
    options: [
      o("sc-p6-a", "lover", "deflated", "You barely register it. You are already looking at the next problem."),
      o("sc-p6-b", "lover", "inflated", "You go all in on it, at the cost of things that were also working."),
      o("sc-p6-c", "magician", "deflated", "You analyse why it is working until it stops being enjoyable."),
      o("sc-p6-d", "lover", "mature", "You let yourself have it, and tell the people who helped that it went well."),
    ],
  },
];

export const CORE_SCENARIOS = SCENARIOS.filter((s) => s.core);

export function scenariosForForm(form: "short" | "full"): Scenario[] {
  return form === "short" ? CORE_SCENARIOS : SCENARIOS;
}
