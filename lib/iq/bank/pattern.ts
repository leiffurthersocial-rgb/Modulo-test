import type { Question } from "../types";

const c = (options: string[], correctIndex: number) =>
  ({ kind: "choice", options, correctIndex }) as const;
const seq = (...items: (string | number)[]) =>
  ({ kind: "text-sequence", items: items.map(String) }) as const;

export const patternTextQuestions: Question[] = [
  {
    id: "pat-001",
    category: "pattern",
    difficulty: 2,
    prompt: "Which letter continues the series?",
    stimulus: seq("A", "C", "E", "G", "?"),
    answer: c(["I", "H", "J", "K"], 0),
    explanation: "Every second letter of the alphabet.",
  },
  {
    id: "pat-002",
    category: "pattern",
    difficulty: 3,
    prompt: "Which letter continues the series?",
    stimulus: seq("Z", "X", "V", "T", "?"),
    answer: c(["R", "S", "Q", "P"], 0),
    explanation: "The alphabet backwards, skipping one letter each time.",
  },
  {
    id: "pat-003",
    category: "pattern",
    difficulty: 3,
    prompt: "Which item continues the series?",
    stimulus: seq("A1", "B4", "C9", "D16", "?"),
    answer: c(["E25", "E20", "F25", "E24"], 0),
    explanation:
      "Letters advance one step while the numbers are the perfect squares.",
  },
  {
    id: "pat-004",
    category: "pattern",
    difficulty: 4,
    prompt: "Which item continues the series?",
    stimulus: seq("AZ", "BY", "CX", "DW", "?"),
    answer: c(["EV", "EW", "FV", "DV"], 0),
    explanation:
      "The first letter moves forward through the alphabet while the second moves backward.",
  },
  {
    id: "pat-005",
    category: "pattern",
    difficulty: 4,
    prompt: "Which item continues the series?",
    stimulus: seq("2A", "4C", "8E", "16G", "?"),
    answer: c(["32I", "32H", "24I", "32J"], 0),
    explanation: "The number doubles while the letter skips one each step.",
  },
  {
    id: "pat-006",
    category: "pattern",
    difficulty: 3,
    prompt: "Which symbol comes next in the series?",
    stimulus: seq("○", "△", "○", "△", "△", "○", "△", "△", "△", "?"),
    answer: c(["○", "△", "○○", "△△"], 0),
    explanation:
      "A circle is followed by a growing run of triangles: 1, then 2, then 3. The next circle is due.",
  },
  {
    id: "pat-007",
    category: "pattern",
    difficulty: 5,
    prompt: "Which term continues the series?",
    stimulus: seq(1, 11, 21, 1211, 111221, "?"),
    answer: c(["312211", "1112221", "121121", "13112221"], 0),
    explanation:
      "Each term describes the one before it aloud: 111221 is 'three ones, two twos, one one' = 312211.",
  },
  {
    id: "pat-008",
    category: "pattern",
    difficulty: 5,
    prompt: "Which letter continues the series?",
    stimulus: seq("O", "T", "T", "F", "F", "S", "S", "?"),
    answer: c(["E", "N", "T", "O"], 0),
    explanation:
      "These are the first letters of One, Two, Three, Four, Five, Six, Seven — so Eight comes next.",
  },
  {
    id: "pat-009",
    category: "pattern",
    difficulty: 4,
    prompt: "Which letter continues the series?",
    stimulus: seq("B", "D", "G", "K", "?"),
    answer: c(["P", "N", "O", "Q"], 0),
    explanation:
      "The gaps grow: +2, +3, +4, then +5 — positions 2, 4, 7, 11, 16.",
  },
  {
    id: "pat-010",
    category: "pattern",
    difficulty: 4,
    prompt: "Which item continues the series?",
    stimulus: seq("CAT", "DBU", "ECV", "?"),
    answer: c(["FDW", "FEW", "EDW", "FDX"], 0),
    explanation: "Every letter advances one place in the alphabet each step.",
  },
  {
    id: "pat-011",
    category: "pattern",
    difficulty: 2,
    prompt: "Which item continues the series?",
    stimulus: seq("AB", "BC", "CD", "DE", "?"),
    answer: c(["EF", "EG", "DF", "FG"], 0),
    explanation: "Each pair steps one letter forward.",
  },
  {
    id: "pat-012",
    category: "pattern",
    difficulty: 3,
    prompt: "Which item is missing from the middle of the series?",
    stimulus: seq("J", "F", "M", "?", "M", "J", "J"),
    answer: c(["A", "S", "T", "D"], 0),
    explanation:
      "The first letters of the months: January, February, March, April, May, June, July.",
  },
];
