"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TrendChart } from "./TrendChart";
import { Button, ButtonLink, Card, Disclaimer, Eyebrow, Meter } from "./ui";
import { attemptConfidence } from "@/lib/iq/scoring";
import { stableCategoryScores, stableEstimate, type AttemptSummary } from "@/lib/iq/stable";
import { CATEGORY_LABELS, type Category } from "@/lib/iq/types";
import { ARCHETYPES } from "@/lib/personality/archetypes";
import {
  ARCHETYPE_4_DEFINITIONS,
  type Archetype4,
} from "@/lib/personality/archetypes4";
import {
  clearEverything,
  clearIqHistory,
  clearPersonalityHistory,
  clearSeenQuestions,
  deleteAttempt,
  deletePersonalityResult,
  type StoredIqAttempt,
} from "@/lib/storage";
import { useStore } from "@/lib/useStore";

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function toSummary(a: StoredIqAttempt): AttemptSummary {
  return {
    id: a.id,
    testId: a.testId,
    iq: a.iq,
    itemCount: a.total,
    categoryCount: a.categoryCount,
    noveltyRatio: a.noveltyRatio,
    completedAt: a.completedAt,
    categoryScores: Object.fromEntries(
      a.categories.filter((c) => c.score !== null).map((c) => [c.category, c.score as number]),
    ),
  };
}

function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  size = "sm",
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  size?: "sm" | "md";
}) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <Button variant="secondary" size={size} onClick={() => setArmed(true)}>{label}</Button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        variant="danger"
        size={size}
        onClick={() => {
          onConfirm();
          setArmed(false);
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="ghost" size={size} onClick={() => setArmed(false)}>Cancel</Button>
    </span>
  );
}

export function HistoryView() {
  const store = useStore();

  const attempts = useMemo(
    () => [...store.attempts].sort((a, b) => b.completedAt - a.completedAt),
    [store.attempts],
  );
  const chronological = useMemo(
    () => [...store.attempts].sort((a, b) => a.completedAt - b.completedAt),
    [store.attempts],
  );
  const summaries = useMemo(() => chronological.map(toSummary), [chronological]);
  const stable = useMemo(() => stableEstimate(summaries), [summaries]);
  const domains = useMemo(() => stableCategoryScores(summaries), [summaries]);
  // Confidence in the combined estimate: the weighted average of each
  // attempt's own confidence, lifted by how much total evidence there is.
  const { stablePercent, stableRange } = useMemo(() => {
    if (stable.iq === null || chronological.length === 0) {
      return { stablePercent: 0, stableRange: [0, 0] as [number, number] };
    }
    const weighted = chronological.map((a) => ({
      confidence: attemptConfidence(a),
      weight: stable.weighted.find((w) => w.attempt.id === a.id)?.weight ?? 0,
    }));
    const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
    const base =
      totalWeight === 0
        ? 0
        : weighted.reduce((s, w) => s + w.confidence.percent * w.weight, 0) / totalWeight;
    // More independent evidence tightens the combined estimate beyond any one attempt.
    const evidence = Math.min(1, stable.totalWeight / 2.2);
    const percent = Math.round(Math.min(96, base * (0.75 + 0.35 * evidence)));
    const margin = Math.max(
      2,
      Math.round(
        (weighted.reduce((s, w) => s + w.confidence.margin * w.weight, 0) /
          (totalWeight || 1)) /
          Math.sqrt(Math.max(1, chronological.length)),
      ),
    );
    return {
      stablePercent: percent,
      stableRange: [stable.iq - margin, stable.iq + margin] as [number, number],
    };
  }, [chronological, stable]);

  const weightById = useMemo(
    () => new Map(stable.weighted.map((w) => [w.attempt.id, w.weight])),
    [stable],
  );

  const personality = useMemo(
    () => [...store.personality].sort((a, b) => b.completedAt - a.completedAt),
    [store.personality],
  );
  const seenCount = Object.keys(store.seen).length;

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <Eyebrow>History</Eyebrow>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fog-100 sm:text-4xl">
        Your results
      </h1>
      <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-fog-300">
        Everything is stored in this browser. Delete any single attempt, clear a whole section, or
        wipe the lot — nothing is kept elsewhere.
      </p>

      {attempts.length === 0 && personality.length === 0 ? (
        <Card className="mt-10 p-10 text-center">
          <p className="text-[15px] text-fog-200">Nothing here yet.</p>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-fog-400">
            Take an IQ test or the personality profile and your results will appear here, along
            with a combined estimate once you have more than one attempt.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/tests">Take an IQ test</ButtonLink>
            <ButtonLink href="/personality" variant="secondary">Personality profile</ButtonLink>
          </div>
        </Card>
      ) : null}

      {stable.iq !== null ? (
        <Card className="mt-10 p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">Stable estimate</p>
              <p className="tabular mt-2 text-5xl font-semibold tracking-tight text-fog-100">{stable.iq}</p>
              <p className="tabular mt-1 text-[15px] text-fog-400">
                range {stableRange[0]}–{stableRange[1]}
              </p>
              <p className="mt-2 text-[13px] text-fog-400">
                {stable.attempts} attempt{stable.attempts === 1 ? "" : "s"} ·{" "}
                {stablePercent}% confidence · {stable.spread}-point spread
              </p>
            </div>
            <p className="max-w-sm text-[12.5px] leading-relaxed text-fog-400">
              A weighted median rather than your best or latest score. Narrow tests, short papers,
              recycled questions and later retakes all count for less, so this number settles
              instead of climbing.
            </p>
          </div>

          {chronological.length > 1 ? (
            <div className="mt-7 border-t border-ink-800 pt-6">
              <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">
                Attempts over time
              </p>
              <TrendChart
                stable={stable.iq}
                scores={chronological.map((a) => ({ iq: a.iq, label: a.testName }))}
              />
            </div>
          ) : null}

          {Object.keys(domains).length > 0 ? (
            <div className="mt-7 border-t border-ink-800 pt-6">
              <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">Domain estimates</p>
              <div className="mt-4 space-y-3.5">
                {(Object.entries(domains) as [Category, number][]).map(([category, score]) => (
                  <div key={category} className="flex items-center gap-4">
                    <p className="w-40 shrink-0 text-[13px] text-fog-200">{CATEGORY_LABELS[category]}</p>
                    <div className="flex-1">
                      <Meter value={Math.max(0, Math.min(100, ((score - 55) / 90) * 100))} />
                    </div>
                    <p className="tabular w-10 shrink-0 text-right text-[13px] text-fog-300">{score}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}

      {attempts.length > 0 ? (
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-fog-100">
              IQ attempts ({attempts.length})
            </h2>
            <ConfirmButton
              label="Clear IQ history"
              confirmLabel="Delete all attempts"
              onConfirm={clearIqHistory}
            />
          </div>

          <ul className="mt-5 space-y-3">
            {attempts.map((attempt) => {
              const weight = weightById.get(attempt.id) ?? 0;
              const conf = attemptConfidence(attempt);
              const confTone =
                conf.percent >= 88
                  ? "border-jade-500/40 bg-jade-500/10 text-jade-400"
                  : conf.percent >= 72
                    ? "border-jade-500/30 bg-jade-500/5 text-jade-400"
                    : conf.percent >= 50
                      ? "border-sand-500/40 bg-sand-500/10 text-sand-400"
                      : "border-red-900/60 bg-red-950/25 text-red-300";
              return (
                <li key={attempt.id}>
                  <Card className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <p className="tabular text-2xl font-semibold text-fog-100">{attempt.iq}</p>
                          <p className="tabular text-[13px] text-fog-400">
                            ({attempt.low}–{attempt.high})
                          </p>
                          <p className="text-[13.5px] text-sand-400">{attempt.band}</p>
                          <p className="tabular text-[12.5px] text-fog-400">
                            {attempt.percentile}th percentile
                          </p>
                          <span
                            className={`tabular inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] ${confTone}`}
                            title={conf.reasons.join(" ")}
                          >
                            {conf.percent}% confidence
                            <span className="opacity-70">±{Math.round(conf.margin)}</span>
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] text-fog-300">{attempt.testName}</p>
                        <p className="tabular mt-1 text-[12px] text-fog-400">
                          {dateFormat.format(new Date(attempt.completedAt))} · {attempt.correct}/{attempt.total} correct ·{" "}
                          {Math.round(attempt.noveltyRatio * 100)}% new questions · weight {weight.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/results/${attempt.id}`}
                          className="rounded-full border border-ink-600 bg-ink-850 px-3.5 py-1.5 text-[13px] text-fog-200 hover:border-ink-500"
                        >
                          View
                        </Link>
                        <ConfirmButton
                          label="Delete"
                          confirmLabel="Confirm delete"
                          onConfirm={() => deleteAttempt(attempt.id)}
                        />
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {personality.length > 0 ? (
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-fog-100">
              Personality results ({personality.length})
            </h2>
            <ConfirmButton
              label="Clear personality history"
              confirmLabel="Delete all results"
              onConfirm={clearPersonalityHistory}
            />
          </div>
          <ul className="mt-5 space-y-3">
            {personality.map((result) => {
              const dominant = result.dominant
                ? ARCHETYPE_4_DEFINITIONS[result.dominant as Archetype4]
                : null;
              const facet = ARCHETYPES.find((a) => a.id === result.primaryId);
              const supporting = result.secondaryId
                ? (ARCHETYPE_4_DEFINITIONS[result.secondaryId as Archetype4] ??
                   ARCHETYPES.find((a) => a.id === result.secondaryId))
                : null;
              const confidence = result.confidencePercent;
              const margin = result.confidenceMargin ?? 0;
              const tone =
                confidence === undefined
                  ? "border-ink-600 text-fog-400"
                  : confidence >= 75
                    ? "border-jade-500/40 bg-jade-500/10 text-jade-400"
                    : confidence >= 55
                      ? "border-jade-500/30 bg-jade-500/5 text-jade-400"
                      : confidence >= 35
                        ? "border-sand-500/40 bg-sand-500/10 text-sand-400"
                        : "border-red-900/60 bg-red-950/25 text-red-300";
              return (
                <li key={result.id}>
                  <Card className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[17px] font-semibold tracking-tight text-fog-100">
                            {dominant?.name ?? facet?.name ?? "Unknown"}
                          </p>
                          {confidence !== undefined ? (
                            <span
                              className={`tabular inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] ${tone}`}
                              title={`Approximate range on the leading score: ±${Math.round(margin)} points`}
                            >
                              {confidence}% confidence
                              <span className="opacity-70">±{Math.round(margin)}</span>
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[13px] text-fog-300">
                          {facet && dominant ? `${facet.name} · ` : ""}
                          {supporting ? `supported by ${supporting.name}` : ""}
                          {result.primaryMatch !== undefined
                            ? ` · access ${Math.round(result.primaryMatch)} (${Math.max(
                                0,
                                Math.round(result.primaryMatch - margin),
                              )}–${Math.min(100, Math.round(result.primaryMatch + margin))})`
                            : ""}
                        </p>
                        <p className="tabular mt-1 text-[12px] text-fog-400">
                          {dateFormat.format(new Date(result.completedAt))} · {result.answered}/{result.total} answered
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/personality/result/${result.id}`}
                          className="rounded-full border border-ink-600 bg-ink-850 px-3.5 py-1.5 text-[13px] text-fog-200 hover:border-ink-500"
                        >
                          View
                        </Link>
                        <ConfirmButton
                          label="Delete"
                          confirmLabel="Confirm delete"
                          onConfirm={() => deletePersonalityResult(result.id)}
                        />
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight text-fog-100">Manage stored data</h2>
        <Card className="mt-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-800 pb-5">
            <div className="max-w-md">
              <p className="text-[14px] font-medium text-fog-100">Seen-question memory</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-fog-400">
                Modulo remembers the {seenCount} question{seenCount === 1 ? "" : "s"} you have been
                served so retakes draw new ones. Clearing this lets the full bank be used again —
                but attempts built from questions you already know are weaker evidence.
              </p>
            </div>
            <ConfirmButton
              label="Clear seen questions"
              confirmLabel="Confirm clear"
              onConfirm={clearSeenQuestions}
            />
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4 pt-5">
            <div className="max-w-md">
              <p className="text-[14px] font-medium text-fog-100">Delete everything</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-fog-400">
                Removes every IQ attempt, every personality result, any unfinished test and the
                seen-question record. This cannot be undone.
              </p>
            </div>
            <ConfirmButton
              label="Clear all data"
              confirmLabel="Yes, delete everything"
              onConfirm={clearEverything}
              size="md"
            />
          </div>
        </Card>
      </section>

      <div className="mt-10">
        <Disclaimer>
          Modulo: Test is an unsupervised practice assessment, not a clinically validated IQ test,
          and the archetypes are our own construction rather than an established typology. Results
          are stored only in this browser.
        </Disclaimer>
      </div>
    </div>
  );
}
