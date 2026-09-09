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

export interface PersonalityItem {
  id: string;
  trait: Trait;
  text: string;
  /** True when agreement indicates *less* of the trait. */
  reverse: boolean;
}

/** 1 = strongly disagree … 5 = strongly agree. */
export type LikertValue = 1 | 2 | 3 | 4 | 5;

export const LIKERT_LABELS: Record<LikertValue, string> = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree",
};
