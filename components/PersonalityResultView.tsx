"use client";

import { ButtonLink, Card, Disclaimer, Eyebrow, Meter } from "./ui";
import { ARCHETYPES, ARCHETYPE_DISCLAIMER } from "@/lib/personality/archetypes";
import { matchArchetypes } from "@/lib/personality/scoring";
import { TRAITS, TRAIT_BLURBS, TRAIT_LABELS, type Trait } from "@/lib/personality/types";
import { useStore } from "@/lib/useStore";

const byId = (id: string) => ARCHETYPES.find((a) => a.id === id);

export function PersonalityResultView({ resultId }: { resultId: string }) {
  const store = useStore();
  const result = store.personality.find((p) => p.id === resultId);

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

  const primary = byId(result.primaryId);
  const secondary = byId(result.secondaryId);
  const ranking = matchArchetypes(result.traitScores);

  const sorted = [...TRAITS].sort((a, b) => result.traitScores[b] - result.traitScores[a]);
  const top = sorted.slice(0, 3);
  const bottom = sorted.slice(-2);

  if (!primary) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fog-100">
          This result could not be displayed
        </h1>
        <p className="mt-3 text-[14.5px] text-fog-300">Its archetype is no longer recognised.</p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/personality">Retake the test</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <Eyebrow>Modulo archetype</Eyebrow>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-fog-100 sm:text-5xl">
        {primary.name}
      </h1>
      <p className="mt-3 text-[15.5px] text-sand-400">{primary.tagline}</p>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-fog-300">{primary.description}</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-fog-400">Strengths</h2>
          <ul className="mt-3 space-y-2">
            {primary.strengths.map((s) => (
              <li key={s} className="flex gap-2.5 text-[13.5px] leading-relaxed text-fog-200">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-jade-500" />{s}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-fog-400">Potential weaknesses</h2>
          <ul className="mt-3 space-y-2">
            {primary.weaknesses.map((w) => (
              <li key={w} className="flex gap-2.5 text-[13.5px] leading-relaxed text-fog-200">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sand-500" />{w}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {secondary ? (
        <Card className="mt-5 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">Secondary archetype</p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-fog-100">{secondary.name}</h2>
            </div>
            <span className="tabular text-[13px] text-fog-400">{result.secondaryMatch}% fit</span>
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-fog-300">{secondary.description}</p>
        </Card>
      ) : null}

      <Card className="mt-5 p-6">
        <h2 className="text-[15.5px] font-semibold tracking-tight text-fog-100">Key traits</h2>
        <p className="mt-2 text-[13px] text-fog-400">
          Your three strongest traits relative to the rest of your profile: {" "}
          <span className="text-fog-200">{top.map((t) => TRAIT_LABELS[t]).join(", ")}</span>. Your
          two lowest: <span className="text-fog-200">{bottom.map((t) => TRAIT_LABELS[t]).join(", ")}</span>.
        </p>
        <div className="mt-6 space-y-4">
          {TRAITS.map((trait: Trait) => (
            <div key={trait}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[13.5px] text-fog-200">{TRAIT_LABELS[trait]}</p>
                <p className="tabular text-[13px] text-fog-400">{Math.round(result.traitScores[trait])}</p>
              </div>
              <div className="mt-2"><Meter value={result.traitScores[trait]} tone="jade" /></div>
              <p className="mt-1.5 text-[11.5px] text-fog-400">{TRAIT_BLURBS[trait]}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-5 p-6">
        <h2 className="text-[15.5px] font-semibold tracking-tight text-fog-100">Fit against every archetype</h2>
        <div className="mt-5 space-y-3">
          {ranking.map((entry) => (
            <div key={entry.archetype.id} className="flex items-center gap-4">
              <p className="w-40 shrink-0 text-[13px] text-fog-200">{entry.archetype.name}</p>
              <div className="flex-1"><Meter value={entry.match} tone={entry.archetype.id === primary.id ? "sand" : "fog"} /></div>
              <p className="tabular w-12 shrink-0 text-right text-[12.5px] text-fog-400">{entry.match}%</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/personality" size="lg">Retake the profile</ButtonLink>
        <ButtonLink href="/tests" size="lg" variant="secondary">Take an IQ test</ButtonLink>
        <ButtonLink href="/history" size="lg" variant="ghost">History</ButtonLink>
      </div>

      <div className="mt-8"><Disclaimer>{ARCHETYPE_DISCLAIMER}</Disclaimer></div>
    </div>
  );
}
