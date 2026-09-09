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
  {
    id: "log-029",
    category: "logical",
    difficulty: 2,
    prompt: "Every member of the choir can read music. Jo cannot read music. Therefore:",
    answer: c(["Jo is not in the choir", "Jo is in the choir", "Only choir members read music", "Jo will learn to read music"], 0),
    explanation: "Contrapositive of 'member implies reads music'.",
  },
  {
    id: "log-030",
    category: "logical",
    difficulty: 3,
    prompt: "If the bridge is open then the ferry does not run. The ferry is running. Therefore:",
    answer: c(["The bridge is not open", "The bridge is open", "The ferry is late", "Nothing follows"], 0),
    explanation: "The ferry running contradicts the consequence of an open bridge.",
  },
  {
    id: "log-031",
    category: "logical",
    difficulty: 4,
    prompt: "Either the alarm was off or the window was locked, possibly both. The window was not locked. Therefore:",
    answer: c(["The alarm was off", "The alarm was on", "The window was open", "It cannot be determined"], 0),
    explanation: "Disjunctive syllogism: with one branch ruled out, the other must hold.",
  },
  {
    id: "log-032",
    category: "logical",
    difficulty: 4,
    prompt: "All P are Q. Some Q are R. Which statement must be true?",
    answer: c(["Some R are Q", "Some P are R", "No P are R", "All R are Q"], 0),
    explanation: "'Some Q are R' converts to 'some R are Q'. Nothing follows about P and R.",
  },
  {
    id: "log-033",
    category: "logical",
    difficulty: 4,
    prompt: "Five runners finish a race. B finishes before C, C finishes before E, E finishes before D, and A finishes last. Who finishes first?",
    answer: c(["B", "C", "E", "D"], 0),
    explanation: "The order is B, C, E, D, A.",
  },
  {
    id: "log-034",
    category: "logical",
    difficulty: 5,
    prompt: "On an island each resident always lies or always tells the truth. A says 'B is a liar.' B says 'A and I are of different types.' What is the case?",
    answer: c(["A lies and B tells the truth", "A tells the truth and B lies", "Both lie", "Both tell the truth"], 0),
    explanation: "If A were truthful, B would be a liar, making B's claim of difference false — but they would in fact differ. So A lies, which makes B truthful, and B's claim then holds.",
  },
  {
    id: "log-035",
    category: "logical",
    difficulty: 3,
    prompt: "Customers receive a discount only if they hold a card and spend over 50. Mia received a discount. Which must be true?",
    answer: c(["Mia holds a card and spent over 50", "Mia holds a card", "Mia spent over 50", "Mia is a regular customer"], 0),
    explanation: "'Only if' makes both conditions necessary, so both must hold.",
  },
  {
    id: "log-036",
    category: "logical",
    difficulty: 3,
    prompt: "Six people meet and each shakes hands with every other person exactly once. How many handshakes take place?",
    answer: n(15),
    explanation: "6 × 5 / 2 = 15.",
  },
  {
    id: "log-037",
    category: "logical",
    difficulty: 3,
    prompt: "No cats are dogs. All tabbies are cats. Which statement must be FALSE?",
    answer: c(["Some tabbies are dogs", "Some cats are tabbies", "No tabbies are dogs", "Some dogs are not cats"], 0),
    explanation: "Tabbies fall inside cats, which is disjoint from dogs.",
  },
  {
    id: "log-038",
    category: "logical",
    difficulty: 5,
    prompt: "Three boxes are labelled Apples, Oranges and Mixed. Every label is known to be wrong. You may draw a single fruit from one box without looking. Which box should you draw from to work out all three contents?",
    answer: c(["The box labelled Mixed", "The box labelled Apples", "The box labelled Oranges", "Any box will do"], 0),
    explanation: "The Mixed label must be wrong, so that box is pure. One fruit identifies it, and the remaining two follow because their labels are wrong too.",
  },
  {
    id: "log-039",
    category: "logical",
    difficulty: 2,
    prompt: "All swans on the lake are white. There is a black swan on the river. Which must be true?",
    answer: c(["The black swan is not on the lake", "There are no black swans", "The lake has no swans", "Some lake swans are black"], 0),
    explanation: "A black swan cannot be among a group that is entirely white.",
  },
  {
    id: "log-040",
    category: "logical",
    difficulty: 3,
    prompt: "In a queue, Raj is 7th from the front and 12th from the back. How many people are in the queue?",
    answer: n(18),
    explanation: "7 + 12 − 1 = 18, subtracting one because Raj is counted twice.",
  },
  {
    id: "log-041",
    category: "logical",
    difficulty: 3,
    prompt: "A implies B. B implies C. C is false. Therefore:",
    answer: c(["Both A and B are false", "A is true", "B is true", "Only A is false"], 0),
    explanation: "C false forces B false, which in turn forces A false.",
  },
  {
    id: "log-042",
    category: "logical",
    difficulty: 4,
    prompt: "Each card has a colour on one side and a shape on the other. The rule is: every red card has a circle on the other side. Four cards show red, blue, circle and square. Which cards must you turn over?",
    answer: c(["Red and square", "Red and circle", "Red only", "All four"], 0),
    explanation: "Check the red card, and the square — a red back on the square would break the rule. A blue back on the circle would not.",
  },
  {
    id: "log-043",
    category: "logical",
    difficulty: 5,
    prompt: "Two ropes each burn through in exactly 60 minutes, but unevenly along their length. Using only these ropes and a lighter, what is the longest interval below one hour, other than 30 minutes, that you can time exactly, in minutes?",
    answer: n(45),
    explanation: "Light rope one at both ends and rope two at one end. When rope one is gone, 30 minutes have passed; light rope two's second end, and its remaining 30 minutes of rope burns in 15.",
  },
  {
    id: "log-044",
    category: "logical",
    difficulty: 3,
    prompt: "Some students passed. Everyone who passed had studied. Therefore:",
    answer: c(["Some students studied", "All students studied", "Everyone who studied passed", "No students failed"], 0),
    explanation: "The students who passed must have studied.",
  },
  {
    id: "log-045",
    category: "logical",
    difficulty: 1,
    prompt: "Nobody in the room is over forty. Sam is forty-five. Therefore:",
    answer: c(["Sam is not in the room", "Sam is in the room", "The room is empty", "Sam is lying about his age"], 0),
    explanation: "Sam fails the property shared by everyone in the room.",
  },
  {
    id: "log-046",
    category: "logical",
    difficulty: 4,
    prompt: "Three houses stand in a row, painted red, blue and green in some order. The red house is not next to the green house. The blue house is not first, and the green house is not first. Which house is first?",
    answer: c(["The red house", "The blue house", "The green house", "It cannot be determined"], 0),
    explanation: "Red and green must occupy the two ends to avoid being adjacent, so blue is in the middle. Green cannot be first, so red is.",
  },
  {
    id: "log-047",
    category: "logical",
    difficulty: 5,
    prompt: "Club rule: any member who nominates someone must themselves have been nominated by a third member. Ana nominated Ben, and nobody nominated Ana. Therefore:",
    answer: c(["Ana is not a member", "Ben is not a member", "The nomination was invalid but Ana is a member", "Ana nominated herself"], 0),
    explanation: "The rule applies to members. Ana nominated without being nominated, so she falls outside it.",
  },
  {
    id: "log-048",
    category: "logical",
    difficulty: 3,
    prompt: "A drawer in a dark room holds 6 black socks and 6 white socks. How many socks must you take out to be certain of having a matching pair?",
    answer: n(3),
    explanation: "Two socks may differ, but a third must match one of them.",
  },
  {
    id: "log-049",
    category: "logical",
    difficulty: 4,
    prompt: "The same drawer holds 6 black socks and 6 white socks. How many must you take out to be certain of having a matching pair of BLACK socks?",
    answer: n(8),
    explanation: "The worst case draws all 6 white socks first, then two black ones.",
  },
  {
    id: "log-050",
    category: "logical",
    difficulty: 4,
    prompt: "It is not the case that both P and Q are true. P is true. What follows?",
    answer: c(["Q is false", "Q is true", "P is false", "Nothing follows"], 0),
    explanation: "If the conjunction fails and P holds, the failure must come from Q.",
  },
];
