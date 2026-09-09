import { createRng, shuffle, type Rng } from "@/lib/rng";
import type { Difficulty, FillStyle, Glyph, Question, ShapeName } from "../types";

/**
 * Visual items are generated from explicit rules rather than hand-drawn, so
 * every item has a provably unique answer. Generation is seeded and therefore
 * deterministic: a given question id always renders the same figure, on the
 * server and in the browser alike.
 */

const glyphKey = (g: Glyph) =>
  `${g.shape}|${g.fill}|${((g.rotation % 360) + 360) % 360}|${g.count}`;

/** Shapes with no rotational symmetry, safe to use in rotation puzzles. */
const ASYMMETRIC: ShapeName[] = ["arrow", "chevron"];
const ANY_SHAPE: ShapeName[] = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "hexagon",
  "star",
  "cross",
];
const FILLS: FillStyle[] = ["solid", "outline", "half", "dotted"];

function uniqueOptions(correct: Glyph, candidates: Glyph[], rng: Rng) {
  const seen = new Set([glyphKey(correct)]);
  const distractors: Glyph[] = [];
  for (const candidate of candidates) {
    const key = glyphKey(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    distractors.push(candidate);
    if (distractors.length === 3) break;
  }
  const options = shuffle([correct, ...distractors], rng);
  return { options, correctIndex: options.findIndex((o) => glyphKey(o) === glyphKey(correct)) };
}

function rotationMatrix(index: number, rng: Rng): Question {
  const shape = ASYMMETRIC[Math.floor(rng() * ASYMMETRIC.length)] as ShapeName;
  const fill = FILLS[Math.floor(rng() * FILLS.length)] as FillStyle;
  const colStep = ([45, 90, 135] as const)[Math.floor(rng() * 3)] as number;
  const rowStep = ([90, 180] as const)[Math.floor(rng() * 2)] as number;
  const base = Math.floor(rng() * 8) * 45;

  const cells: (Glyph | null)[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const rotation = (base + col * colStep + row * rowStep) % 360;
      cells.push(row === 2 && col === 2 ? null : { shape, fill, rotation, count: 1 });
    }
  }

  const answerRotation = (base + 2 * colStep + 2 * rowStep) % 360;
  const correct: Glyph = { shape, fill, rotation: answerRotation, count: 1 };
  const { options, correctIndex } = uniqueOptions(
    correct,
    [
      { shape, fill, rotation: (answerRotation + colStep) % 360, count: 1 },
      { shape, fill, rotation: (answerRotation - colStep + 360) % 360, count: 1 },
      { shape, fill, rotation: (answerRotation + 180) % 360, count: 1 },
      { shape, fill: FILLS[(FILLS.indexOf(fill) + 1) % FILLS.length] as FillStyle, rotation: answerRotation, count: 1 },
      { shape, fill, rotation: (answerRotation + 90) % 360, count: 1 },
    ],
    rng,
  );

  return {
    id: `vis-rot-${String(index).padStart(3, "0")}`,
    category: "pattern",
    difficulty: (colStep === 90 ? 2 : colStep === 45 ? 4 : 5) as Difficulty,
    prompt: "Which figure completes the grid?",
    stimulus: { kind: "glyph-matrix", cells },
    answer: { kind: "glyph-choice", options, correctIndex },
    explanation: `The figure turns ${colStep}° clockwise across each row and ${rowStep}° clockwise down each column.`,
  };
}

function countMatrix(index: number, rng: Rng): Question {
  const shape = ANY_SHAPE[Math.floor(rng() * ANY_SHAPE.length)] as ShapeName;
  const rowFills = shuffle(FILLS, rng).slice(0, 3) as FillStyle[];

  const cells: (Glyph | null)[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const glyph: Glyph = {
        shape,
        fill: rowFills[row] as FillStyle,
        rotation: 0,
        count: col + 1,
      };
      cells.push(row === 2 && col === 2 ? null : glyph);
    }
  }

  const correct: Glyph = { shape, fill: rowFills[2] as FillStyle, rotation: 0, count: 3 };
  const { options, correctIndex } = uniqueOptions(
    correct,
    [
      { shape, fill: rowFills[2] as FillStyle, rotation: 0, count: 2 },
      { shape, fill: rowFills[0] as FillStyle, rotation: 0, count: 3 },
      { shape, fill: rowFills[1] as FillStyle, rotation: 0, count: 3 },
      { shape, fill: rowFills[2] as FillStyle, rotation: 0, count: 4 },
    ],
    rng,
  );

  const plainShape = shape === "circle" || shape === "square" || shape === "triangle";

  return {
    id: `vis-cnt-${String(index).padStart(3, "0")}`,
    category: "pattern",
    difficulty: (plainShape ? 1 : 2) as Difficulty,
    prompt: "Which figure completes the grid?",
    stimulus: { kind: "glyph-matrix", cells },
    answer: { kind: "glyph-choice", options, correctIndex },
    explanation:
      "The count of shapes increases from one to three across each row, while the fill style stays constant down each row.",
  };
}

function fillMatrix(index: number, rng: Rng): Question {
  const shapes = shuffle(ANY_SHAPE, rng).slice(0, 3) as ShapeName[];
  const fills = shuffle(FILLS, rng).slice(0, 3) as FillStyle[];

  const cells: (Glyph | null)[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const glyph: Glyph = {
        shape: shapes[row] as ShapeName,
        fill: fills[(col + row) % 3] as FillStyle,
        rotation: 0,
        count: 1,
      };
      cells.push(row === 2 && col === 2 ? null : glyph);
    }
  }

  const correctFill = fills[(2 + 2) % 3] as FillStyle;
  const correct: Glyph = { shape: shapes[2] as ShapeName, fill: correctFill, rotation: 0, count: 1 };
  const { options, correctIndex } = uniqueOptions(
    correct,
    [
      { shape: shapes[2] as ShapeName, fill: fills[0] as FillStyle, rotation: 0, count: 1 },
      { shape: shapes[2] as ShapeName, fill: fills[1] as FillStyle, rotation: 0, count: 1 },
      { shape: shapes[0] as ShapeName, fill: correctFill, rotation: 0, count: 1 },
      { shape: shapes[1] as ShapeName, fill: correctFill, rotation: 0, count: 1 },
      { shape: shapes[2] as ShapeName, fill: correctFill, rotation: 0, count: 2 },
    ],
    rng,
  );

  return {
    id: `vis-fil-${String(index).padStart(3, "0")}`,
    category: "pattern",
    difficulty: 3,
    prompt: "Which figure completes the grid?",
    stimulus: { kind: "glyph-matrix", cells },
    answer: { kind: "glyph-choice", options, correctIndex },
    explanation:
      "Each row keeps a single shape, and the three fill styles rotate one position to the right as you move down the grid.",
  };
}

function oddOneOut(index: number, rng: Rng): Question {
  const mode = Math.floor(rng() * 3);
  const shape = ANY_SHAPE[Math.floor(rng() * ANY_SHAPE.length)] as ShapeName;
  const fill = FILLS[Math.floor(rng() * FILLS.length)] as FillStyle;
  const count = 1 + Math.floor(rng() * 3);

  let odd: Glyph;
  let family: Glyph[];
  let explanation: string;
  let difficulty: Difficulty;

  if (mode === 0) {
    const otherShape = (shuffle(ANY_SHAPE, rng).find((s) => s !== shape) ??
      "circle") as ShapeName;
    family = [0, 45, 90, 135].map((rotation) => ({ shape, fill, rotation, count }));
    odd = { shape: otherShape, fill, rotation: 0, count };
    explanation = "Four figures share the same shape; one uses a different shape.";
    difficulty = 1;
  } else if (mode === 1) {
    const otherFill = (shuffle(FILLS, rng).find((f) => f !== fill) ?? "solid") as FillStyle;
    family = [0, 45, 90, 180].map((rotation) => ({ shape, fill, rotation, count }));
    odd = { shape, fill: otherFill, rotation: 135, count };
    explanation = "Four figures share the same fill style; one is filled differently.";
    difficulty = 3;
  } else {
    const otherCount = count === 3 ? 1 : count + 1;
    family = [0, 90, 180, 270].map((rotation) => ({ shape, fill, rotation, count }));
    odd = { shape, fill, rotation: 45, count: otherCount };
    explanation =
      "Four figures contain the same number of shapes; one contains a different number.";
    difficulty = 2;
  }

  const options = shuffle([...family, odd], rng);

  return {
    id: `vis-odd-${String(index).padStart(3, "0")}`,
    category: "pattern",
    difficulty,
    prompt: "Which figure does not belong with the others?",
    answer: {
      kind: "glyph-choice",
      options,
      correctIndex: options.findIndex((o) => glyphKey(o) === glyphKey(odd)),
    },
    explanation,
  };
}

function mentalRotation(index: number, rng: Rng): Question {
  const shape = ASYMMETRIC[Math.floor(rng() * ASYMMETRIC.length)] as ShapeName;
  const fill = FILLS[Math.floor(rng() * FILLS.length)] as FillStyle;
  const start = Math.floor(rng() * 8) * 45;
  const turn = ([90, 135, 180, 225, 270] as const)[Math.floor(rng() * 5)] as number;

  const source: Glyph = { shape, fill, rotation: start, count: 1 };
  const correct: Glyph = { shape, fill, rotation: (start + turn) % 360, count: 1 };
  const { options, correctIndex } = uniqueOptions(
    correct,
    [
      { shape, fill, rotation: (start - turn + 720) % 360, count: 1 },
      { shape, fill, rotation: (start + turn + 45) % 360, count: 1 },
      { shape, fill, rotation: (start + turn + 180) % 360, count: 1 },
      { shape, fill, rotation: (start + turn + 90) % 360, count: 1 },
      { shape, fill, rotation: (start + turn + 135) % 360, count: 1 },
    ],
    rng,
  );

  return {
    id: `vis-mrt-${String(index).padStart(3, "0")}`,
    category: "spatial",
    difficulty: (turn === 180 ? 2 : turn === 90 || turn === 270 ? 3 : 4) as Difficulty,
    prompt: `Which figure shows the reference figure turned ${turn}° clockwise?`,
    stimulus: { kind: "glyph-row", glyphs: [source] },
    answer: { kind: "glyph-choice", options, correctIndex },
    explanation: `Turning the reference figure ${turn}° clockwise puts it at ${(start + turn) % 360}°.`,
  };
}

function build(): Question[] {
  const rng = createRng(0x4d4f4455); // "MODU" — fixed so the bank never shifts
  const out: Question[] = [];
  const seen = new Set<string>();

  // Random generation can land on the same figure twice. Rather than trusting it
  // not to, discard repeats and draw again — a duplicate would be served as if it
  // were a fresh question.
  const take = (make: (index: number, rng: Rng) => Question, count: number) => {
    let made = 0;
    for (let attempt = 0; made < count && attempt < count * 50; attempt++) {
      const question = make(made + 1, rng);
      const signature = [
        question.prompt,
        JSON.stringify(question.stimulus ?? ""),
        JSON.stringify(question.answer),
      ].join("::");
      if (seen.has(signature)) continue;
      seen.add(signature);
      out.push(question);
      made += 1;
    }
  };

  take(rotationMatrix, 14);
  take(countMatrix, 10);
  take(fillMatrix, 10);
  take(oddOneOut, 16);
  take(mentalRotation, 16);
  return out;
}

export const visualQuestions: Question[] = build();
