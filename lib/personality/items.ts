import type { PersonalityItem, Trait } from "./types";

const item = (
  id: string,
  trait: Trait,
  text: string,
  reverse = false,
): PersonalityItem => ({ id, trait, text, reverse });

/** Five statements per trait, with reverse-keyed items to blunt acquiescence bias. */
export const PERSONALITY_ITEMS: PersonalityItem[] = [
  item("p-lea-1", "leadership", "When a group has no clear direction, I am the one who sets it."),
  item("p-lea-2", "leadership", "People naturally look to me to make the final call."),
  item("p-lea-3", "leadership", "I would rather follow a plan someone else made than make one myself.", true),
  item("p-lea-4", "leadership", "I enjoy taking responsibility for outcomes that affect other people."),
  item("p-lea-5", "leadership", "I avoid roles where others depend on my decisions.", true),

  item("p-ind-1", "independence", "I make important decisions without needing anyone's approval."),
  item("p-ind-2", "independence", "I would rather work alone than as part of a team."),
  item("p-ind-3", "independence", "I feel uneasy when I have to rely only on my own judgement.", true),
  item("p-ind-4", "independence", "I would rather do something imperfectly my own way than perfectly someone else's."),
  item("p-ind-5", "independence", "I look for consensus before I commit to a course of action.", true),

  item("p-dis-1", "discipline", "I finish what I start, even once the initial excitement is gone."),
  item("p-dis-2", "discipline", "I keep to routines that I have set for myself."),
  item("p-dis-3", "discipline", "I often put things off until a deadline forces me.", true),
  item("p-dis-4", "discipline", "I plan my week rather than take it as it comes."),
  item("p-dis-5", "discipline", "My workspace and my schedule tend to be disorganised.", true),

  item("p-soc-1", "sociability", "I gain energy from being around other people."),
  item("p-soc-2", "sociability", "I start conversations with people I do not know."),
  item("p-soc-3", "sociability", "Long social events leave me drained.", true),
  item("p-soc-4", "sociability", "I keep in regular contact with a wide circle of people."),
  item("p-soc-5", "sociability", "I would rather spend a free evening alone than out with a group.", true),

  item("p-rsk-1", "riskTolerance", "I am comfortable deciding before I have all the information."),
  item("p-rsk-2", "riskTolerance", "I would leave a secure position for an uncertain but promising one."),
  item("p-rsk-3", "riskTolerance", "I avoid situations where the outcome is unpredictable.", true),
  item("p-rsk-4", "riskTolerance", "A calculated gamble appeals to me more than a guaranteed small gain."),
  item("p-rsk-5", "riskTolerance", "I check every possible downside before I act.", true),

  item("p-cur-1", "curiosity", "I read or research subjects that have nothing to do with my work."),
  item("p-cur-2", "curiosity", "I enjoy problems that have no obvious method of solution."),
  item("p-cur-3", "curiosity", "Once I understand something well enough to use it, I stop digging.", true),
  item("p-cur-4", "curiosity", "I actively seek out ideas that contradict what I already believe."),
  item("p-cur-5", "curiosity", "Abstract questions with no practical use bore me.", true),

  item("p-ass-1", "assertiveness", "I say what I think even when it is unwelcome."),
  item("p-ass-2", "assertiveness", "I push back directly when I am treated unfairly."),
  item("p-ass-3", "assertiveness", "I stay quiet to keep the peace.", true),
  item("p-ass-4", "assertiveness", "I ask for what I want without softening it."),
  item("p-ass-5", "assertiveness", "I find it hard to turn down a request.", true),

  item("p-emp-1", "empathy", "I notice quickly when someone's mood has changed."),
  item("p-emp-2", "empathy", "I adjust what I say based on how the other person is likely to feel."),
  item("p-emp-3", "empathy", "Other people's problems are largely their own to solve.", true),
  item("p-emp-4", "empathy", "I find it easy to see a disagreement from the other side."),
  item("p-emp-5", "empathy", "I have little patience for people who are upset over small things.", true),

  item("p-com-1", "competitiveness", "I keep track of how I am doing compared with others."),
  item("p-com-2", "competitiveness", "Losing bothers me long after the event."),
  item("p-com-3", "competitiveness", "I am satisfied as long as I did my best, wherever I placed.", true),
  item("p-com-4", "competitiveness", "I raise my effort when I know I am being measured against someone."),
  item("p-com-5", "competitiveness", "Competition brings out the worst in me rather than the best.", true),
];

export const ITEMS_PER_TRAIT = 5;
