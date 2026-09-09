import type { Archetype4 } from "./archetypes4";

/**
 * The assessment is built on these.
 *
 * Every situation is set in school life, because a scenario only works if you
 * can picture yourself inside it. An abstract prompt ("a group you are part of
 * has lowered its standards") gets answered by the person you believe you are;
 * a concrete one — a specific room, a specific Friday deadline, a specific
 * person who has stopped replying — gets answered by the person you actually
 * are. The detail is doing real measurement work, not set dressing.
 *
 * Because exactly one option can be chosen, the format is ipsative: you cannot
 * claim all four energies at once, the way you can agree with every statement
 * on a rating scale. That is what makes a short assessment workable.
 *
 * Two kinds:
 *  - `standing` situations offer one mature response per archetype, each tagged
 *    with a sub-archetype (`facet`) and a `context`, so the result can say not
 *    just which energy you reach for but which flavour, and where.
 *  - `pressure` situations describe things going wrong, and map to the active
 *    and passive shadow poles. Every option is written to sound reasonable from
 *    the inside, which is how shadows actually operate.
 */

/** Where in school life the situation happens. */
export type Context = "classroom" | "friendship" | "conflict" | "authority" | "solitude";

export const CONTEXTS: Context[] = [
  "classroom",
  "friendship",
  "conflict",
  "authority",
  "solitude",
];

export const CONTEXT_LABELS: Record<Context, string> = {
  classroom: "Group work & lessons",
  friendship: "Friendships",
  conflict: "Conflict",
  authority: "Teachers & rules",
  solitude: "Your own time",
};

export const CONTEXT_BLURBS: Record<Context, string> = {
  classroom: "Projects, deadlines and being in a room where work has to get done.",
  friendship: "The people you choose, and what you do when those relationships need something.",
  conflict: "Being crossed, disagreed with, or watching someone else be treated badly.",
  authority: "Teachers, rules, marks, and being judged by someone with power over you.",
  solitude: "What you do when nobody is watching and nothing is due.",
};

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
  context: Context;
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
const sh = (
  id: string,
  archetype: Archetype4,
  mode: "active" | "passive" | "mature",
  text: string,
): ScenarioOption => ({ id, text, archetype, mode });

export const SCENARIOS: Scenario[] = [
  /* ---------------------------------------------------- standing · 24 */
  {
    id: "sc-01", kind: "standing", core: true, context: "classroom",
    setting:
      "It is Wednesday. A group project is due Friday and your group of four has done nothing but create a chat that went quiet after two messages. You are all sitting in the library now because a teacher told you to.",
    prompt: "What do you actually do in the first five minutes?",
    options: [
      k("sc-01-a", "leader", "Split it into four parts, say out loud who is doing which, and tell them you will carry it if it comes apart."),
      w("sc-01-b", "maverick", "Say the thing nobody wants said — that everyone has ignored this for two weeks — and start from there."),
      m("sc-01-c", "explorer", "Open the actual brief and read it properly. Half the paralysis is that nobody knows what is being asked for."),
      l("sc-01-d", "catalyst", "Get them talking and half-joking first. Nothing has happened because nobody wants to be in this room."),
    ],
  },
  {
    id: "sc-02", kind: "standing", core: true, context: "conflict",
    setting:
      "A boy in your year has become the joke in a group chat you are in. It started as banter. Tonight someone posted a photo of him that he clearly did not want shared, and it is getting replies.",
    prompt: "What do you actually do that evening?",
    options: [
      k("sc-02-a", "guardian", "Message the chat saying to take it down and drop it, knowing that now makes it your problem too."),
      w("sc-02-b", "competitor", "Reply directly to whoever posted it and tell him it is out of order, in front of everyone."),
      m("sc-02-c", "craftsman", "Message the boy himself first and find out what he actually wants done, before you do anything public."),
      l("sc-02-d", "advocate", "Leave the chat and tell him privately that you are on his side and it was not funny."),
    ],
  },
  {
    id: "sc-03", kind: "standing", core: true, context: "solitude",
    setting:
      "It is a Saturday in term time with no homework due until Wednesday, no plans, and nobody expecting anything from you.",
    prompt: "The version of the day that would actually satisfy you is:",
    options: [
      m("sc-03-a", "scholar", "Going down a rabbit hole on something that has nothing to do with school, for four hours."),
      l("sc-03-b", "catalyst", "Ending up with two or three mates and no plan, and it turning into a good day."),
      w("sc-03-c", "builder", "Clearing the thing that has been sitting on you all week — training, revision, whatever — and finishing it."),
      k("sc-03-d", "strategist", "Getting your week organised so the next five days stop being a scramble."),
    ],
  },
  {
    id: "sc-04", kind: "standing", core: true, context: "authority",
    setting:
      "A teacher hands back an essay with a mark lower than you expected and two lines of feedback that do not really explain why.",
    prompt: "By the end of the day you have:",
    options: [
      m("sc-04-a", "craftsman", "Read your essay again next to the mark scheme, and found the specific thing you did not do."),
      k("sc-04-b", "leader", "Gone to ask her properly what the gap was, and taken the answer without arguing it."),
      w("sc-04-c", "competitor", "Asked her to justify it, because you think the mark is wrong and you are willing to say so."),
      l("sc-04-d", "diplomat", "Talked it over with a friend who got a better mark, and worked out the difference together."),
    ],
  },
  {
    id: "sc-05", kind: "standing", core: true, context: "friendship",
    setting:
      "Your closest friend has been off for about three weeks. Shorter replies, leaving early, saying he is tired. You have asked once and he said he was fine.",
    prompt: "What you do next is:",
    options: [
      l("sc-05-a", "advocate", "Ask again, properly, somewhere he cannot deflect it — and make it obvious you actually want the real answer."),
      k("sc-05-b", "guardian", "Keep turning up. Do not force it, but make sure he is never without someone there."),
      m("sc-05-c", "explorer", "Work out what changed three weeks ago, because something did, and it will tell you what this is."),
      w("sc-05-d", "maverick", "Say straight out that you do not believe him and you are not going to pretend you do."),
    ],
  },
  {
    id: "sc-06", kind: "standing", core: true, context: "classroom",
    setting:
      "You are picked to present your group's work to the class. Two of the four did almost nothing. The teacher is marking the group as a whole.",
    prompt: "In the presentation you:",
    options: [
      k("sc-06-a", "strategist", "Present it as the group's work. You will sort out who did what separately, not in front of thirty people."),
      w("sc-06-b", "builder", "Present the parts that are actually finished properly, and do not dress up the rest."),
      m("sc-06-c", "scholar", "Focus on making the ideas land. Whoever wrote them matters less than whether the class understands."),
      l("sc-06-d", "diplomat", "Make sure the two who did contribute get named, without making the other two look bad."),
    ],
  },
  {
    id: "sc-07", kind: "standing", core: true, context: "conflict",
    setting:
      "Someone makes a joke at your expense in front of a group. It gets a laugh. It was not vicious, but it landed on something you are actually self-conscious about.",
    prompt: "In the moment, you:",
    options: [
      w("sc-07-a", "competitor", "Come straight back at him. Letting it sit costs more than the awkwardness will."),
      k("sc-07-b", "leader", "Let it go in the moment, and say something to him later when there is no audience."),
      m("sc-07-c", "craftsman", "Laugh, and file it. You now know something about him that is worth knowing."),
      l("sc-07-d", "catalyst", "Laugh properly and make it funnier. It genuinely stops mattering once you do."),
    ],
  },
  {
    id: "sc-08", kind: "standing", core: true, context: "authority",
    setting:
      "A teacher accuses your class of something — phones out, work copied — and is talking to all of you. You did not do it. Two people did, and you know who.",
    prompt: "What do you do while she is still talking?",
    options: [
      k("sc-08-a", "guardian", "Say the class as a whole will sort it out, and then actually go and sort it out."),
      w("sc-08-b", "maverick", "Say plainly that punishing everyone for two people is not right, whatever it costs you with her."),
      m("sc-08-c", "explorer", "Say nothing now. Work out afterwards what she actually saw, because that changes what is worth saying."),
      l("sc-08-d", "advocate", "Go to the two afterwards and tell them to own it, rather than letting the class carry it."),
    ],
  },
  {
    id: "sc-09", kind: "standing", core: true, context: "solitude",
    setting:
      "You have exams in six weeks. You know what you are supposed to be doing. Tonight nobody would know either way.",
    prompt: "What actually gets you to work is:",
    options: [
      w("sc-09-a", "builder", "Having decided in advance. You said two hours, so it is two hours, regardless of how you feel."),
      m("sc-09-b", "scholar", "Finding a bit of it that is genuinely interesting and following that until it pulls you along."),
      k("sc-09-c", "strategist", "Knowing exactly what these six weeks decide, and working backwards from that."),
      l("sc-09-d", "diplomat", "Going to work with someone else, because doing it alone in your room never happens."),
    ],
  },
  {
    id: "sc-10", kind: "standing", core: true, context: "friendship",
    setting:
      "A mate tells you he is going to do something you think is a mistake — dropping a subject he is good at, or ending something with someone, or a plan for the weekend that will not end well.",
    prompt: "Your first move is:",
    options: [
      l("sc-10-a", "diplomat", "Ask what he is hoping will happen, before you say anything about whether it will."),
      w("sc-10-b", "competitor", "Tell him straight that you think it is a mistake, and exactly why."),
      m("sc-10-c", "craftsman", "Walk him through the part he clearly has not thought about, and let him get there himself."),
      k("sc-10-d", "leader", "Tell him you are with him either way, and then give him your honest read."),
    ],
  },
  {
    id: "sc-11", kind: "standing", core: true, context: "classroom",
    setting:
      "You get put in a group with someone who is much further behind than you. The work is marked jointly and you have a week.",
    prompt: "Over that week, you mostly:",
    options: [
      m("sc-11-a", "craftsman", "Sit with him and show him the reasoning, so the next piece is right for the right reason."),
      k("sc-11-b", "guardian", "Take the parts he will struggle with, give him the parts he can own, and do not make a thing of it."),
      w("sc-11-c", "builder", "Set him a clear, small piece and hold him to it. Carrying him teaches him nothing."),
      l("sc-11-d", "advocate", "Find out first why he is behind. It is usually not that he cannot do it."),
    ],
  },
  {
    id: "sc-12", kind: "standing", core: true, context: "conflict",
    setting:
      "Two friends of yours have fallen out badly. Both have told you their side. Both clearly want you to agree that the other is being unreasonable.",
    prompt: "What you actually do:",
    options: [
      k("sc-12-a", "leader", "Say what you actually think is right, and accept it costs you with one of them."),
      l("sc-12-b", "catalyst", "Get them in the same room. Ninety per cent of this is not about the thing they are arguing over."),
      m("sc-12-c", "scholar", "Work out what each of them is actually defending, before you take any position at all."),
      w("sc-12-d", "maverick", "Tell them both you are not being recruited, and mean it."),
    ],
  },
  {
    id: "sc-13", kind: "standing", core: false, context: "authority",
    setting:
      "You are up for something you want — a team, a trip, a prefect role — and there is an interview or a conversation with a teacher that decides it. You have an hour beforehand.",
    prompt: "You spend it:",
    options: [
      m("sc-13-a", "explorer", "Working out what they are actually looking for, which is usually not what the description says."),
      k("sc-13-b", "strategist", "Deciding what you will and will not agree to, so you are not negotiating on the spot."),
      w("sc-13-c", "builder", "Practising the hardest thing you have to say until it comes out clean."),
      l("sc-13-d", "catalyst", "Getting into a decent state of mind so you turn up as yourself rather than a version of you."),
    ],
  },
  {
    id: "sc-14", kind: "standing", core: false, context: "friendship",
    setting:
      "A boy two years below you has started following you around a bit. He asks you what subjects to take and whether he should stick with a sport he is not enjoying.",
    prompt: "What you actually give him is:",
    options: [
      k("sc-14-a", "leader", "A straight account of what each choice will actually ask of him, without softening it."),
      m("sc-14-b", "scholar", "A better way of thinking about the decision than the one he turned up with."),
      w("sc-14-c", "builder", "One thing to do this week, and the expectation that he does it and tells you."),
      l("sc-14-d", "advocate", "Your full attention, so that he leaves feeling heard rather than handled."),
    ],
  },
  {
    id: "sc-15", kind: "standing", core: false, context: "solitude",
    setting:
      "You could commit to something that would take up most of two years — a sport at a serious level, an instrument, a subject you would have to work at hard — and you might not be good enough at the end of it.",
    prompt: "The thing that would make you say yes is:",
    options: [
      w("sc-15-a", "maverick", "That it is genuinely hard and most people in your year would not take it on."),
      m("sc-15-b", "explorer", "That you would come out the other side actually understanding something."),
      k("sc-15-c", "strategist", "That if it works it changes your options, not just your Saturdays."),
      l("sc-15-d", "diplomat", "That you would be doing it alongside people you would want to spend two years with."),
    ],
  },
  {
    id: "sc-16", kind: "standing", core: false, context: "classroom",
    setting:
      "You have done a piece of work you are genuinely proud of. It gets a fine mark and no comment. Someone else's weaker piece gets read out to the class.",
    prompt: "What you do about it:",
    options: [
      w("sc-16-a", "competitor", "Go and ask the teacher directly what would have made yours the one read out."),
      k("sc-16-b", "strategist", "Note what got noticed, and make sure the next one is visible as well as good."),
      m("sc-16-c", "craftsman", "Nothing. You know what it was worth, and that was the point of doing it properly."),
      l("sc-16-d", "diplomat", "Show it to someone who will actually be pleased about it, and let that be enough."),
    ],
  },
  {
    id: "sc-17", kind: "standing", core: false, context: "conflict",
    setting:
      "Someone you train with, or work with every lesson, has started making small digs at you. Individually each one is nothing. It has been happening for a month.",
    prompt: "What you do about it:",
    options: [
      w("sc-17-a", "maverick", "Name it the next time it happens, in proportion, and do not let it slide after that."),
      k("sc-17-b", "guardian", "Talk to him away from everyone. Doing it in front of people makes it about the audience."),
      m("sc-17-c", "scholar", "Work out what started a month ago, because something did and it is probably not about you."),
      l("sc-17-d", "advocate", "Ask him directly if something is wrong between you, and mean the question."),
    ],
  },
  {
    id: "sc-18", kind: "standing", core: false, context: "authority",
    setting:
      "A rule at school is clearly stupid — a uniform detail, a phone policy, a rule about where you can be at lunch. Most people ignore it quietly. You have been pulled up on it.",
    prompt: "What you actually do:",
    options: [
      k("sc-18-a", "leader", "Follow it and make the case for changing it through whoever can actually change it."),
      w("sc-18-b", "maverick", "Keep ignoring it and take whatever comes. Some rules are worth the detention."),
      m("sc-18-c", "explorer", "Find out why it exists. Stupid rules usually started as a response to something."),
      l("sc-18-d", "diplomat", "Comply, but say to the teacher — reasonably — why it grates on people. She might not know."),
    ],
  },
  {
    id: "sc-19", kind: "standing", core: false, context: "classroom",
    setting:
      "Your group's plan for a project is one you argued against and lost. Now the teacher asks you, specifically, to explain the group's approach.",
    prompt: "In front of the teacher, you:",
    options: [
      k("sc-19-a", "guardian", "Present it as the group's decision and defend it properly, then keep arguing your case inside the group."),
      w("sc-19-b", "competitor", "Say plainly that it was not your call and that you disagreed, and explain why."),
      m("sc-19-c", "craftsman", "Lay out both approaches accurately and let the teacher draw her own conclusion."),
      l("sc-19-d", "diplomat", "Find the part of it you genuinely do believe in, and present that with something behind it."),
    ],
  },
  {
    id: "sc-20", kind: "standing", core: false, context: "classroom",
    setting:
      "You and one other person are doing a piece of coursework together. He wants to hand in something that is finished but sloppy. You think it needs another evening's work. It is his name on it too.",
    prompt: "What you do about it:",
    options: [
      m("sc-20-a", "scholar", "Show him concretely what the difference in marks would be. This is answerable, not a matter of taste."),
      w("sc-20-b", "builder", "Hold your line and do the extra evening yourself if you have to."),
      k("sc-20-c", "strategist", "Work out what this particular piece actually needs to be, and say which of you is right about that."),
      l("sc-20-d", "advocate", "Find out why he wants it in. He may be under something you do not know about."),
    ],
  },
  {
    id: "sc-21", kind: "standing", core: false, context: "solitude",
    setting:
      "You realise you have been coasting for most of a term. Nothing has gone wrong, exactly. You are just not really trying at anything.",
    prompt: "The thing that gets you out of it is:",
    options: [
      w("sc-21-a", "competitor", "Putting yourself somewhere you will be measured again — a trial, a test, a match."),
      m("sc-21-b", "explorer", "Finding one thing interesting enough that you want to be in it."),
      k("sc-21-c", "guardian", "Remembering who is relying on you being on form, and not wanting to let that go."),
      l("sc-21-d", "catalyst", "Getting around people who are actually going at something. It is contagious."),
    ],
  },
  {
    id: "sc-22", kind: "standing", core: false, context: "friendship",
    setting:
      "You are at a sixth-form thing, or a party, where you know almost nobody. You have been there an hour.",
    prompt: "You are most likely:",
    options: [
      l("sc-22-a", "catalyst", "Two conversations deep with people you had not met, and enjoying yourself."),
      m("sc-22-b", "scholar", "Talking to one person about something specific for most of the hour."),
      k("sc-22-c", "leader", "Somehow running the room a bit — introductions, drinks, who has not met whom."),
      w("sc-22-d", "maverick", "Having said something direct enough that the conversation stopped being small talk."),
    ],
  },
  {
    id: "sc-23", kind: "standing", core: false, context: "conflict",
    setting:
      "Someone has been unpleasant to a boy you look out for — a younger brother, a mate on your team, someone in your form who has a hard time of it. He has told you and asked you not to make it worse.",
    prompt: "What you do:",
    options: [
      w("sc-23-a", "competitor", "Deal with it directly and immediately with whoever did it."),
      k("sc-23-b", "guardian", "Make clear to the other person that it goes through you now, and that it stops."),
      l("sc-23-c", "advocate", "Respect what he asked for. Check what he actually needs before doing anything."),
      m("sc-23-d", "craftsman", "Establish exactly what happened first, before doing something you cannot undo."),
    ],
  },
  {
    id: "sc-24", kind: "standing", core: false, context: "solitude",
    setting:
      "You have a half-finished thing you care about — a project, a piece of writing, a training block — and a new idea that is much more exciting.",
    prompt: "Which one you actually spend the evening on:",
    options: [
      w("sc-24-a", "builder", "Finish the first one. The pile of half-done things is the actual problem."),
      m("sc-24-b", "explorer", "Start the new one. That is where you will actually learn something."),
      k("sc-24-c", "strategist", "Ask which one anybody else is depending on, and do that one."),
      l("sc-24-d", "catalyst", "Follow the one you have appetite for. Forced work is bad work anyway."),
    ],
  },

  /* ---------------------------------------------------- pressure · 10 */
  {
    id: "sc-p1", kind: "pressure", core: true, context: "classroom",
    setting:
      "You talked your group into an approach for a project. It has gone badly and the mark is poor. In the debrief, the teacher asks whose idea it was, and everyone looks at you.",
    prompt: "What you are most likely to actually do:",
    options: [
      sh("sc-p1-a", "king", "active", "Defend the approach hard. Backing down in front of the group costs more than the mark did."),
      sh("sc-p1-b", "king", "passive", "Say nothing much and let it be absorbed. Making a thing of it helps nobody."),
      sh("sc-p1-c", "magician", "active", "Explain the reasoning in enough detail that it stops sounding like it was a choice."),
      sh("sc-p1-d", "king", "mature", "Say it was your call and it was wrong, and say what you would do differently."),
    ],
  },
  {
    id: "sc-p2", kind: "pressure", core: true, context: "conflict",
    setting:
      "Someone in your friendship group keeps making the same joke about you. You have laughed it off three times. He clearly has no idea it bothers you.",
    prompt: "By the fourth time, you are most likely to:",
    options: [
      sh("sc-p2-a", "warrior", "passive", "Still not say anything. It is not worth the awkwardness and you can take it."),
      sh("sc-p2-b", "warrior", "active", "Snap at him — harder than the moment deserves, because it has been building."),
      sh("sc-p2-c", "lover", "passive", "Quietly start seeing less of him, without ever telling him why."),
      sh("sc-p2-d", "warrior", "mature", "Tell him calmly, the next time it happens, that you would rather he stopped — and leave it there."),
    ],
  },
  {
    id: "sc-p3", kind: "pressure", core: true, context: "authority",
    setting:
      "Your class is about to hand in work based on something the teacher explained wrong. You are fairly sure you are right. Saying so means correcting her in front of everyone, and she does not take it well.",
    prompt: "What you actually do in the lesson:",
    options: [
      sh("sc-p3-a", "magician", "passive", "Say nothing. You will be right, and being right will speak for itself when the marks come back."),
      sh("sc-p3-b", "magician", "active", "Mention it quietly to a couple of people, so it is known you spotted it, without changing anything."),
      sh("sc-p3-c", "warrior", "active", "Push the point until she concedes it, whatever that does to the room."),
      sh("sc-p3-d", "magician", "mature", "Say it plainly and let it be dealt with, including if you turn out to be the one who is wrong."),
    ],
  },
  {
    id: "sc-p4", kind: "pressure", core: true, context: "solitude",
    setting:
      "It is exam term. You are behind, sleeping badly, and there is more on than you can carry. Something has to give this week.",
    prompt: "What actually gives first:",
    options: [
      sh("sc-p4-a", "lover", "passive", "The people. Friends and family are the most patient and the least likely to escalate."),
      sh("sc-p4-b", "warrior", "active", "Your patience with everyone else, well before your standards for the work."),
      sh("sc-p4-c", "lover", "active", "Your judgement. You chase whatever gives relief for an evening and call it a break."),
      sh("sc-p4-d", "king", "mature", "Nothing quietly: you decide what you are dropping and tell the people it affects."),
    ],
  },
  {
    id: "sc-p5", kind: "pressure", core: true, context: "authority",
    setting:
      "Someone you know is not as good as you gets the captaincy, the part, or the place you wanted. You are told you were close.",
    prompt: "Your honest reaction, a week later:",
    options: [
      sh("sc-p5-a", "king", "active", "You have started quietly keeping score of everywhere he is out of his depth."),
      sh("sc-p5-b", "warrior", "passive", "You have pulled back a bit, and mentioned it to nobody who could do anything about it."),
      sh("sc-p5-c", "magician", "active", "You have made yourself the one who actually runs things, without ever saying so."),
      sh("sc-p5-d", "warrior", "mature", "You have asked directly what was missing in your case, and taken the answer seriously."),
    ],
  },
  {
    id: "sc-p6", kind: "pressure", core: true, context: "solitude",
    setting:
      "Something has gone genuinely well — a result, a selection, something you worked for and got.",
    prompt: "What most often happens next:",
    options: [
      sh("sc-p6-a", "lover", "passive", "You barely register it. You are already onto what is wrong with the next thing."),
      sh("sc-p6-b", "lover", "active", "You go all in on it, and things that were also working start slipping."),
      sh("sc-p6-c", "magician", "passive", "You pick apart why it worked until it stops feeling like anything."),
      sh("sc-p6-d", "lover", "mature", "You let yourself have it, and tell the people who helped that it went well."),
    ],
  },
  {
    id: "sc-p7", kind: "pressure", core: false, context: "classroom",
    setting:
      "You put someone in your group in charge of a section. He has not done it, and it is your name the teacher associates with the project.",
    prompt: "What you do about it:",
    options: [
      sh("sc-p7-a", "king", "active", "Make sure the teacher knows exactly whose section it was."),
      sh("sc-p7-b", "king", "passive", "Absorb it and say nothing to him, because raising it feels heavy-handed."),
      sh("sc-p7-c", "warrior", "active", "Take it out of him, in proportion to how exposed it left you."),
      sh("sc-p7-d", "king", "mature", "Carry it publicly, and deal with it squarely with him afterwards."),
    ],
  },
  {
    id: "sc-p8", kind: "pressure", core: false, context: "authority",
    setting:
      "You are given a job you think is beneath you — stacking chairs, running a stall, looking after the year below on a trip — while people you rate get something better.",
    prompt: "What you actually do:",
    options: [
      sh("sc-p8-a", "king", "active", "Make it clear, one way or another, that this is not what you are for."),
      sh("sc-p8-b", "warrior", "passive", "Do it, badly and visibly resentfully, and let that be the message."),
      sh("sc-p8-c", "magician", "active", "Arrange for it to become someone else's, without ever actually refusing."),
      sh("sc-p8-d", "warrior", "mature", "Do it properly, and separately ask why you were picked for it."),
    ],
  },
  {
    id: "sc-p9", kind: "pressure", core: false, context: "friendship",
    setting:
      "A friendship that mattered to you has gone cold. Nothing happened that you can point to. He is just around less, and replies less, and you do not know why.",
    prompt: "What you actually do about it:",
    options: [
      sh("sc-p9-a", "lover", "passive", "Let it run its course. If he wanted to talk about it he would have."),
      sh("sc-p9-b", "lover", "active", "Overcorrect — too much contact, too intense, all at once."),
      sh("sc-p9-c", "magician", "passive", "Build a theory about what happened and act on the theory instead of asking."),
      sh("sc-p9-d", "lover", "mature", "Say directly that something feels off and you would like to know what it is."),
    ],
  },
  {
    id: "sc-p10", kind: "pressure", core: false, context: "conflict",
    setting:
      "You are losing an argument in front of a group of people, and about halfway through you start to suspect you are actually wrong.",
    prompt: "What you actually do:",
    options: [
      sh("sc-p10-a", "warrior", "active", "Go harder. Conceding in front of everyone is the worse outcome."),
      sh("sc-p10-b", "magician", "active", "Move the argument onto ground you can win on instead."),
      sh("sc-p10-c", "king", "passive", "Go quiet and let it fizzle out without ever actually conceding."),
      sh("sc-p10-d", "magician", "mature", "Say out loud that you think you are wrong, and follow it wherever it goes."),
    ],
  },
];

export const CORE_SCENARIOS = SCENARIOS.filter((s) => s.core);

export function scenariosForForm(form: "core" | "deep"): Scenario[] {
  return form === "core" ? CORE_SCENARIOS : SCENARIOS;
}
