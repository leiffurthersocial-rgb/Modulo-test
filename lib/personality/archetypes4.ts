import type { Trait } from "./types";

/**
 * King, Warrior, Magician, Lover.
 *
 * Robert Moore and Douglas Gillette's model of the mature masculine (1990),
 * built on Jungian archetype theory. Two things about it shape this whole
 * module:
 *
 * 1. It is NOT a personality typology. You are not "a Warrior" the way you
 *    might be an INTJ. Every man has all four energies; the questions are how
 *    much access he has to each, whether they are in balance, and whether he
 *    meets them in their mature form or their shadow. So this assessment
 *    reports access and balance across four, never a single type.
 *
 * 2. Each archetype has a *bipolar* shadow — an active, inflated pole and a
 *    passive, deflated one — and an immature "boy psychology" precursor it
 *    matures out of. Both are as much a part of the model as the mature form,
 *    and leaving them out would make it a horoscope.
 *
 * The shadow and precursor names below are Moore and Gillette's own terms. The
 * descriptions, sub-archetypes, scenarios and scoring are Modulo's.
 */

export type Archetype4 = "king" | "warrior" | "magician" | "lover";

export const ARCHETYPES_4: Archetype4[] = ["king", "warrior", "magician", "lover"];

export interface ShadowPoleDefinition {
  name: string;
  gloss: string;
  description: string;
  tell: string;
}

export interface Archetype4Definition {
  id: Archetype4;
  name: string;
  tagline: string;
  /** What this energy is oriented towards — the "what it desires" question. */
  desires: string;
  /** What it does in the psyche. */
  function: string;
  /** What it is defending against. */
  fear: string;
  description: string;
  /** When you have access to it. */
  gifts: string[];
  inWork: string;
  inRelationships: string;
  /** When it is absent. */
  whenMissing: string;
  shadow: { active: ShadowPoleDefinition; passive: ShadowPoleDefinition };
  /** The boy-psychology form it matures out of. */
  immature: { name: string; description: string; poles: string };
  /** How the nine traits load onto this energy. */
  vector: Record<Trait, number>;
  development: string[];
  /** Sub-archetype ids: three flavours of the same energy. */
  facets: string[];
  accent: string;
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

export const ARCHETYPE_4_DEFINITIONS: Record<Archetype4, Archetype4Definition> = {
  king: {
    id: "king",
    name: "The King",
    tagline: "Order, blessing, and responsibility for the whole.",
    desires:
      "A realm that works and people in it who flourish. The King wants order that serves life rather than order for its own sake — and, more than he usually admits, he wants to see the people under his care become more than they were.",
    function:
      "Ordering and blessing. The King decides what matters, holds the centre steady, and confers worth on others — the two functions Moore and Gillette treat as inseparable, because order without blessing is only administration.",
    fear: "That the whole thing rests on him, and that he is not equal to it.",
    description:
      "The King is the central energy; the other three serve it. Its mark is not command but responsibility — owning an outcome that depends on people you cannot control. A man in his King is calm when others are reacting, gives credit outward, and is not threatened by talent beneath him, because another man's rise is not a subtraction from his own standing.",
    gifts: [
      "Holds the centre when everyone else is reacting",
      "Sets direction other people can actually act on",
      "Blesses — names another man's worth out loud, and means it",
      "Takes responsibility for outcomes he did not personally cause",
    ],
    inWork:
      "He is the one the room settles around. He makes the call that has been drifting, then stands behind it in public whether or not it worked.",
    inRelationships:
      "He is steady and generative. People feel more capable around him rather than smaller, and he does not need the household to revolve around his mood.",
    whenMissing:
      "Things drift. Decisions go unmade, standards quietly slip, and everyone waits for someone else to take responsibility for the whole.",
    shadow: {
      active: {
        name: "The Tyrant",
        gloss: "order enforced for its own sake",
        description:
          "The Tyrant confuses being in charge with being right. He experiences another man's competence as a threat, treats disagreement as disloyalty, and cannot let a decision be made by anyone else. He does not bless; he diminishes, because anyone else's stature reads as a claim on his.",
        tell: "You have relitigated a decision recently that somebody else was entitled to make.",
      },
      passive: {
        name: "The Weakling",
        gloss: "authority present, declined",
        description:
          "The Weakling has the standing to make the call and leaves the vacuum open. He avoids the responsibility and then resents whoever fills it. Underneath is the same fragility as the Tyrant — a sense of not being centred enough to bear the weight — expressed as absence rather than as force.",
        tell: "You saw the decision that needed making, and waited for someone else to make it.",
      },
    },
    immature: {
      name: "The Divine Child",
      description:
        "The boyhood form of the King: the sense of being special, of the world arranging itself around you. Its energy is real and worth keeping — it is the source of vitality and possibility — but it has to mature into a King who serves the realm rather than expecting the realm to serve him.",
      poles: "The High Chair Tyrant and the Weakling Prince",
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
      "Bless someone out loud: name what another man did well, to his face, specifically, with nothing attached.",
      "Take responsibility once for an outcome you did not personally cause.",
      "Notice where you are guarding your standing against someone more able, and promote him instead.",
    ],
    facets: ["leader", "guardian", "strategist"],
    accent: "sand",
  },

  warrior: {
    id: "warrior",
    name: "The Warrior",
    tagline: "Will, boundaries, and service to something beyond yourself.",
    desires:
      "A cause worth the cost, and to find out what he is actually made of against it. The Warrior does not want comfort; he wants a mission that demands everything and a clean account of whether he met it.",
    function:
      "Aggressive energy in service. Clarity about the objective, discipline to reach it, decisiveness under pressure, and the endurance to keep going once it stops being interesting. Crucially, the Warrior serves something — energy with no cause behind it is not Warrior, it is violence.",
    fear: "That when it mattered, he did not act.",
    description:
      "The Warrior is the executing energy. Its mark is a clean relationship with difficulty — not the absence of fear but movement in spite of it. A man in his Warrior knows what he is in service of, holds boundaries without cruelty, and can be trusted to do the unglamorous eighty per cent after the decision has stopped feeling heroic.",
    gifts: [
      "Moves decisively when waiting has a real cost",
      "Holds a boundary without needing to re-justify it",
      "Finishes the part nobody is watching",
      "Trains: treats his own capability as something to be built, not discovered",
    ],
    inWork:
      "He is the one who says the difficult thing and then does the difficult thing. Deadlines mean something because his word is load-bearing.",
    inRelationships:
      "He is direct, and safe to be around precisely because his aggression is disciplined rather than absent. People know where they stand with him.",
    whenMissing:
      "Nothing gets finished and nothing gets defended. Small violations accumulate, commitments quietly become optional, and he calls it being easy-going.",
    shadow: {
      active: {
        name: "The Sadist",
        gloss: "force with no cause behind it",
        description:
          "Aggression detached from service. The Sadist treats every disagreement as a contest, mistakes damage for strength, and cannot tell a boundary from an attack. Cruelty starts to feel like rigour — and because he is often effective, nobody names it for a long time.",
        tell: "You have won an argument recently that you would have been better off losing.",
      },
      passive: {
        name: "The Masochist",
        gloss: "capacity present, never spent",
        description:
          "The Masochist absorbs. He mistakes conflict-avoidance for peacefulness, lets his boundaries be crossed repeatedly, and takes a private pride in how much he can take. The resentment does not disappear; it goes underground and comes out sideways.",
        tell: "There is a conversation you have been not-having for more than a month.",
      },
    },
    immature: {
      name: "The Hero",
      description:
        "The boyhood form of the Warrior: courage that is still about proving something. Necessary — it is how a boy first tests himself against the world — but it must eventually die into the Warrior, who fights for the mission rather than for the demonstration.",
      poles: "The Grandstander Bully and the Coward",
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
      "Keep one commitment exactly, at a cost, to re-establish that your word is load-bearing.",
      "Say no to something you would normally absorb.",
      "Name what you are actually in service of. Warrior energy without that is just aggression looking for a target.",
    ],
    facets: ["competitor", "maverick", "builder"],
    accent: "jade",
  },

  magician: {
    id: "magician",
    name: "The Magician",
    tagline: "Knowledge, insight, and seeing what is actually there.",
    desires:
      "To understand the mechanism — not to operate the thing but to know why it works. Underneath, the Magician wants to be the one who sees clearly when everyone else is inside the situation, and to be trusted with what he knows.",
    function:
      "Knowing, and initiating. The Magician holds specialised knowledge, reads the pattern others are too close to see, and uses it to transform a situation — including by initiating other men into what he has learned.",
    fear: "Being fooled. Discovering that he did not understand it after all.",
    description:
      "The Magician is the knowing energy: mastery deep enough to see mechanism rather than surface, plus the detachment to read a situation without being caught inside it. Its mark is the useful question nobody else thought to ask. A man in his Magician uses what he sees on other people's behalf, and says plainly what he knows rather than trading on it.",
    gifts: [
      "Sees the mechanism under the symptom",
      "Stays analytical while everyone else is reacting",
      "Turns hard-won understanding into something others can use",
      "Initiates: brings a younger man into knowledge he had to earn the hard way",
    ],
    inWork:
      "He is the one who reframes the problem so it becomes solvable, and who knows the system well enough to say what will actually happen.",
    inRelationships:
      "He notices the pattern nobody has named. At his best this is clarifying; the discipline is saying it plainly rather than holding it.",
    whenMissing:
      "He operates without understanding, is repeatedly surprised by consequences he could have foreseen, and mistakes activity for competence.",
    shadow: {
      active: {
        name: "The Manipulator",
        gloss: "insight used privately",
        description:
          "Knowledge withheld for advantage. The Manipulator knows more than he says, lets people proceed on incomplete pictures, and steers men who believe they are deciding freely. He is not lying, which is exactly how he keeps it acceptable to himself.",
        tell: "You have let someone proceed on an understanding you knew was incomplete.",
      },
      passive: {
        name: "The Denying “Innocent” One",
        gloss: "understanding, disowned",
        description:
          "He sees exactly what is going wrong, says nothing, and treats being right in private as a substitute for acting. He denies that he knows what he knows, because knowing would oblige him to do something — and then presents his non-involvement as innocence.",
        tell: "You watched something fail in a way you had predicted, and had not said so out loud.",
      },
    },
    immature: {
      name: "The Precocious Child",
      description:
        "The boyhood form of the Magician: cleverness as identity. Knowing things in order to be the one who knows them. It matures into the Magician when knowledge stops being a way to win and becomes something he is responsible for using well.",
      poles: "The Know-It-All Trickster and the Dummy",
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
      "Teach one thing you know well to someone who does not. Withheld knowledge rots.",
      "Go one level deeper on something you currently only operate.",
      "Find where you are enjoying an information advantage, and give it away.",
    ],
    facets: ["scholar", "craftsman", "explorer"],
    accent: "sand",
  },

  lover: {
    id: "lover",
    name: "The Lover",
    tagline: "Connection, feeling, and being genuinely in your life.",
    desires:
      "To be connected — to people, to work that means something, to the physical world. The Lover wants the boundary between himself and life to be thinner than it usually is, and he is the only one of the four who wants it for its own sake rather than for what it produces.",
    function:
      "Connectedness and vitality. The Lover feels, notices beauty, reads other people directly rather than by inference, and supplies the aliveness that keeps the other three from becoming machinery.",
    fear: "That he is going through the motions, and will reach the end having never quite been present.",
    description:
      "The Lover is the connecting energy: appetite for the world, attention to people as people, and the capacity to be affected. Its mark is the difference between a life executed competently and one actually inhabited. A man in his Lover feels things fully without being run by them, and lets other people matter to him at a real cost.",
    gifts: [
      "Notices the man, not the function he is performing",
      "Brings energy that makes other people want to be there",
      "Stays open to being moved, changed and delighted",
      "Keeps the other three honest — order, will and knowledge in service of what, exactly?",
    ],
    inWork:
      "He is the reason the work has any warmth in it. He can tell when a team has stopped caring, usually before the output shows it.",
    inRelationships:
      "He is present. Not merely reliable — actually there, and affected by the people he is with.",
    whenMissing:
      "Everything is managed and nothing is felt. He is competent, dependable and slightly absent, and cannot remember the last time something moved him.",
    shadow: {
      active: {
        name: "The Addicted Lover",
        gloss: "feeling with no structure under it",
        description:
          "Run by whatever is most vivid right now. He chases intensity, mistakes it for meaning, and leaves a trail of things begun in complete earnest. Because the feelings are genuine, it takes a long time to see the pattern as a pattern.",
        tell: "Your commitments track your enthusiasm rather than your judgement.",
      },
      passive: {
        name: "The Impotent Lover",
        gloss: "life at one remove",
        description:
          "Cut off from feeling and therefore from vitality. He manages relationships rather than having them, treats being moved as a category error, and describes the resulting flatness as being level-headed. Often reads as mild depression from the outside.",
        tell: "You cannot remember the last time something genuinely moved you.",
      },
    },
    immature: {
      name: "The Oedipal Child",
      description:
        "The boyhood form of the Lover: connection sought as fusion, warmth needed rather than offered. It matures into the Lover when he can be close to someone without needing them to complete him.",
      poles: "The Mama's Boy and the Dreamer",
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
      "Notice something for its own sake — music, a walk, a meal — without it being productive.",
      "Tell someone directly that they matter to you, without hedging it as a joke.",
      "Do something with your hands or your body that produces nothing.",
    ],
    facets: ["diplomat", "advocate", "catalyst"],
    accent: "jade",
  },
};

export const ARCHETYPE_4_LIST: Archetype4Definition[] = ARCHETYPES_4.map(
  (a) => ARCHETYPE_4_DEFINITIONS[a],
);

export function archetype4ForFacet(facetId: string): Archetype4 | null {
  for (const id of ARCHETYPES_4) {
    if (ARCHETYPE_4_DEFINITIONS[id].facets.includes(facetId)) return id;
  }
  return null;
}

export const FRAMEWORK_NOTE =
  "King, Warrior, Magician, Lover is Robert Moore and Douglas Gillette's model of the mature masculine (1990), built on Jungian archetype theory. It is not a personality typology: every man has all four energies, and the questions it asks are how much access you have to each, whether they are balanced, and whether you meet them in their mature form or their shadow — not which one you “are”. The shadow and boy-psychology names are Moore and Gillette's; the descriptions, sub-archetypes, scenarios and scoring here are Modulo's own. This is a structured self-assessment, not a validated psychological instrument.";

export const NOT_A_TYPE_NOTE =
  "You are not one of these four. You have all four, in different measure, and the useful reading is which you currently reach for, which you neglect, and which shadow you fall into when you are under pressure.";
