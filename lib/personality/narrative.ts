import type { PersonalityOutcome } from "./scoring";
import { TRAITS, TRAIT_LABELS, TRAIT_POLES, type Trait } from "./types";

/**
 * A write-up built from *this* profile.
 *
 * The archetype description is fixed text and would read identically for two
 * people who matched the same archetype for opposite reasons. These paragraphs
 * are assembled from the taker's own standout traits, the distance between
 * them, and how cleanly the archetype actually fitted — so the page says
 * something that is true of them specifically.
 */

const list = (traits: Trait[]): string => {
  const names = traits.map((t) => TRAIT_LABELS[t].toLowerCase());
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
};

function spreadDescription(spread: number): string {
  if (spread > 55)
    return "Your profile is strongly differentiated: some traits sit far above others, so the archetype below describes you more sharply than it would most people.";
  if (spread > 30)
    return "Your profile has clear peaks and troughs, which is what makes an archetype meaningful rather than decorative.";
  if (spread > 15)
    return "Your profile is moderately differentiated — real preferences, but no single trait dominates the rest.";
  return "Your traits sit unusually close together. That is a genuine finding rather than a failure to answer: it describes someone adaptable across situations, but it also means any archetype will fit loosely.";
}

export function buildNarrative(outcome: PersonalityOutcome): string[] {
  const paragraphs: string[] = [];
  const { traitScores, definingTraits, counterTraits, primary, secondary } = outcome;

  const values = TRAITS.map((t) => traitScores[t]);
  const spread = Math.max(...values) - Math.min(...values);

  // 1. What actually stands out.
  if (definingTraits.length > 0) {
    const top = definingTraits[0] as Trait;
    const highs = list(definingTraits);
    const lows = counterTraits.length ? list(counterTraits) : "";
    const opening =
      `What separates you from the average profile is ${highs}` +
      (lows ? `, and — running the other way — ${lows}.` : ".");
    paragraphs.push(
      `${opening} Your strongest single trait is ${TRAIT_LABELS[top].toLowerCase()}: you ${TRAIT_POLES[top].high}.`,
    );
  }

  // 2. How differentiated the profile is.
  paragraphs.push(spreadDescription(spread));

  // 3. What the fit actually means.
  if (outcome.confidence === "clear") {
    paragraphs.push(
      `${primary.archetype.name} is a decisive fit, ${outcome.margin.toFixed(1)} points clear of ${secondary.archetype.name}, the nearest archetype with a genuinely different shape.`,
    );
  } else if (outcome.confidence === "moderate") {
    paragraphs.push(
      `${primary.archetype.name} fits best, but only by ${outcome.margin.toFixed(1)} points over ${secondary.archetype.name}. You are better described by the pair than by either alone — take the parts of each that you recognise.`,
    );
  } else {
    paragraphs.push(
      `${primary.archetype.name} and ${secondary.archetype.name} are separated by just ${Math.abs(outcome.margin).toFixed(1)} points, so treat this as a region rather than a label. Where the two descriptions agree is the part to trust.`,
    );
  }

  // 4. Honest caveat when the data does not support the confidence of the page.
  if (outcome.quality.level === "questionable") {
    paragraphs.push(
      "One further caution: the response pattern flagged below means these trait scores may not reflect how you would answer on a more careful reading. The archetype is shown for completeness, not because it has been earned by the data.",
    );
  }

  return paragraphs;
}

/** One-line summary suitable for a card or a history row. */
export function summarise(outcome: PersonalityOutcome): string {
  const top = outcome.definingTraits[0];
  if (!top) return outcome.primary.archetype.name;
  return `${outcome.primary.archetype.name} — led by ${TRAIT_LABELS[top].toLowerCase()}`;
}
