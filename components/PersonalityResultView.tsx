"use client";

import { useMemo } from "react";
import { ArchetypeBars } from "./ArchetypeBars";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ButtonLink, Card, Disclaimer, Eyebrow, Meter } from "./ui";
import {
  ARCHETYPE_4_DEFINITIONS,
  ARCHETYPE_4_LIST,
  FRAMEWORK_NOTE,
  NOT_A_TYPE_NOTE,
  type Archetype4,
} from "@/lib/personality/archetypes4";
import { aspirationForForm } from "@/lib/personality/aspiration";
import { scenariosForForm } from "@/lib/personality/scenarios";
import { scoreFourArchetypes } from "@/lib/personality/scoring";
import { TRAIT_LABELS, type Trait } from "@/lib/personality/types";
import { useStore } from "@/lib/useStore";

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mt-5 p-6 sm:p-7">
      <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">{label}</p>
      {title ? (
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-fog-100">{title}</h2>
      ) : null}
      {children}
    </Card>
  );
}

export function PersonalityResultView({ resultId }: { resultId: string }) {
  const store = useStore();
  const result = store.personality.find((p) => p.id === resultId);

  const outcome = useMemo(() => {
    if (!result?.scenarioChoices) return null;
    try {
      const form = result.form === "deep" ? "deep" : "core";
      return scoreFourArchetypes({
        scenarioChoices: result.scenarioChoices,
        scenarios: scenariosForForm(form),
        aspirationChoices: result.aspirationChoices ?? {},
        aspirationItems: aspirationForForm(form),
      });
    } catch {
      return null;
    }
  }, [result]);

  if (!result || !outcome) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fog-100">Result not found</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-fog-300">
          Results live in this browser only. This one may have been deleted, taken on another
          device, or saved by an older version of the assessment.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/personality">Take the assessment</ButtonLink>
          <ButtonLink href="/history" variant="secondary">View history</ButtonLink>
        </div>
      </div>
    );
  }

  const four = outcome.four;
  const dominant = ARCHETYPE_4_DEFINITIONS[four.dominant];
  const supporting = ARCHETYPE_4_DEFINITIONS[four.supporting];
  const neglected = ARCHETYPE_4_DEFINITIONS[four.neglected];
  const growth = ARCHETYPE_4_DEFINITIONS[four.growthEdge];
  const shadowOf = four.shadow.archetype
    ? ARCHETYPE_4_DEFINITIONS[four.shadow.archetype as Archetype4]
    : null;
  const shadowPole =
    shadowOf && four.shadow.pole === "active"
      ? shadowOf.shadow.active
      : shadowOf && four.shadow.pole === "passive"
        ? shadowOf.shadow.passive
        : null;

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Eyebrow>Most accessed energy</Eyebrow>
        <ConfidenceBadge confidence={four.confidence} compact />
        {four.contested ? (
          <span className="rounded-full border border-sand-500/40 bg-sand-500/10 px-2.5 py-0.5 text-[11px] text-sand-400">
            Close with {supporting.name}
          </span>
        ) : null}
      </div>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-fog-100 sm:text-5xl">
        {dominant.name}
      </h1>
      <p className="mt-3 text-[15.5px] text-sand-400">
        {dominant.tagline}
        {outcome.facet ? ` · ${outcome.facet.archetype.name}` : ""}
      </p>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-fog-300">
        {dominant.description}
      </p>

      <div className="mt-6 rounded-xl border border-ink-700 bg-ink-900/60 p-4">
        <p className="text-[12.5px] leading-relaxed text-fog-400">{NOT_A_TYPE_NOTE}</p>
      </div>

      {/* What the energy wants — the "reveals more" core. */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">
            What the {dominant.name.replace("The ", "")} desires
          </p>
          <p className="mt-2.5 text-[14px] leading-relaxed text-fog-200">{dominant.desires}</p>
        </Card>
        <Card className="p-6">
          <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">What it fears</p>
          <p className="mt-2.5 text-[14px] leading-relaxed text-fog-200">{dominant.fear}</p>
        </Card>
      </div>

      <Section label="Its function">
        <p className="mt-2.5 text-[14px] leading-relaxed text-fog-200">{dominant.function}</p>
        <div className="mt-5 grid gap-5 border-t border-ink-800 pt-5 sm:grid-cols-2">
          <div>
            <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">At work</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-fog-300">{dominant.inWork}</p>
          </div>
          <div>
            <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">In relationships</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-fog-300">
              {dominant.inRelationships}
            </p>
          </div>
        </div>
        <ul className="mt-5 space-y-2 border-t border-ink-800 pt-5">
          {dominant.gifts.map((gift) => (
            <li key={gift} className="flex gap-2.5 text-[13.5px] leading-relaxed text-fog-200">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-jade-500" />
              {gift}
            </li>
          ))}
        </ul>
      </Section>

      {outcome.facet ? (
        <Section
          label={`Your ${dominant.name.replace("The ", "")} runs through`}
          title={outcome.facet.archetype.name}
        >
          <p className="mt-1 text-[13.5px] text-sand-400">{outcome.facet.archetype.tagline}</p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-fog-300">
            {outcome.facet.archetype.description}
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-fog-400">
            Chosen in {outcome.facet.count} of the situations where you reached for the{" "}
            {dominant.name.replace("The ", "")}. Each energy has three flavours; this is the one
            your answers actually expressed.
          </p>
        </Section>
      ) : null}

      <Section label="Access across the four">
        <p className="mt-2 text-[13px] leading-relaxed text-fog-400">
          50 is chance — choosing an energy a quarter of the time is no preference at all. Your
          profile is <span className="text-fog-200">{four.balanceLabel}</span>, spanning{" "}
          {Math.round(four.spread)} points from {dominant.name} down to {neglected.name}.
        </p>
        <div className="mt-6">
          <ArchetypeBars readings={four.readings} dominant={four.dominant} />
        </div>
        <div className="mt-6 border-t border-ink-800 pt-5">
          <ConfidenceBadge confidence={four.confidence} />
        </div>
      </Section>

      <Section label="What you are probably striving for" title={growth.name}>
        <p className="mt-3 text-[14px] leading-relaxed text-fog-300">
          {four.growthGap > 8
            ? `You value the ${growth.name.replace("The ", "")} more than you currently reach for it — a gap of ${Math.round(four.growthGap)} points between what you said you would not give up and what you actually chose to do. That gap is the most actionable thing here.`
            : `No energy shows a large gap between what you value and what you reach for. The ${growth.name.replace("The ", "")} shows the widest at ${Math.round(four.growthGap)} points, but you are broadly acting in line with what you said matters.`}
        </p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-fog-200">
          <span className="text-fog-400">What it wants:</span> {growth.desires}
        </p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-fog-400">
          <span className="text-fog-300">When it is missing:</span> {growth.whenMissing}
        </p>
        <div className="mt-5 border-t border-ink-800 pt-5">
          <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">Concrete practices</p>
          <ul className="mt-3 space-y-2">
            {growth.development.map((step) => (
              <li key={step} className="flex gap-2.5 text-[13.5px] leading-relaxed text-fog-200">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sand-500" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {shadowOf && shadowPole ? (
        <Section label="Under pressure" title={shadowPole.name}>
          <p className="mt-1 text-[12.5px] text-fog-400">
            The {four.shadow.pole} shadow of {shadowOf.name} — {shadowPole.gloss}
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-fog-300">{shadowPole.description}</p>
          <p className="mt-4 rounded-xl border border-ink-700 bg-ink-950/50 p-4 text-[13px] leading-relaxed text-fog-200">
            <span className="text-fog-400">The tell:</span> {shadowPole.tell}
          </p>
          <div className="mt-5 grid gap-4 border-t border-ink-800 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">
                The other pole
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-fog-300">
                <span className="text-fog-100">
                  {four.shadow.pole === "active"
                    ? shadowOf.shadow.passive.name
                    : shadowOf.shadow.active.name}
                </span>{" "}
                —{" "}
                {four.shadow.pole === "active"
                  ? shadowOf.shadow.passive.gloss
                  : shadowOf.shadow.active.gloss}
                . Both poles come from the same missing centre; men often swing between them.
              </p>
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">
                Immature form
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-fog-300">
                <span className="text-fog-100">{shadowOf.immature.name}</span> —{" "}
                {shadowOf.immature.description}
              </p>
            </div>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-fog-400">
            Read from the pressure situations, where every option was written to sound reasonable
            from the inside. You met {four.shadow.matureCount} of {four.shadow.total} in the mature
            form.
          </p>
        </Section>
      ) : four.shadow.total > 0 ? (
        <Section label="Under pressure" title="No single shadow dominates">
          <p className="mt-3 text-[14px] leading-relaxed text-fog-300">
            Your pressure responses split evenly between the inflated and deflated poles, or landed
            mostly in the mature form — you met {four.shadow.matureCount} of {four.shadow.total}{" "}
            squarely. That is a good sign, but a short form has few pressure situations, so it is a
            weak reading rather than a clean bill of health.
          </p>
        </Section>
      ) : null}

      <Section label="All four, in full">
        <p className="mt-2 text-[13px] leading-relaxed text-fog-400">
          You have all four. Here is what each wants and what it costs when it slips.
        </p>
        <div className="mt-5 space-y-5">
          {ARCHETYPE_4_LIST.map((archetype) => {
            const reading = four.byArchetype[archetype.id];
            return (
              <div key={archetype.id} className="border-l-2 border-ink-700 pl-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-[15px] font-semibold text-fog-100">{archetype.name}</h3>
                  <p className="tabular text-[12px] text-fog-400">
                    access {Math.round(reading.access)} · valued {Math.round(reading.aspiration)}
                  </p>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fog-300">
                  <span className="text-fog-400">Desires:</span> {archetype.desires}
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-fog-400">
                  <span className="text-fog-300">Shadows:</span> {archetype.shadow.active.name} (
                  {archetype.shadow.active.gloss}) · {archetype.shadow.passive.name} (
                  {archetype.shadow.passive.gloss}). Matures from {archetype.immature.name}.
                </p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section label="Trait signature">
        <p className="mt-2 text-[13px] leading-relaxed text-fog-400">
          Derived from the situations you chose rather than asked for separately — which is what
          keeps the assessment short. Read it as the texture behind the four, not as a separate
          test.
        </p>
        <div className="mt-5 space-y-3">
          {outcome.ranking.length > 0
            ? (Object.keys(TRAIT_LABELS) as Trait[]).map((trait) => (
                <div key={trait}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[13px] text-fog-200">{TRAIT_LABELS[trait]}</p>
                    <p className="tabular text-[12.5px] text-fog-400">
                      {Math.round(outcome.traitScores[trait])}
                    </p>
                  </div>
                  <div className="mt-1.5">
                    <Meter value={outcome.traitScores[trait]} tone="jade" />
                  </div>
                </div>
              ))
            : null}
        </div>
      </Section>

      {outcome.combinations.length > 0 ? (
        <Section label="Where your traits interact">
          <div className="mt-4 space-y-5">
            {outcome.combinations.map((combination) => (
              <div key={combination.id} className="border-l-2 border-ink-700 pl-4">
                <h3 className="text-[14px] font-medium text-fog-100">{combination.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-fog-300">
                  {combination.body}
                </p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/personality" size="lg">Retake</ButtonLink>
        <ButtonLink href="/tests" size="lg" variant="secondary">Take an IQ test</ButtonLink>
        <ButtonLink href="/history" size="lg" variant="ghost">History</ButtonLink>
      </div>

      <div className="mt-8">
        <Disclaimer>{FRAMEWORK_NOTE}</Disclaimer>
      </div>
    </div>
  );
}
