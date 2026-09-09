import type { Question } from "../types";

const c = (options: string[], correctIndex: number) =>
  ({ kind: "choice", options, correctIndex }) as const;
const n = (value: number, tolerance = 0) =>
  ({ kind: "numeric", value, tolerance }) as const;

export const logicalQuestions: Question[] = [
  {
    id: "log-001",
    category: "logical",
    difficulty: 1,
    prompt:
      "All Modulo engineers write code. Priya is a Modulo engineer. Which statement must be true?",
    answer: c(
      [
        "Priya writes code",
        "Everyone who writes code is a Modulo engineer",
        "Priya writes nothing except code",
        "Some Modulo engineers do not write code",
      ],
      0,
    ),
    explanation:
      "A universal rule applied to a member of the set. The converse and the exclusivity claims do not follow.",
  },
  {
    id: "log-002",
    category: "logical",
    difficulty: 2,
    prompt:
      "If it rains, the match is cancelled. The match was not cancelled. What follows?",
    answer: c(
      [
        "It did not rain",
        "It rained",
        "The match was postponed instead",
        "Nothing at all follows",
      ],
      0,
    ),
    explanation:
      "Modus tollens: if P implies Q and Q is false, then P is false.",
  },
  {
    id: "log-003",
    category: "logical",
    difficulty: 2,
    prompt: "No reptiles are mammals. All snakes are reptiles. Therefore:",
    answer: c(
      [
        "No snakes are mammals",
        "Some snakes are mammals",
        "All reptiles are snakes",
        "Some mammals are reptiles",
      ],
      0,
    ),
    explanation:
      "Snakes sit inside the reptile set, which is disjoint from mammals.",
  },
  {
    id: "log-004",
    category: "logical",
    difficulty: 3,
    prompt: "Some artists are welders. All welders are certified. Therefore:",
    answer: c(
      [
        "Some artists are certified",
        "All artists are certified",
        "No artists are certified",
        "All certified people are artists",
      ],
      0,
    ),
    explanation:
      "The artists who are welders inherit certification, so at least some artists are certified.",
  },
  {
    id: "log-005",
    category: "logical",
    difficulty: 2,
    prompt:
      "Ana finished ahead of Ben. Carl finished behind Ben but ahead of Dia. Who finished last?",
    answer: c(["Dia", "Carl", "Ben", "Ana"], 0),
    explanation: "The order is Ana, Ben, Carl, Dia.",
  },
  {
    id: "log-006",
    category: "logical",
    difficulty: 3,
    prompt:
      "Box A is heavier than box B. Box C is lighter than box B. Box D is heavier than box A. Which box is heaviest?",
    answer: c(["D", "A", "B", "C"], 0),
    explanation: "D > A > B > C.",
  },
  {
    id: "log-007",
    category: "logical",
    difficulty: 4,
    prompt:
      "If the server is patched, the alert clears. The alert has not cleared. If the alert has not cleared, the on-call engineer is paged. Which must be true?",
    answer: c(
      [
        "The server is not patched and the on-call engineer is paged",
        "The server is patched but the alert is delayed",
        "The on-call engineer is not paged",
        "The server is patched and the engineer is paged",
      ],
      0,
    ),
    explanation:
      "Modus tollens gives 'not patched'; modus ponens on the second rule gives 'paged'.",
  },
  {
    id: "log-008",
    category: "logical",
    difficulty: 2,
    prompt:
      "Only members may enter the archive. Dana entered the archive. What follows?",
    answer: c(
      [
        "Dana is a member",
        "Dana is not a member",
        "All members enter the archive",
        "It cannot be determined",
      ],
      0,
    ),
    explanation:
      "'Only members may enter' means entering implies membership.",
  },
  {
    id: "log-009",
    category: "logical",
    difficulty: 5,
    prompt:
      "On an island every resident either always lies or always tells the truth. Resident X says of himself and resident Y: 'We are both liars.' What is the case?",
    answer: c(
      [
        "X is a liar and Y is truthful",
        "X is truthful and Y is a liar",
        "Both are liars",
        "Both are truthful",
      ],
      0,
    ),
    explanation:
      "If X were truthful his statement would make him a liar, so X lies. The statement is therefore false, and since X is a liar, Y must not be — Y is truthful.",
  },
  {
    id: "log-010",
    category: "logical",
    difficulty: 3,
    prompt:
      "Every code that opens the vault contains a 7. The code 4192 does not contain a 7. Which must be true?",
    answer: c(
      [
        "4192 does not open the vault",
        "4192 opens the vault",
        "Every code containing a 7 opens the vault",
        "The vault has no working code",
      ],
      0,
    ),
    explanation:
      "Contrapositive of 'opens the vault implies contains a 7'.",
  },
  {
    id: "log-011",
    category: "logical",
    difficulty: 3,
    prompt:
      "In a group of 30 people, 18 play chess, 15 play go and 8 play both. How many play neither?",
    answer: n(5),
    explanation:
      "Inclusion–exclusion: 18 + 15 − 8 = 25 play at least one, so 30 − 25 = 5 play neither.",
  },
  {
    id: "log-012",
    category: "logical",
    difficulty: 4,
    prompt:
      "Five friends sit in a row. Gus sits at the far left and Finn at the far right. Ema is not at either end, and Finn sits immediately to the right of Ema. Hana sits immediately to the left of Ema. Where does Ivan sit?",
    answer: c(
      [
        "Second from the left",
        "In the middle",
        "Second from the right",
        "At the far right",
      ],
      0,
    ),
    explanation:
      "Finn is seat 5, so Ema is seat 4 and Hana seat 3. Gus is seat 1, leaving seat 2 for Ivan.",
  },
  {
    id: "log-013",
    category: "logical",
    difficulty: 5,
    prompt:
      "Three face-down cards sit in a row and exactly one is an ace. Card 1 reads 'The ace is not here.' Card 2 reads 'The ace is here.' Card 3 reads 'Card 2 is lying.' Exactly one of the three statements is true. Where is the ace?",
    answer: c(["Card 1", "Card 2", "Card 3", "It cannot be determined"], 0),
    explanation:
      "If the ace is on card 1, only card 3's statement is true. Both other placements make two statements true.",
  },
  {
    id: "log-014",
    category: "logical",
    difficulty: 4,
    prompt: "Some P are Q, and all Q are R. Which statement must be FALSE?",
    answer: c(
      ["No P are R", "Some P are R", "Some R are P", "Some R are Q"],
      0,
    ),
    explanation:
      "The P that are Q must also be R, so 'some P are R' is guaranteed and 'no P are R' is impossible.",
  },
  {
    id: "log-015",
    category: "logical",
    difficulty: 2,
    prompt: "All bicycles have wheels. Some vehicles are bicycles. Therefore:",
    answer: c(
      [
        "Some vehicles have wheels",
        "All vehicles have wheels",
        "All wheeled things are bicycles",
        "No vehicles have wheels",
      ],
      0,
    ),
    explanation: "The vehicles that are bicycles inherit having wheels.",
  },
  {
    id: "log-016",
    category: "logical",
    difficulty: 5,
    prompt:
      "Each card has a letter on one side and a number on the other. The rule is: if a card has a vowel on one side, it has an even number on the other. Four cards show A, K, 4 and 7. Which cards must you turn over to test the rule?",
    answer: c(["A and 7", "A and 4", "A only", "A, 4 and 7"], 0),
    explanation:
      "You must check the vowel (A) and the odd number (7). A vowel behind 4 would not break the rule, so 4 is uninformative.",
  },
  {
    id: "log-017",
    category: "logical",
    difficulty: 3,
    prompt:
      "The train leaves only if both the doors are closed and the signal is green. The train did not leave. Which must be true?",
    answer: c(
      [
        "The doors were open or the signal was not green",
        "The doors were open",
        "The signal was not green",
        "Both the doors were open and the signal was red",
      ],
      0,
    ),
    explanation:
      "Negating a conjunction gives a disjunction: at least one condition failed.",
  },
  {
    id: "log-018",
    category: "logical",
    difficulty: 4,
    prompt:
      "In a tournament every player plays every other player exactly once. There were 45 games in total. How many players took part?",
    answer: n(10),
    explanation: "n(n − 1)/2 = 45 gives n = 10.",
  },
  {
    id: "log-019",
    category: "logical",
    difficulty: 1,
    prompt:
      "Anil is older than Bo. Bo is older than Cal. Cal is older than Dee. Which must be true?",
    answer: c(
      [
        "Anil is older than Dee",
        "Dee is older than Bo",
        "Cal is the oldest",
        "Bo and Cal are the same age",
      ],
      0,
    ),
    explanation: "Age comparison is transitive.",
  },
  {
    id: "log-020",
    category: "logical",
    difficulty: 3,
    prompt:
      "Of 40 students, 25 study French and 20 study German. Every student studies at least one of the two. How many study both?",
    answer: n(5),
    explanation: "25 + 20 − 40 = 5 students are counted twice.",
  },
  {
    id: "log-021",
    category: "logical",
    difficulty: 4,
    prompt:
      "All engineers on the team know Rust. Mia is on the team and does not know Rust. What follows?",
    answer: c(
      [
        "Mia is not an engineer",
        "Mia is an engineer who is exempt",
        "The team has no engineers",
        "Everyone who knows Rust is on the team",
      ],
      0,
    ),
    explanation:
      "Contrapositive: not knowing Rust rules out being an engineer on the team.",
  },
  {
    id: "log-022",
    category: "logical",
    difficulty: 5,
    prompt:
      "Four people must cross a bridge at night with a single torch. At most two cross at a time and the torch must travel with every crossing. Alone they take 1, 2, 5 and 10 minutes; a pair moves at the slower person's pace. What is the minimum total time in minutes?",
    answer: n(17),
    explanation:
      "1+2 cross (2), 1 returns (1), 5+10 cross (10), 2 returns (2), 1+2 cross (2) — 17 minutes total.",
  },
  {
    id: "log-023",
    category: "logical",
    difficulty: 2,
    prompt: "If today is three days after Tuesday, what day is tomorrow?",
    answer: c(["Saturday", "Friday", "Thursday", "Sunday"], 0),
    explanation: "Three days after Tuesday is Friday, so tomorrow is Saturday.",
  },
  {
    id: "log-024",
    category: "logical",
    difficulty: 3,
    prompt:
      "All keys in the drawer open the front door. This key opens the front door. What follows about this key?",
    answer: c(
      [
        "It cannot be determined whether it is in the drawer",
        "It is in the drawer",
        "It is not in the drawer",
        "Every key opens the front door",
      ],
      0,
    ),
    explanation:
      "Affirming the consequent is invalid — other keys outside the drawer may also work.",
  },
  {
    id: "log-025",
    category: "logical",
    difficulty: 3,
    prompt:
      "Three friends each ordered a different drink: tea, coffee or juice. Nia did not order juice. Omar ordered neither tea nor juice. What did Nia order?",
    answer: c(["Tea", "Coffee", "Juice", "It cannot be determined"], 0),
    explanation:
      "Omar must have coffee, so Nia — who cannot have juice — has tea.",
  },
  {
    id: "log-026",
    category: "logical",
    difficulty: 5,
    prompt:
      "You have nine coins; one is slightly heavier than the rest, which are identical. Using only a balance scale, what is the minimum number of weighings that guarantees finding it?",
    answer: n(2),
    explanation:
      "Split into three groups of three: one weighing finds the heavy group, a second finds the coin.",
  },
  {
    id: "log-027",
    category: "logical",
    difficulty: 3,
    prompt: "No X are Y. Some Z are X. Therefore:",
    answer: c(
      ["Some Z are not Y", "All Z are Y", "No Z are X", "Some Y are Z"],
      0,
    ),
    explanation:
      "The Z that are X cannot be Y, so at least some Z fall outside Y.",
  },
  {
    id: "log-028",
    category: "logical",
    difficulty: 4,
    prompt:
      "The alarm sounds if and only if the door is opened without entering the code. The door was opened and the alarm did not sound. What follows?",
    answer: c(
      [
        "The code was entered",
        "The code was not entered",
        "The alarm is broken",
        "The door was locked",
      ],
      0,
    ),
    explanation:
      "A biconditional runs both ways: no alarm on an opened door means the code was entered.",
  },
];
