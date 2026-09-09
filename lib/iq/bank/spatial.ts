import type { Question } from "../types";

const c = (options: string[], correctIndex: number) =>
  ({ kind: "choice", options, correctIndex }) as const;
const n = (value: number, tolerance = 0) =>
  ({ kind: "numeric", value, tolerance }) as const;

export const spatialTextQuestions: Question[] = [
  {
    id: "spa-001",
    category: "spatial",
    difficulty: 3,
    prompt:
      "A wooden cube is painted on all six faces and then cut into 27 identical smaller cubes. How many of the small cubes have paint on exactly two faces?",
    answer: n(12),
    explanation:
      "The two-face cubes sit on the edges but not the corners — one per edge, and a cube has 12 edges.",
  },
  {
    id: "spa-002",
    category: "spatial",
    difficulty: 2,
    prompt:
      "A wooden cube is painted on all six faces and then cut into 27 identical smaller cubes. How many have paint on exactly three faces?",
    answer: n(8),
    explanation: "Only the eight corner cubes show three painted faces.",
  },
  {
    id: "spa-003",
    category: "spatial",
    difficulty: 3,
    prompt:
      "A wooden cube is painted on all six faces and then cut into 27 identical smaller cubes. How many have no paint at all?",
    answer: n(1),
    explanation: "Only the single cube at the very centre is unpainted.",
  },
  {
    id: "spa-004",
    category: "spatial",
    difficulty: 3,
    prompt:
      "You are facing north. You turn 90° to your right, then 180°, then 90° to your left. Which way are you facing?",
    answer: c(["South", "North", "East", "West"], 0),
    explanation: "North → east → west → south.",
  },
  {
    id: "spa-005",
    category: "spatial",
    difficulty: 1,
    prompt:
      "On a standard die, opposite faces add up to 7. If the top face shows 2, what number is on the bottom face?",
    answer: n(5),
    explanation: "7 − 2 = 5.",
  },
  {
    id: "spa-006",
    category: "spatial",
    difficulty: 4,
    prompt:
      "A square sheet of paper is folded exactly in half, then in half again. A single hole is punched through all the layers. How many holes are there when the paper is unfolded?",
    answer: n(4),
    explanation: "Two folds create four layers, so the punch makes four holes.",
  },
  {
    id: "spa-007",
    category: "spatial",
    difficulty: 3,
    prompt:
      "You walk 3 km north and then 4 km east. How many kilometres are you from your starting point in a straight line?",
    answer: n(5),
    explanation: "A 3–4–5 right triangle.",
  },
  {
    id: "spa-008",
    category: "spatial",
    difficulty: 2,
    prompt: "How many faces does a triangular prism have?",
    answer: n(5),
    explanation: "Two triangular ends plus three rectangular sides.",
  },
  {
    id: "spa-009",
    category: "spatial",
    difficulty: 5,
    prompt:
      "A 4 × 4 × 4 cube is painted on all six faces and cut into 64 unit cubes. How many unit cubes have paint on exactly one face?",
    answer: n(24),
    explanation:
      "Each face contributes a 2 × 2 block of single-painted cubes: 6 × 4 = 24.",
  },
  {
    id: "spa-010",
    category: "spatial",
    difficulty: 4,
    prompt:
      "You are facing south-west and turn 135° clockwise. Which direction are you now facing?",
    answer: c(["North", "East", "South", "West"], 0),
    explanation:
      "South-west is 225°; adding 135° gives 360°, which is due north.",
  },
  {
    id: "spa-011",
    category: "spatial",
    difficulty: 1,
    prompt: "How many edges does a cube have?",
    answer: n(12),
    explanation: "Four on the top, four on the bottom and four uprights.",
  },
  {
    id: "spa-012",
    category: "spatial",
    difficulty: 4,
    prompt:
      "A solid block measuring 2 × 3 × 4 unit cubes is assembled. How many of its 24 unit cubes touch the outside surface?",
    answer: n(24),
    explanation:
      "An interior cube would need a layer on every side, which a block only two units thick cannot provide — so every cube is on the surface.",
  },
  {
    id: "spa-013",
    category: "spatial",
    difficulty: 3,
    prompt:
      "A token starts on the top-left square of a 3 × 3 grid. It moves two squares right, one square down, then one square left. Which square does it end on?",
    answer: c(
      [
        "The centre square",
        "The top-right square",
        "The bottom-middle square",
        "The middle-right square",
      ],
      0,
    ),
    explanation:
      "Top-left → top-right → middle-right → centre.",
  },
  {
    id: "spa-014",
    category: "spatial",
    difficulty: 5,
    prompt:
      "A die rests with 1 on top and 2 on the face towards you. It is rolled one quarter turn away from you, so the face that was on top now points away. Which number is on top afterwards?",
    answer: n(2),
    explanation:
      "Rolling away moves each face one step around: the near face goes to the top, so the 2 ends up on top.",
  },
  {
    id: "spa-015",
    category: "spatial",
    difficulty: 2,
    prompt:
      "How many vertices (corners) does a square-based pyramid have?",
    answer: n(5),
    explanation: "Four corners on the base plus the apex.",
  },
];
