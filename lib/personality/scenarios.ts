import type { Archetype4 } from "./archetypes4";

/**
 * The assessment is built on these.
 *
 * A statement like "I take charge when a group has no direction" announces
 * exactly what it measures, so it records self-image as much as behaviour. A
 * situation with four defensible responses does not. And because exactly one
 * option can be chosen, the format is ipsative: you cannot claim all four
 * energies at once, the way you can agree with every statement on a rating
 * scale. That single property is what makes a short instrument workable —
 * thirty forced choices carry more information than a hundred ratings.
 *
 * Two kinds:
 *
 *  - `standing` situations offer one mature response per archetype, and measure
 *    which energy you reach for by default. Each option also carries a `facet`,
 *    which is one of that archetype's three sub-archetypes — so choosing King
 *    repeatedly reveals not just King, but which kind.
 *  - `pressure` situations describe things going wrong. Their options map to
 *    the active and passive shadow poles. Nobody selects an option labelled as
 *    a flaw, so each is written to sound reasonable from the inside, which is
 *    how shadows actually operate.
 */

export interface ScenarioOption {
  id: string;
  text: string;
  archetype: Archetype4;
  /** Sub-archetype id, for `standing` options. */
  facet?: string;
  mode: "mature" | "active" | "passive";
}

export interface Scenario {
  id: string;
  kind: "standing" | "pressure";
  /** Included in the core (shorter) form. */
  core: boolean;
  setting: string;
  prompt: string;
  options: ScenarioOption[];
}

const k = (id: string, facet: string, text: string): ScenarioOption => ({
  id, text, archetype: "king", facet, mode: "mature",
});
const w = (id: string, facet: string, text: string): ScenarioOption => ({
  id, text, archetype: "warrior", facet, mode: "mature",
});
const m = (id: string, facet: string, text: string): ScenarioOption => ({
  id, text, archetype: "magician", facet, mode: "mature",
});
const l = (id: string, facet: string, text: string): ScenarioOption => ({
  id, text, archetype: "lover", facet, mode: "mature",
});
const shadow = (
  id: string,
  archetype: Archetype4,
  mode: "active" | "passive" | "mature",
  text: string,
): ScenarioOption => ({ id, text, archetype, mode });

export const SCENARIOS: Scenario[] = [
  /* ------------------------------------------------------- standing (24) */
  {
    id: "sc-01", kind: "standing", core: true,
    setting: "A meeting has run forty minutes and the decision is drifting.",
    prompt: "What do you actually do?",
    options: [
      k("sc-01-a", "leader", "Name the decision that needs making, put it to a call, and own the result."),
      w("sc-01-b", "maverick", "Say the thing everyone is avoiding, even though it makes the next ten minutes worse."),
      m("sc-01-c", "scholar", "Point out the assumption the whole discussion is resting on that nobody has checked."),
      l("sc-01-d", "diplomat", "Ask the two men who have not spoken what they think — the drift is usually about them."),
    ],
  },
  {
    id: "sc-02", kind: "standing", core: true,
    setting: "A friend tells you about a plan you think is a mistake.",
    prompt: "Your first move is to:",
    options: [
      l("sc-02-a", "diplomat", "Ask what he is hoping for from it, before saying anything about whether it will work."),
      w("sc-02-b", "competitor", "Tell him plainly that you think it is a mistake, and why."),
      m("sc-02-c", "scholar", "Walk through the part he has not modelled, and let the conclusion land on its own."),
      k("sc-02-d", "guardian", "Tell him you will back him either way, then give him your honest read."),
    ],
  },
  {
    id: "sc-03", kind: "standing", core: true,
    setting: "You have a free Saturday and no obligations.",
    prompt: "The version of the day that would satisfy you most is:",
    options: [
      m("sc-03-a", "explorer", "Getting properly into something you have been meaning to understand."),
      l("sc-03-b", "catalyst", "Time with people you actually like, nothing scheduled, no purpose."),
      w("sc-03-c", "builder", "Clearing the thing that has been sitting on you all week, and finishing it."),
      k("sc-03-d", "strategist", "Sorting something out that will make the next month run better for everyone."),
    ],
  },
  {
    id: "sc-04", kind: "standing", core: true,
    setting: "Someone younger does work that is close, but not right.",
    prompt: "You:",
    options: [
      k("sc-04-a", "leader", "Tell him what standard it missed and why the standard exists, then let him redo it."),
      m("sc-04-b", "craftsman", "Show him the reasoning he skipped, so the next one is right for the right reason."),
      w("sc-04-c", "competitor", "Send it back with the gap marked. He will learn faster from the correction."),
      l("sc-04-d", "advocate", "Find out what he was up against first — the work is usually a symptom."),
    ],
  },
  {
    id: "sc-05", kind: "standing", core: true,
    setting: "You are offered a role that pays better but is duller.",
    prompt: "What decides it for you?",
    options: [
      m("sc-05-a", "scholar", "Whether there is anything left to learn once you are competent at it."),
      k("sc-05-b", "strategist", "Whether it puts you in a position to affect things that matter."),
      l("sc-05-c", "catalyst", "Whether you would look forward to the days."),
      w("sc-05-d", "competitor", "Whether it is a harder job than the one you have."),
    ],
  },
  {
    id: "sc-06", kind: "standing", core: true,
    setting: "A group you are part of has quietly lowered its standards.",
    prompt: "You:",
    options: [
      w("sc-06-a", "maverick", "Say it out loud, knowing it makes you the difficult one."),
      k("sc-06-b", "leader", "Restate the standard and hold yourself to it visibly, first."),
      l("sc-06-c", "advocate", "Work out why people stopped caring, because that is the actual problem."),
      m("sc-06-d", "craftsman", "Show concretely what the slippage costs, so it stops being opinion."),
    ],
  },
  {
    id: "sc-07", kind: "standing", core: true,
    setting: "Someone criticises you publicly, and part of it is fair.",
    prompt: "In the moment, you:",
    options: [
      k("sc-07-a", "leader", "Concede the fair part immediately, and take the rest up privately."),
      w("sc-07-b", "competitor", "Answer the unfair part on the spot. Letting it stand costs more than the friction."),
      m("sc-07-c", "scholar", "Ask a question that separates the fair part from the rest, for everyone's benefit."),
      l("sc-07-d", "diplomat", "Register that it stung, say so plainly, and deal with the substance after."),
    ],
  },
  {
    id: "sc-08", kind: "standing", core: true,
    setting: "A project you care about is going to miss its date.",
    prompt: "Your instinct is to:",
    options: [
      w("sc-08-a", "builder", "Cut scope hard and hit the date with less."),
      k("sc-08-b", "guardian", "Tell everyone affected now, take the hit, reset expectations honestly."),
      m("sc-08-c", "scholar", "Work out what actually caused the slip before deciding anything."),
      l("sc-08-d", "advocate", "Check whether the team is still with you. A flat team misses the next one too."),
    ],
  },
  {
    id: "sc-09", kind: "standing", core: true,
    setting: "You discover you were wrong about something you argued hard for.",
    prompt: "You:",
    options: [
      k("sc-09-a", "leader", "Say so to the men who acted on it, before they find out another way."),
      m("sc-09-b", "craftsman", "Work out what reasoning produced the error, because that will recur."),
      w("sc-09-c", "builder", "Correct it and move. The wallowing costs more than the mistake did."),
      l("sc-09-d", "catalyst", "Sit with it. Being wrong about something you were sure of is worth feeling."),
    ],
  },
  {
    id: "sc-10", kind: "standing", core: true,
    setting: "An old friend has drifted out of contact.",
    prompt: "You:",
    options: [
      l("sc-10-a", "catalyst", "Get in touch with no reason, and say you have been thinking about him."),
      k("sc-10-b", "guardian", "Reach out. Keeping the men around you connected is your job, not the drift's."),
      m("sc-10-c", "explorer", "Think about what changed. Friendships drift for reasons worth understanding."),
      w("sc-10-d", "maverick", "Call and say directly that you have missed him and want to fix it."),
    ],
  },
  {
    id: "sc-11", kind: "standing", core: true,
    setting: "You are given more authority than you expected.",
    prompt: "The first thing you do with it is:",
    options: [
      k("sc-11-a", "guardian", "Work out who now depends on you, and tell them what they can expect."),
      w("sc-11-b", "maverick", "Fix the thing that has been broken because nobody had standing to fix it."),
      m("sc-11-c", "explorer", "Find out how the system actually works before changing any of it."),
      l("sc-11-d", "diplomat", "Get to know the people properly. Authority without trust is noise."),
    ],
  },
  {
    id: "sc-12", kind: "standing", core: true,
    setting: "Something you built is being used in a way you did not intend.",
    prompt: "You:",
    options: [
      m("sc-12-a", "explorer", "Get curious. How people actually use a thing usually beats how you meant it."),
      k("sc-12-b", "strategist", "Decide whether the new use is acceptable, and say so clearly either way."),
      w("sc-12-c", "maverick", "Shut down the uses that will cause harm, without waiting for consensus."),
      l("sc-12-d", "advocate", "Talk to the people using it that way and understand what they needed."),
    ],
  },
  {
    id: "sc-13", kind: "standing", core: false,
    setting: "You have an hour before a meeting that matters.",
    prompt: "You spend it:",
    options: [
      m("sc-13-a", "scholar", "Understanding the other side's position better than they will expect."),
      k("sc-13-b", "strategist", "Deciding in advance what outcome you will and will not accept."),
      w("sc-13-c", "builder", "Rehearsing the hardest thing you have to say until it is clean."),
      l("sc-13-d", "catalyst", "Getting into a decent state of mind, so you turn up as yourself."),
    ],
  },
  {
    id: "sc-14", kind: "standing", core: false,
    setting: "A younger man asks you for advice about his life.",
    prompt: "What you give him is mostly:",
    options: [
      k("sc-14-a", "leader", "A straight account of what the responsibility will actually ask of him."),
      m("sc-14-b", "craftsman", "A better model of the situation than the one he arrived with."),
      w("sc-14-c", "builder", "One concrete thing to do this week, and the expectation that he does it."),
      l("sc-14-d", "advocate", "Your full attention, and the sense that he was heard rather than processed."),
    ],
  },
  {
    id: "sc-15", kind: "standing", core: false,
    setting: "You have been offered something that would take two years and might not work.",
    prompt: "The thing that would make you say yes is:",
    options: [
      w("sc-15-a", "maverick", "That it is genuinely hard, and most men would not take it on."),
      m("sc-15-b", "explorer", "That you would come out the other side understanding something new."),
      k("sc-15-c", "strategist", "That if it works, it changes things for more people than you."),
      l("sc-15-d", "diplomat", "That you would be doing it with people you would want to spend two years with."),
    ],
  },
  {
    id: "sc-16", kind: "standing", core: false,
    setting: "Two men you respect are in a dispute and both want you on their side.",
    prompt: "You:",
    options: [
      k("sc-16-a", "leader", "Say what you actually think is right, and accept that it costs you with one of them."),
      l("sc-16-b", "diplomat", "Get them in a room. Most of this is not about the thing they are arguing over."),
      m("sc-16-c", "scholar", "Work out what each is actually defending before taking any position."),
      w("sc-16-d", "competitor", "Tell them both you are not being recruited, and mean it."),
    ],
  },
  {
    id: "sc-17", kind: "standing", core: false,
    setting: "You have done good work and nobody has noticed.",
    prompt: "What you do about it:",
    options: [
      w("sc-17-a", "competitor", "Say so directly to the person who should have noticed."),
      k("sc-17-b", "strategist", "Make sure the work is visible next time, by structuring it that way."),
      m("sc-17-c", "craftsman", "Nothing. You know what it was worth, and that was the point."),
      l("sc-17-d", "diplomat", "Tell someone who will actually be pleased for you, and let that be enough."),
    ],
  },
  {
    id: "sc-18", kind: "standing", core: false,
    setting: "A man on your team is going through something difficult outside work.",
    prompt: "You:",
    options: [
      l("sc-18-a", "advocate", "Ask him how he is, properly, and make room for a real answer."),
      k("sc-18-b", "guardian", "Quietly take load off him without making it a conversation."),
      w("sc-18-c", "builder", "Keep the standard but change the deadline. Work can be a refuge."),
      m("sc-18-d", "explorer", "Find out what would actually help, rather than assuming."),
    ],
  },
  {
    id: "sc-19", kind: "standing", core: false,
    setting: "You are asked to defend a decision you did not make and do not agree with.",
    prompt: "You:",
    options: [
      k("sc-19-a", "guardian", "Defend it as the group's decision, and argue your case internally, hard."),
      w("sc-19-b", "maverick", "Say plainly that it was not your call and you disagree."),
      m("sc-19-c", "craftsman", "Lay out the reasoning on both sides and let people judge it."),
      l("sc-19-d", "diplomat", "Find the part of it you do believe, and stand on that honestly."),
    ],
  },
  {
    id: "sc-20", kind: "standing", core: false,
    setting: "Your standards and someone else's are in conflict on a shared piece of work.",
    prompt: "You:",
    options: [
      m("sc-20-a", "craftsman", "Show, concretely, what the difference produces. Standards are an empirical question."),
      w("sc-20-b", "builder", "Hold yours. Meeting in the middle on quality gives you the worse of both."),
      k("sc-20-c", "strategist", "Decide which standard this particular job actually needs, and say so."),
      l("sc-20-d", "advocate", "Find out what he is protecting. It is rarely really about the standard."),
    ],
  },
  {
    id: "sc-21", kind: "standing", core: false,
    setting: "You realise you have been coasting for several months.",
    prompt: "The thing that gets you out of it is:",
    options: [
      w("sc-21-a", "competitor", "Putting yourself somewhere you can be measured again."),
      m("sc-21-b", "explorer", "Finding a problem interesting enough to pull you in."),
      k("sc-21-c", "guardian", "Remembering who is relying on you being sharp."),
      l("sc-21-d", "catalyst", "Getting around people whose energy is contagious."),
    ],
  },
  {
    id: "sc-22", kind: "standing", core: false,
    setting: "You are at a table where you know nobody.",
    prompt: "An hour in, you are most likely:",
    options: [
      l("sc-22-a", "catalyst", "Deep in conversation with two of them, having enjoyed yourself."),
      m("sc-22-b", "scholar", "Talking to one person about something specific and genuinely interesting."),
      k("sc-22-c", "leader", "Somehow organising the table — drinks, introductions, who has not met whom."),
      w("sc-22-d", "maverick", "Having said something direct enough to make the conversation real."),
    ],
  },
  {
    id: "sc-23", kind: "standing", core: false,
    setting: "Someone crosses a line with a man you are responsible for.",
    prompt: "You:",
    options: [
      w("sc-23-a", "competitor", "Deal with it directly, immediately, with whoever did it."),
      k("sc-23-b", "guardian", "Make clear that it goes through you now, and that it stops."),
      l("sc-23-c", "advocate", "Check on him first. What he needs may not be you fighting it."),
      m("sc-23-d", "craftsman", "Establish exactly what happened before doing anything you cannot undo."),
    ],
  },
  {
    id: "sc-24", kind: "standing", core: false,
    setting: "You have a choice between finishing something well and starting something new.",
    prompt: "You:",
    options: [
      w("sc-24-a", "builder", "Finish. The unfinished pile is what stops you being taken seriously."),
      m("sc-24-b", "explorer", "Start. The new thing is where the learning is."),
      k("sc-24-c", "strategist", "Ask which one more people are depending on, and do that."),
      l("sc-24-d", "catalyst", "Follow the one you actually have appetite for. Forced work is bad work."),
    ],
  },

  /* ------------------------------------------------------- pressure (10) */
  {
    id: "sc-p1", kind: "pressure", core: true,
    setting: "A decision you made turns out badly, and it is visibly your call.",
    prompt: "What you are most likely to actually do:",
    options: [
      shadow("sc-p1-a", "king", "active", "Defend it harder. Reversing in public costs more authority than the error does."),
      shadow("sc-p1-b", "king", "passive", "Go quiet and let it be absorbed. Drawing attention to it helps nobody."),
      shadow("sc-p1-c", "magician", "active", "Explain the reasoning in enough detail that the outcome stops looking like a choice."),
      shadow("sc-p1-d", "king", "mature", "Say plainly that it was your call and it was wrong, then say what you are changing."),
    ],
  },
  {
    id: "sc-p2", kind: "pressure", core: true,
    setting: "Someone repeatedly crosses a line with you and does not notice.",
    prompt: "By the fourth time, you are most likely to:",
    options: [
      shadow("sc-p2-a", "warrior", "passive", "Still not have said anything. It is not worth the friction, and you can absorb it."),
      shadow("sc-p2-b", "warrior", "active", "Let it out all at once, harder than the moment warrants, because it has been building."),
      shadow("sc-p2-c", "lover", "passive", "Quietly see less of him, without ever raising it."),
      shadow("sc-p2-d", "warrior", "mature", "Name it calmly at the next occurrence, in proportion, and hold the line after."),
    ],
  },
  {
    id: "sc-p3", kind: "pressure", core: true,
    setting: "You can see a decision being made on a false premise, and correcting it will cost you.",
    prompt: "You:",
    options: [
      shadow("sc-p3-a", "magician", "passive", "Say nothing. You will be right, and being right will be its own record."),
      shadow("sc-p3-b", "magician", "active", "Say part of it — enough to be on record, not enough to change an outcome that suits you."),
      shadow("sc-p3-c", "warrior", "active", "Force the point until it is conceded, whatever it does to the room."),
      shadow("sc-p3-d", "magician", "mature", "State the premise plainly and let the decision be made on it, including if it goes against you."),
    ],
  },
  {
    id: "sc-p4", kind: "pressure", core: true,
    setting: "You are under sustained stress and something has to give.",
    prompt: "What actually gives first:",
    options: [
      shadow("sc-p4-a", "lover", "passive", "The relationships. They are the most patient and least likely to escalate."),
      shadow("sc-p4-b", "warrior", "active", "Your patience with everyone else, well before your standards for the work."),
      shadow("sc-p4-c", "lover", "active", "Your judgement. You chase whatever gives relief and call it a break."),
      shadow("sc-p4-d", "king", "mature", "Nothing quietly: you decide out loud what you are dropping, and tell the people affected."),
    ],
  },
  {
    id: "sc-p5", kind: "pressure", core: true,
    setting: "A man with less ability than you is promoted over you.",
    prompt: "Your honest reaction, a week later:",
    options: [
      shadow("sc-p5-a", "king", "active", "You start keeping a private account of everywhere he is out of his depth."),
      shadow("sc-p5-b", "warrior", "passive", "You disengage a little, and mention it to nobody who could change it."),
      shadow("sc-p5-c", "magician", "active", "You position yourself as the one who really runs things, without ever saying so."),
      shadow("sc-p5-d", "warrior", "mature", "You ask directly what was missing in your case, and take the answer seriously."),
    ],
  },
  {
    id: "sc-p6", kind: "pressure", core: true,
    setting: "Something in your life is genuinely going well.",
    prompt: "What most often happens next:",
    options: [
      shadow("sc-p6-a", "lover", "passive", "You barely register it. You are already looking at the next problem."),
      shadow("sc-p6-b", "lover", "active", "You go all in on it, at the cost of things that were also working."),
      shadow("sc-p6-c", "magician", "passive", "You analyse why it is working until it stops being enjoyable."),
      shadow("sc-p6-d", "lover", "mature", "You let yourself have it, and tell the people who helped that it went well."),
    ],
  },
  {
    id: "sc-p7", kind: "pressure", core: false,
    setting: "Someone under you makes a serious mistake that lands on you.",
    prompt: "You:",
    options: [
      shadow("sc-p7-a", "king", "active", "Make sure everyone knows exactly whose mistake it was."),
      shadow("sc-p7-b", "king", "passive", "Absorb it silently and say nothing to him, because raising it feels harsh."),
      shadow("sc-p7-c", "warrior", "active", "Take it out of him, in proportion to how exposed it left you."),
      shadow("sc-p7-d", "king", "mature", "Carry it publicly, then deal with it squarely with him in private."),
    ],
  },
  {
    id: "sc-p8", kind: "pressure", core: false,
    setting: "You have been asked to do something you think is beneath you.",
    prompt: "You:",
    options: [
      shadow("sc-p8-a", "king", "active", "Make it clear, one way or another, that this is not what you are for."),
      shadow("sc-p8-b", "warrior", "passive", "Do it, badly and resentfully, and let that be the message."),
      shadow("sc-p8-c", "magician", "active", "Find a way for it to become someone else's, without ever refusing."),
      shadow("sc-p8-d", "warrior", "mature", "Do it properly, and separately raise whether it should be your job."),
    ],
  },
  {
    id: "sc-p9", kind: "pressure", core: false,
    setting: "A relationship that matters to you has gone cold and you are not sure why.",
    prompt: "You:",
    options: [
      shadow("sc-p9-a", "lover", "passive", "Let it run its course. If he wanted to talk, he would."),
      shadow("sc-p9-b", "lover", "active", "Overcorrect — too much contact, too intense, all at once."),
      shadow("sc-p9-c", "magician", "passive", "Construct a theory about it and act on the theory rather than asking."),
      shadow("sc-p9-d", "lover", "mature", "Say directly that something feels off and you would like to understand it."),
    ],
  },
  {
    id: "sc-p10", kind: "pressure", core: false,
    setting: "You are losing an argument in front of people, and you suspect you are wrong.",
    prompt: "You:",
    options: [
      shadow("sc-p10-a", "warrior", "active", "Go harder. Conceding in front of an audience is the worse outcome."),
      shadow("sc-p10-b", "magician", "active", "Shift the ground to something you can win on instead."),
      shadow("sc-p10-c", "king", "passive", "Go quiet and let it peter out without ever conceding."),
      shadow("sc-p10-d", "magician", "mature", "Say out loud that you think you are wrong, and follow the argument where it goes."),
    ],
  },
];

export const CORE_SCENARIOS = SCENARIOS.filter((s) => s.core);

export function scenariosForForm(form: "core" | "deep"): Scenario[] {
  return form === "core" ? CORE_SCENARIOS : SCENARIOS;
}
