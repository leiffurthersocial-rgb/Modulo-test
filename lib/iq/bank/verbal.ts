import type { Question } from "../types";

const c = (options: string[], correctIndex: number) =>
  ({ kind: "choice", options, correctIndex }) as const;

/**
 * Verbal reasoning, without an English vocabulary test attached.
 *
 * The bank is taken by people who do not have English as a first language, so
 * an item whose answer turns on knowing what "perfunctory" or "recalcitrant"
 * means is not measuring reasoning at all — it is measuring exposure to
 * English, and it does so under a label that says otherwise. Items of that kind
 * have been removed rather than made easier.
 *
 * What remains tests *relationships between ideas*, using words a B1 learner
 * would know:
 *
 *   - analogies (A is to B as C is to ?)
 *   - relationship matching (which pair relates the same way as this pair?)
 *   - classification (which one does not belong, and why)
 *   - part/whole, member/group, tool/function, sign/cause
 *
 * Difficulty comes from how abstract the *relationship* is, not from how rare
 * the words are: "word : sentence :: note : melody" is hard because it asks you
 * to see the same structure in two different domains, and every word in it is
 * common. Anagrams and items built on English word-initials went for the same
 * reason — they cannot be solved without English.
 */

export const verbalQuestions: Question[] = [
  {
    id: "ver-001",
    category: "verbal",
    difficulty: 1,
    prompt: "Bird is to nest as bee is to:",
    answer: c(["Hive", "Honey", "Flower", "Wing"], 0),
    explanation: "Each pair links a creature to the structure it lives in.",
  },
  {
    id: "ver-002",
    category: "verbal",
    difficulty: 1,
    prompt: "Which word is the odd one out?",
    answer: c(["Oak", "Rose", "Tulip", "Daisy"], 0),
    explanation: "The other three are flowers; an oak is a tree.",
  },
  {
    id: "ver-003",
    category: "verbal",
    difficulty: 1,
    prompt: "Doctor is to hospital as teacher is to:",
    answer: c(["School", "Student", "Lesson", "Book"], 0),
    explanation: "Each pair links a worker to their workplace.",
  },
  {
    id: "ver-004",
    category: "verbal",
    difficulty: 1,
    prompt: "Puppy is to dog as kitten is to:",
    answer: c(["Cat", "Mouse", "Milk", "Fur"], 0),
    explanation: "Each pair links a young animal to the adult it becomes.",
  },
  {
    id: "ver-005",
    category: "verbal",
    difficulty: 1,
    prompt: "Which word is the odd one out?",
    answer: c(["Carrot", "Apple", "Banana", "Orange"], 0),
    explanation: "The other three are fruit; a carrot is a vegetable.",
  },
  {
    id: "ver-006",
    category: "verbal",
    difficulty: 2,
    prompt: "Eye is to see as ear is to:",
    answer: c(["Hear", "Sound", "Head", "Listen"], 0),
    explanation:
      "Each pair links an organ to what it does. 'Sound' is what the ear receives, not what it does.",
  },
  {
    id: "ver-007",
    category: "verbal",
    difficulty: 2,
    prompt: "Wheel is to car as wing is to:",
    answer: c(["Aeroplane", "Bird", "Sky", "Feather"], 0),
    explanation:
      "Each pair links a part to the machine it belongs to; a bird is not a machine.",
  },
  {
    id: "ver-008",
    category: "verbal",
    difficulty: 2,
    prompt: "Which word is the odd one out?",
    answer: c(["Nail", "Hammer", "Saw", "Screwdriver"], 0),
    explanation: "The other three are tools; a nail is what a tool acts on.",
  },
  {
    id: "ver-009",
    category: "verbal",
    difficulty: 2,
    prompt: "Fish is to water as bird is to:",
    answer: c(["Air", "Nest", "Tree", "Song"], 0),
    explanation: "Each pair links an animal to the medium it moves through.",
  },
  {
    id: "ver-010",
    category: "verbal",
    difficulty: 2,
    prompt: "Which word is the odd one out?",
    answer: c(["Flute", "Violin", "Cello", "Guitar"], 0),
    explanation: "The other three have strings; a flute is played with air.",
  },
  {
    id: "ver-011",
    category: "verbal",
    difficulty: 2,
    prompt: "Knife is to cut as pen is to:",
    answer: c(["Write", "Paper", "Ink", "Hand"], 0),
    explanation: "Each pair links a tool to the action it performs.",
  },
  {
    id: "ver-012",
    category: "verbal",
    difficulty: 2,
    prompt: "Which word is the odd one out?",
    answer: c(["Patient", "Doctor", "Nurse", "Dentist"], 0),
    explanation: "The other three work in medicine; the patient receives it.",
  },
  {
    id: "ver-013",
    category: "verbal",
    difficulty: 3,
    prompt: "Seed is to plant as egg is to:",
    answer: c(["Bird", "Nest", "Shell", "Breakfast"], 0),
    explanation: "Each pair links a starting form to what it grows into.",
  },
  {
    id: "ver-014",
    category: "verbal",
    difficulty: 3,
    prompt: "Book is to chapter as film is to:",
    answer: c(["Scene", "Actor", "Cinema", "Camera"], 0),
    explanation: "Each pair links a whole work to the sections it divides into.",
  },
  {
    id: "ver-015",
    category: "verbal",
    difficulty: 3,
    prompt: "Which word is the odd one out?",
    answer: c(["Granite", "Copper", "Iron", "Gold"], 0),
    explanation: "The other three are metals; granite is a rock.",
  },
  {
    id: "ver-016",
    category: "verbal",
    difficulty: 3,
    prompt: "Warm is to hot as cool is to:",
    answer: c(["Cold", "Water", "Wind", "Winter"], 0),
    explanation:
      "Each pair moves from a mild degree to an extreme one in the same direction.",
  },
  {
    id: "ver-017",
    category: "verbal",
    difficulty: 3,
    prompt: "Car is to road as train is to:",
    answer: c(["Track", "Station", "Ticket", "Driver"], 0),
    explanation: "Each pair links a vehicle to the surface it travels on.",
  },
  {
    id: "ver-018",
    category: "verbal",
    difficulty: 3,
    prompt: "Which word is the odd one out?",
    answer: c(["Second", "Metre", "Kilometre", "Mile"], 0),
    explanation: "The other three measure distance; a second measures time.",
  },
  {
    id: "ver-019",
    category: "verbal",
    difficulty: 3,
    prompt: "Drought is to water as hunger is to:",
    answer: c(["Food", "Stomach", "Poverty", "Farm"], 0),
    explanation: "Each pair names a lack and the thing that is lacking.",
  },
  {
    id: "ver-020",
    category: "verbal",
    difficulty: 3,
    prompt: "Soldier is to army as ship is to:",
    answer: c(["Fleet", "Sea", "Captain", "Harbour"], 0),
    explanation: "Each pair links a single member to the group it forms part of.",
  },
  {
    id: "ver-021",
    category: "verbal",
    difficulty: 4,
    prompt: "Which pair relates in the same way as 'clock : time'?",
    answer: c(
      ["Ruler : length", "Watch : wrist", "Calendar : holiday", "Bell : sound"],
      0,
    ),
    explanation:
      "A clock measures time and a ruler measures length. The others are not instrument-and-quantity pairs.",
  },
  {
    id: "ver-022",
    category: "verbal",
    difficulty: 4,
    prompt: "Smoke is to fire as a footprint is to:",
    answer: c(["A person", "Sand", "A shoe", "A path"], 0),
    explanation:
      "Each pair links a trace to the thing that produced it. A shoe makes the shape, but the footprint is evidence that someone walked there.",
  },
  {
    id: "ver-023",
    category: "verbal",
    difficulty: 4,
    prompt: "Which pair relates in the same way as 'seed : plant'?",
    answer: c(
      ["Egg : chicken", "Leaf : tree", "Root : soil", "Flower : garden"],
      0,
    ),
    explanation:
      "Both are 'early form becomes mature form'. The others are part-to-whole or thing-to-place.",
  },
  {
    id: "ver-024",
    category: "verbal",
    difficulty: 4,
    prompt: "Map is to land as menu is to:",
    answer: c(["Meals", "Restaurant", "Waiter", "Price"], 0),
    explanation:
      "Each is a representation of the thing it stands for, listed rather than experienced directly.",
  },
  {
    id: "ver-025",
    category: "verbal",
    difficulty: 4,
    prompt: "Which word does NOT belong with the others?",
    answer: c(["Promise", "Table", "Chair", "Bed"], 0),
    explanation:
      "The other three are objects you can touch; a promise is not a physical thing.",
  },
  {
    id: "ver-026",
    category: "verbal",
    difficulty: 4,
    prompt: "Practice is to performance as a draft is to:",
    answer: c(
      ["A finished piece of writing", "A pencil", "A mistake", "A teacher"],
      0,
    ),
    explanation:
      "Each pair links a rough preparatory version to the finished one it leads to.",
  },
  {
    id: "ver-027",
    category: "verbal",
    difficulty: 4,
    prompt: "Which pair relates in the same way as 'teacher : student'?",
    answer: c(
      ["Doctor : patient", "Doctor : nurse", "Parent : child", "Writer : book"],
      0,
    ),
    explanation:
      "Both are 'a professional and the person they serve'. Parent and child is a family relation, not a professional one, and doctor and nurse are colleagues.",
  },
  {
    id: "ver-028",
    category: "verbal",
    difficulty: 5,
    prompt: "Word is to sentence as note is to:",
    answer: c(["Melody", "Instrument", "Singer", "Paper"], 0),
    explanation:
      "In each pair the first is the smallest meaningful unit and the second is the structure built from those units.",
  },
  {
    id: "ver-029",
    category: "verbal",
    difficulty: 5,
    prompt: "Which pair relates in the same way as 'medicine : illness'?",
    answer: c(
      ["Repair : damage", "Doctor : hospital", "Food : hunger", "Rain : flood"],
      0,
    ),
    explanation:
      "Medicine and repair both undo a problem that has already happened. Food prevents hunger rather than reversing damage, and rain causes a flood rather than fixing one.",
  },
  {
    id: "ver-030",
    category: "verbal",
    difficulty: 5,
    prompt:
      "A key opens a lock. Which pair below has the same relationship, in the same order?",
    answer: c(
      ["Password : account", "Lock : door", "Door : house", "Key : pocket"],
      0,
    ),
    explanation:
      "A password gives access to an account exactly as a key gives access through a lock. The others reverse the order or name a container.",
  },
  {
    id: "ver-031",
    category: "verbal",
    difficulty: 5,
    prompt: "Which word is the odd one out?",
    answer: c(["Bravery", "Runner", "Painter", "Builder"], 0),
    explanation:
      "The other three name a person by what they do; bravery names a quality, not a person.",
  },
  {
    id: "ver-032",
    category: "verbal",
    difficulty: 5,
    prompt:
      "Every question in the exam had exactly one right answer. Rosa answered every question. Which must be true?",
    answer: c(
      [
        "Every question had a right answer available",
        "Rosa answered every question correctly",
        "Rosa got at least one question wrong",
        "The exam had more than one question",
      ],
      0,
    ),
    explanation:
      "Answering every question tells you nothing about being right, so neither of those options must be true. The first option is simply the opening sentence restated, which is what makes it the one that must hold.",
  },
  {
    id: "ver-033",
    category: "verbal",
    difficulty: 5,
    prompt: "Ice is to water as water is to:",
    answer: c(["Steam", "Rain", "Ocean", "Glass"], 0),
    explanation:
      "Each step moves the same substance one stage warmer: solid to liquid, then liquid to gas.",
  },
  {
    id: "ver-034",
    category: "verbal",
    difficulty: 5,
    prompt: "Which pair relates in the same way as 'day : week'?",
    answer: c(
      ["Page : chapter", "Hour : clock", "Month : season", "Letter : word"],
      0,
    ),
    explanation:
      "Seven days make a week and a fixed number of pages make a chapter — a unit and the larger unit it is counted into. A season contains months, but the count varies, and an hour is not a part of a clock.",
  },
];
