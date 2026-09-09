import type { Question } from "../types";

const c = (options: string[], correctIndex: number) =>
  ({ kind: "choice", options, correctIndex }) as const;
const n = (value: number, tolerance = 0) =>
  ({ kind: "numeric", value, tolerance }) as const;
const seq = (...items: (string | number)[]) =>
  ({ kind: "text-sequence", items: items.map(String) }) as const;

export const numericalQuestions: Question[] = [
  {
    id: "num-001",
    category: "numerical",
    difficulty: 1,
    prompt: "Which number continues the series?",
    stimulus: seq(2, 4, 6, 8, "?"),
    answer: c(["10", "9", "12", "16"], 0),
    explanation: "The series increases by 2 each step.",
  },
  {
    id: "num-002",
    category: "numerical",
    difficulty: 1,
    prompt: "Which number continues the series?",
    stimulus: seq(3, 6, 12, 24, "?"),
    answer: c(["48", "36", "42", "50"], 0),
    explanation: "Each term doubles.",
  },
  {
    id: "num-003",
    category: "numerical",
    difficulty: 2,
    prompt: "Which number continues the series?",
    stimulus: seq(1, 4, 9, 16, "?"),
    answer: c(["25", "20", "24", "32"], 0),
    explanation: "These are the perfect squares 1², 2², 3², 4², 5².",
  },
  {
    id: "num-004",
    category: "numerical",
    difficulty: 2,
    prompt: "Which number continues the series?",
    stimulus: seq(2, 3, 5, 8, 12, "?"),
    answer: c(["17", "16", "18", "20"], 0),
    explanation: "The gaps grow by one: +1, +2, +3, +4, +5.",
  },
  {
    id: "num-005",
    category: "numerical",
    difficulty: 2,
    prompt: "Which number continues the series?",
    stimulus: seq(81, 27, 9, 3, "?"),
    answer: c(["1", "0", "2", "1.5"], 0),
    explanation: "Each term is divided by 3.",
  },
  {
    id: "num-006",
    category: "numerical",
    difficulty: 3,
    prompt: "Which number continues the series?",
    stimulus: seq(1, 1, 2, 3, 5, 8, "?"),
    answer: c(["13", "11", "12", "16"], 0),
    explanation: "Fibonacci: each term is the sum of the two before it.",
  },
  {
    id: "num-007",
    category: "numerical",
    difficulty: 3,
    prompt: "Which number continues the series?",
    stimulus: seq(2, 6, 12, 20, 30, "?"),
    answer: c(["42", "40", "36", "44"], 0),
    explanation: "The terms are n(n + 1): 1·2, 2·3, 3·4, 4·5, 5·6, 6·7.",
  },
  {
    id: "num-008",
    category: "numerical",
    difficulty: 2,
    prompt: "Which number continues the series?",
    stimulus: seq(7, 14, 28, 56, "?"),
    answer: c(["112", "84", "98", "108"], 0),
    explanation: "Each term doubles.",
  },
  {
    id: "num-009",
    category: "numerical",
    difficulty: 4,
    prompt: "Which number continues the series?",
    stimulus: seq(100, 96, 88, 72, "?"),
    answer: c(["40", "56", "48", "64"], 0),
    explanation: "The subtractions double: −4, −8, −16, −32.",
  },
  {
    id: "num-010",
    category: "numerical",
    difficulty: 4,
    prompt: "Which number continues the series?",
    stimulus: seq(3, 7, 16, 35, 74, "?"),
    answer: c(["153", "148", "160", "139"], 0),
    explanation: "Each term is double the previous plus a step that grows: ×2+1, ×2+2, ×2+3, ×2+4, then ×2+5.",
  },
  {
    id: "num-011",
    category: "numerical",
    difficulty: 4,
    prompt: "Which number continues the series?",
    stimulus: seq(1, 2, 6, 24, 120, "?"),
    answer: c(["720", "600", "480", "840"], 0),
    explanation: "Factorials: each term is multiplied by the next integer.",
  },
  {
    id: "num-012",
    category: "numerical",
    difficulty: 4,
    prompt: "Which number continues the series?",
    stimulus: seq(2, 5, 11, 23, 47, "?"),
    answer: c(["95", "94", "96", "93"], 0),
    explanation: "Each term is double the previous plus 1.",
  },
  {
    id: "num-013",
    category: "numerical",
    difficulty: 5,
    prompt: "Which number continues the series?",
    stimulus: seq(1, 3, 7, 15, 31, "?"),
    answer: c(["63", "62", "47", "64"], 0),
    explanation: "The terms are 2ⁿ − 1: 1, 3, 7, 15, 31, 63.",
  },
  {
    id: "num-014",
    category: "numerical",
    difficulty: 3,
    prompt: "Which number continues the series?",
    stimulus: seq(2, 3, 5, 7, 11, 13, "?"),
    answer: c(["17", "15", "16", "19"], 0),
    explanation: "Consecutive prime numbers.",
  },
  {
    id: "num-015",
    category: "numerical",
    difficulty: 4,
    prompt: "Which number continues the series?",
    stimulus: seq(6, 12, 21, 33, 48, "?"),
    answer: c(["66", "63", "69", "72"], 0),
    explanation: "The gaps grow by 3: +6, +9, +12, +15, +18.",
  },
  {
    id: "num-016",
    category: "numerical",
    difficulty: 2,
    prompt:
      "A jacket costs 80 and is reduced by 25% in a sale. What is the sale price?",
    answer: n(60),
    explanation: "25% of 80 is 20, so the price falls to 60.",
  },
  {
    id: "num-017",
    category: "numerical",
    difficulty: 3,
    prompt:
      "A price of 100 rises by 20% and then falls by 20%. What is the final price?",
    answer: n(96),
    explanation:
      "100 → 120 → 96. The fall is applied to the larger amount, so the round trip loses value.",
  },
  {
    id: "num-018",
    category: "numerical",
    difficulty: 3,
    prompt:
      "If 5 machines take 5 minutes to make 5 widgets, how many minutes do 100 machines take to make 100 widgets?",
    answer: n(5),
    explanation:
      "Each machine makes one widget in 5 minutes, and the machines work in parallel.",
  },
  {
    id: "num-019",
    category: "numerical",
    difficulty: 2,
    prompt:
      "Two numbers add up to 30 and differ by 8. What is the larger number?",
    answer: n(19),
    explanation: "(30 + 8) / 2 = 19.",
  },
  {
    id: "num-020",
    category: "numerical",
    difficulty: 4,
    prompt:
      "A car travels 120 km at 60 km/h, then 120 km at 40 km/h. What is its average speed in km/h for the whole journey?",
    answer: n(48),
    explanation:
      "The journey takes 2 + 3 = 5 hours for 240 km, giving 48 km/h — not the arithmetic mean of 50.",
  },
  {
    id: "num-021",
    category: "numerical",
    difficulty: 4,
    prompt:
      "A bat and a ball cost 1.10 in total. The bat costs 1.00 more than the ball. How many cents does the ball cost?",
    answer: n(5),
    explanation:
      "The ball is 0.05 and the bat 1.05 — a difference of exactly 1.00.",
  },
  {
    id: "num-022",
    category: "numerical",
    difficulty: 2,
    prompt: "What is 15% of 240?",
    answer: n(36),
    explanation: "10% is 24 and 5% is 12, so 15% is 36.",
  },
  {
    id: "num-023",
    category: "numerical",
    difficulty: 4,
    prompt:
      "Pipe A fills a tank in 6 hours and pipe B fills it in 3 hours. How many hours does it take with both pipes open?",
    answer: n(2),
    explanation: "Combined rate is 1/6 + 1/3 = 1/2 of the tank per hour.",
  },
  {
    id: "num-024",
    category: "numerical",
    difficulty: 3,
    prompt:
      "In a class of 40 students the ratio of boys to girls is 3:5. How many girls are there?",
    answer: n(25),
    explanation: "Eight parts of 5 students each; girls take 5 parts = 25.",
  },
  {
    id: "num-025",
    category: "numerical",
    difficulty: 5,
    prompt:
      "The average of five numbers is 12. One number is removed and the average of the remaining four is 13. What was the removed number?",
    answer: n(8),
    explanation: "The totals are 60 and 52, so the removed number is 8.",
  },
  {
    id: "num-026",
    category: "numerical",
    difficulty: 1,
    prompt: "If 3x + 7 = 25, what is x?",
    answer: n(6),
    explanation: "3x = 18, so x = 6.",
  },
  {
    id: "num-027",
    category: "numerical",
    difficulty: 4,
    prompt:
      "A shirt sells for 63 at a 10% loss on its cost price. What was the cost price?",
    answer: n(70),
    explanation: "63 is 90% of the cost, so the cost is 63 / 0.9 = 70.",
  },
  {
    id: "num-028",
    category: "numerical",
    difficulty: 4,
    prompt:
      "1000 is invested at 10% compound interest per year. What is it worth after two years?",
    answer: n(1210),
    explanation: "1000 → 1100 → 1210.",
  },
  {
    id: "num-029",
    category: "numerical",
    difficulty: 2,
    prompt: "Which of these values is the largest?",
    answer: c(["0.71", "0.7", "2/3", "68%"], 0),
    explanation: "0.71 > 0.70 > 0.68 > 0.667.",
  },
  {
    id: "num-030",
    category: "numerical",
    difficulty: 3,
    prompt:
      "A rectangle's length is twice its width and its perimeter is 36. What is its area?",
    answer: n(72),
    explanation: "Width 6, length 12, so the area is 72.",
  },
  {
    id: "num-031",
    category: "numerical",
    difficulty: 5,
    prompt:
      "How many integers from 1 to 100 inclusive are divisible by 3 or by 5?",
    answer: n(47),
    explanation:
      "33 are divisible by 3, 20 by 5 and 6 by both, so 33 + 20 − 6 = 47.",
  },
  {
    id: "num-032",
    category: "numerical",
    difficulty: 2,
    prompt:
      "A recipe for 4 people uses 300 g of flour. How many grams are needed for 7 people?",
    answer: n(525),
    explanation: "75 g per person × 7 = 525 g.",
  },
];
