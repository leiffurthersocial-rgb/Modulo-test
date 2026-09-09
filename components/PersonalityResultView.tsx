"use client";

import { useMemo } from "react";
import { ButtonLink, Card, Disclaimer, Eyebrow, Meter } from "./ui";
import { ARCHETYPES, ARCHETYPE_DISCLAIMER } from "@/lib/personality/archetypes";
import { itemsForForm } from "@/lib/personality/items";
import { buildNarrative } from "@/lib/personality/narrative";
import { QUALITY_BLURBS } from "@/lib/personality/quality";
import { CONFIDENCE_BLURBS, scorePersonality } from "@/lib/personality/scoring";
import { STABILITY_BLURBS, compareProfiles } from "@/lib/personality/stability";
import { TRAIT_BLURBS, TRAIT_LABELS, type Trait } from "@/lib/personality/types";
import { useStore } from "@/lib/useStore";

const QUALITY_TONE = {
  good: "border-jade-500/40 bg-jade-500/5 text-jade-400",
  fair: "border-sand-500/40 bg-sand-500/5 text-sand-400",
  questionable: "border-red-900/60 bg-red-950/25 text-red-300",
} as const;

const CONFIDENCE_LABEL = {
  clear: "Clear fit",
  moderate: "Close call",
  borderline: "Between archetypes",
} as const;

export function PersonalityResultView({ resultId }: { resultId: string }) {
  const store = useStore();
  const result = store.personality.find((p) => p.id === resultId);

  // Previous profile, for the retake comparison.
  const previous = useMemo(() => {
    if (!result) return null;
    const earlier = store.personality
      .filter((p) => p.completedAt < result.completedAt)
      .sort((a, b) => b.completedAt - a.completedAt);
    return earlier[0] ?? null;
  }, [result, store.personality]);

  // Re-score from the stored answers rather than trusting stored derivations, so
  // an improvement to the scoring model reaches results already taken.
  const outcome = useMemo(() => {
    if (!result?.responses) return null;
    try {
      return scorePersonality(result.responses, itemsForForm(result.form ?? "full"));
    } catch {
      return null;
    }
  }, [result]);

  const stability = useMemo(() => {
    if (!previous || !result) return null;
    return compareProfiles(previous.traitScores, result.traitScores, {
      sameArchetype: previous.primaryId === result.primaryId,
    });
  }, [previous, result]);

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fog-100">Result not found</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-fog-300">
          Results live in this browser only. This one may have been deleted, or opened elsewhere.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/personality">Take the personality test</ButtonLink>
          <ButtonLink href="/history" variant="secondary">View history</ButtonLink>
        </div>
      </div>
    );
  }

  const primary =
    outcome?.primary.archetype ?? ARCHETYPES.find((a) => a.id === result.primaryId);
  const secondary =
    outcome?.secondary.archetype ?? ARCHETYPES.find((a) => a.id === result.secondaryId);

  if (!primary || !outcome) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fog-100">
          This result could not be displayed
        </h1>
        <p className="mt-3 text-[14.5px] text-fog-300">
          It was saved in a format this version no longer recognises.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/personality">Retake the profile</ButtonLink>
        </div>
      </div>
    );
  }

  const narrative = buildNarrative(outcome);
  const quality = outcome.quality;

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Eyebrow>Modulo archetype</Eyebrow>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
            outcome.confidence === "clear"
              ? "border-jade-500/40 bg-jade-500/10 text-jade-400"
              : "border-sand-500/40 bg-sand-500/10 text-sand-400"
          }`}
        >
          {CONFIDENCE_LABEL[outcome.confidence]}
        </span>
      </div>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-fog-100 sm:text-5xl">
        {primary.name}
      </h1>
      <p className="mt-3 text-[15.5px] text-sand-400">{primary.tagline}</p>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-fog-300">
        {primary.description}
      </p>

      {/* What is true of this profile specifically, rather than of the archetype. */}
      <Card className="mt-7 p-6 sm:p-7">
        <h2 className="text-[12px] uppercase tracking-[0.14em] text-fog-400">
          Your profile in particular
        </h2>
        <div className="mt-3 space-y-3">
          {narrative.map((paragraph, i) => (
            <p key={i} className="text-[14.5px] leading-relaxed text-fog-200">
              {paragraph}
            </p>
          ))}
        </div>
        <p className="mt-4 border-t border-ink-800 pt-4 text-[12.5px] leading-relaxed text-fog-400">
          {CONFIDENCE_BLURBS[outcome.confidence]}
        </p>
      </Card>

      {quality.flags.length > 0 || quality.level !== "good" ? (
        <div className={`mt-5 rounded-2xl border p-5 ${QUALITY_TONE[quality.level]}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[13.5px] font-semibold">
              Response quality: {quality.level}
            </h2>
            <p className="tabular text-[11.5px] opacity-80">
              variation {quality.variation.toFixed(2)} · consistency gap{" "}
              {quality.inconsistency.toFixed(2)}
            </p>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed opacity-90">
            {QUALITY_BLURBS[quality.level]}
          </p>
          {quality.flags.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {quality.flags.map((flag) => (
                <li key={flag.code} className="text-[12.5px] leading-relaxed opacity-90">
                  <span className="font-medium">{flag.label}:</span> {flag.detail}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <div className={`mt-5 rounded-2xl border p-4 ${QUALITY_TONE.good}`}>
          <p className="text-[12.5px] leading-relaxed">
            <span className="font-medium">Response quality: good.</span>{" "}
            {QUALITY_BLURBS.good}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-fog-400">Strengths</h2>
          <ul className="mt-3 space-y-2">
            {primary.strengths.map((s) => (
              <li key={s} className="flex gap-2.5 text-[13.5px] leading-relaxed text-fog-200">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-jade-500" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-fog-400">
            Potential weaknesses
          </h2>
          <ul className="mt-3 space-y-2">
            {primary.weaknesses.map((w) => (
              <li key={w} className="flex gap-2.5 text-[13.5px] leading-relaxed text-fog-200">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sand-500" />
                {w}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {outcome.combinations.length > 0 ? (
        <Card className="mt-5 p-6 sm:p-7">
          <h2 className="text-[15.5px] font-semibold tracking-tight text-fog-100">
            Where your traits interact
          </h2>
          <p className="mt-2 text-[13px] text-fog-400">
            Combinations that change how the individual traits actually play out.
          </p>
          <div className="mt-5 space-y-5">
            {outcome.combinations.map((combination) => (
              <div key={combination.id} className="border-l-2 border-ink-700 pl-4">
                <h3 className="text-[14px] font-medium text-fog-100">{combination.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-fog-300">
                  {combination.body}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {secondary && secondary.id !== primary.id ? (
        <Card className="mt-5 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">
                Secondary archetype
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-fog-100">
                {secondary.name}
              </h2>
            </div>
            <span className="tabular text-[13px] text-fog-400">
              {outcome.secondary.match}% fit · {outcome.margin.toFixed(1)} behind
            </span>
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-fog-300">
            {secondary.description}
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-fog-400">
            The secondary is the nearest archetype that describes a genuinely different shape —
            not simply the runner-up, which is often a close variant of the primary and would
            tell you nothing new.
          </p>
        </Card>
      ) : null}

      <Card className="mt-5 p-6 sm:p-7">
        <h2 className="text-[15.5px] font-semibold tracking-tight text-fog-100">Trait profile</h2>
        <p className="mt-2 text-[13px] text-fog-400">
          Bars show the absolute score; the figure to the right is the distance from your own
          nine-trait average, which is what the archetype match actually uses.
        </p>
        <div className="mt-6 space-y-4">
          {outcome.traits.map((trait) => {
            const noisy = trait.inconsistency !== null && trait.inconsistency >= 1.5;
            return (
              <div key={trait.trait}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[13.5px] text-fog-200">
                    {TRAIT_LABELS[trait.trait as Trait]}
                    {noisy ? (
                      <span
                        className="ml-2 text-[11px] text-sand-400"
                        title={`Forward and reversed statements disagree by ${trait.inconsistency?.toFixed(1)} points`}
                      >
                        inconsistent
                      </span>
                    ) : null}
                  </p>
                  <p className="tabular text-[13px] text-fog-400">
                    {Math.round(trait.score)}
                    <span
                      className={
                        trait.relative >= 0 ? "ml-2 text-jade-400" : "ml-2 text-fog-400"
                      }
                    >
                      {trait.relative >= 0 ? "+" : ""}
                      {trait.relative.toFixed(0)}
                    </span>
                  </p>
                </div>
                <div className="mt-2">
                  <Meter value={trait.score} tone="jade" />
                </div>
                <p className="mt-1.5 text-[11.5px] text-fog-400">
                  {TRAIT_BLURBS[trait.trait as Trait]}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {stability && previous ? (
        <Card className="mt-5 p-6 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[15.5px] font-semibold tracking-tight text-fog-100">
              Compared with your previous profile
            </h2>
            <span className="tabular text-[12.5px] text-fog-400">
              agreement {stability.agreement.toFixed(2)} · mean shift{" "}
              {stability.meanAbsoluteChange.toFixed(1)} pts
            </span>
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-fog-300">
            {STABILITY_BLURBS[stability.verdict]}{" "}
            {stability.sameArchetype
              ? "Both sittings landed on the same archetype."
              : "The two sittings landed on different archetypes, which is itself a signal about how firmly either fits."}
          </p>
          <div className="mt-5 space-y-2">
            {stability.shifts.slice(0, 4).map((shift) => (
              <div
                key={shift.trait}
                className="flex items-baseline justify-between gap-4 text-[13px]"
              >
                <span className="text-fog-200">{TRAIT_LABELS[shift.trait]}</span>
                <span className="tabular text-fog-400">
                  {Math.round(shift.before)} → {Math.round(shift.after)}
                  <span className={shift.delta >= 0 ? "ml-2 text-jade-400" : "ml-2 text-sand-400"}>
                    {shift.delta >= 0 ? "+" : ""}
                    {shift.delta.toFixed(0)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="mt-5 p-6">
        <h2 className="text-[15.5px] font-semibold tracking-tight text-fog-100">
          Fit against every archetype
        </h2>
        <div className="mt-5 space-y-3">
          {outcome.ranking.map((entry) => (
            <div key={entry.archetype.id} className="flex items-center gap-4">
              <p className="w-36 shrink-0 text-[13px] text-fog-200 sm:w-40">
                {entry.archetype.name}
              </p>
              <div className="flex-1">
                <Meter
                  value={entry.match}
                  tone={
                    entry.archetype.id === primary.id
                      ? "sand"
                      : entry.archetype.id === secondary?.id
                        ? "jade"
                        : "fog"
                  }
                />
              </div>
              <p className="tabular w-12 shrink-0 text-right text-[12.5px] text-fog-400">
                {entry.match}%
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/personality" size="lg">Retake the profile</ButtonLink>
        <ButtonLink href="/tests" size="lg" variant="secondary">Take an IQ test</ButtonLink>
        <ButtonLink href="/history" size="lg" variant="ghost">History</ButtonLink>
      </div>

      <div className="mt-8">
        <Disclaimer>{ARCHETYPE_DISCLAIMER}</Disclaimer>
      </div>
    </div>
  );
}
