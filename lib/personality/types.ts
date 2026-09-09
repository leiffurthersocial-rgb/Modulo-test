export type Trait =
  | "leadership"
  | "independence"
  | "discipline"
  | "sociability"
  | "riskTolerance"
  | "curiosity"
  | "assertiveness"
  | "empathy"
  | "competitiveness";

export const TRAITS: Trait[] = [
  "leadership",
  "independence",
  "discipline",
  "sociability",
  "riskTolerance",
  "curiosity",
  "assertiveness",
  "empathy",
  "competitiveness",
];

export const TRAIT_LABELS: Record<Trait, string> = {
  leadership: "Leadership",
  independence: "Independence",
  discipline: "Discipline",
  sociability: "Sociability",
  riskTolerance: "Risk tolerance",
  curiosity: "Curiosity",
  assertiveness: "Assertiveness",
  empathy: "Empathy",
  competitiveness: "Competitiveness",
};

export const TRAIT_BLURBS: Record<Trait, string> = {
  leadership: "Taking direction of a group and owning the outcome.",
  independence: "Acting on your own judgement without needing sign-off.",
  discipline: "Following through once the novelty has worn off.",
  sociability: "Drawing energy from company and keeping a wide circle.",
  riskTolerance: "Acting under uncertainty instead of waiting for certainty.",
  curiosity: "Pursuing understanding past the point of usefulness.",
  assertiveness: "Stating what you want plainly, including when it is unwelcome.",
  empathy: "Reading and accounting for how other people feel.",
  competitiveness: "Measuring yourself against others and raising your effort.",
};

/** Short, plain-language poles used when describing a profile back to someone. */
export const TRAIT_POLES: Record<Trait, { high: string; low: string }> = {
  leadership: { high: "takes charge", low: "prefers to follow" },
  independence: { high: "self-directed", low: "collaborative by default" },
  discipline: { high: "follows through", low: "led by momentum" },
  sociability: { high: "energised by people", low: "restored by solitude" },
  riskTolerance: { high: "moves under uncertainty", low: "waits for certainty" },
  curiosity: { high: "digs past the useful point", low: "practical and focused" },
  assertiveness: { high: "says it plainly", low: "keeps the peace" },
  empathy: { high: "reads the room", low: "task before mood" },
  competitiveness: { high: "keeps score", low: "runs your own race" },
};

export interface PersonalityItem {
  id: string;
  trait: Trait;
  text: string;
  /** True when agreement indicates *less* of the trait. */
  reverse: boolean;
  /** Included in the 36-item short form as well as the full form. */
  core: boolean;
}

/** 1 = strongly disagree … 5 = strongly agree. */
export type LikertValue = 1 | 2 | 3 | 4 | 5;

export const LIKERT_VALUES: LikertValue[] = [1, 2, 3, 4, 5];

export const LIKERT_LABELS: Record<LikertValue, string> = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree",
};

export const LIKERT_SHORT: Record<LikertValue, string> = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree",
};

export type FormLength = "short" | "full";

export const FORM_LABELS: Record<FormLength, string> = {
  short: "Short form",
  full: "Full form",
};
