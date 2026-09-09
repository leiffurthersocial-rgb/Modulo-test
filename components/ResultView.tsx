"use client";

import Link from "next/link";
import { useMemo } from "react";
import { GlyphFigure } from "./GlyphFigure";
import { ScoreDial } from "./ScoreDial";
import { ButtonLink, Card, Disclaimer, Eyebrow, Meter } from "./ui";
import { getQuestion } from "@/lib/iq/bank";
import { BAND_BLURBS, DISCLAIMER, type Band } from "@/lib/iq/scoring";
import { stableEstimate, type AttemptSummary } from "@/lib/iq/stable";
import { CATEGORY_LABELS, isCorrect } from "@/lib/iq/types";
import { useStore } from "@/lib/useStore";

function toSummary(a: {
  id: string; testId: string; iq: number; total: number; categoryCount: number;
  noveltyRatio: number; completedAt: number;
}): AttemptSummary {
  return {
    id: a.id, testId: a.testId, iq: a.iq, itemCount: a.total,
    categoryCount: a.categoryCount, noveltyRatio: a.noveltyRatio, completedAt: a.completedAt,
  };
}

export function ResultView({ attemptId }: { attemptId: string }) {
  const store = useStore();
  const attempt = store.attempts.find((a) => a.id === attemptId);

  const history = useMemo(
    () => [...store.attempts].sort((a, b) => a.completedAt - b.completedAt),
    [store.attempts],
  );
  const stable = useMemo(() => stableEstimate(history.map(toSummary)), [history]);

  if (!attempt) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fog-100">Result not found</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-fog-300">
          Results live in this browser only. This one may have been deleted, or opened on a
          different device or browser.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/tests">Take a test</ButtonLink>
          <ButtonLink href="/history" variant="secondary">View history</ButtonLink>
        </div>
      </div>
    );
  }

  const questions = attempt.questionIds.map((id) => getQuestion(id));
  const index = history.findIndex((a) => a.id === attempt.id);
  const attemptNumber = index >= 0 ? index + 1 : history.length;

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <Eyebrow>{attempt.testName} · attempt {attemptNumber}</Eyebrow>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fog-100 sm:text-4xl">
        Your result
      </h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <Card className="flex items-center justify-center p-7">
          <ScoreDial iq={attempt.iq} percentile={attempt.percentile} />
        </Card>
        <Card className="p-7">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-fog-400">Percentile</p>
              <p className="tabular mt-1 text-2xl font-semibold text-fog-100">{attempt.percentile}</p>
              <p className="mt-0.5 text-[12px] text-fog-400">of the reference population</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-fog-400">Range</p>
              <p className="tabular mt-1 text-2xl font-semibold text-fog-100">{attempt.low}–{attempt.high}</p>
              <p className="mt-0.5 text-[12px] text-fog-400">68% confidence</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-fog-400">Band</p>
              <p className="mt-1 text-2xl font-semibold text-sand-400">{attempt.band}</p>
              <p className="mt-0.5 text-[12px] text-fog-400">{attempt.correct}/{attempt.total} correct</p>
            </div>
          </div>
          <p className="mt-6 border-t border-ink-800 pt-5 text-[13.5px] leading-relaxed text-fog-300">
            {BAND_BLURBS[attempt.band as Band] ??
              "Your score is an estimate produced by the Modulo scoring model."}
          </p>
        </Card>
      </div>

      {history.length > 1 && stable.iq !== null ? (
        <Card className="mt-6 p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[15.5px] font-semibold tracking-tight text-fog-100">
              Stable estimate across {history.length} attempts
            </h2>
            <span className="text-[12px] text-fog-400">{stable.confidence} confidence</span>
          </div>
          <p className="tabular mt-3 text-4xl font-semibold text-fog-100">{stable.iq}</p>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-fog-300">
            A weighted median of every attempt. Later retakes, narrower tests and papers built from
            questions you have already seen count for less, so this figure settles rather than
            climbing with each sitting. Your individual scores span {stable.spread} points.
          </p>
        </Card>
      ) : null}

      <Card className="mt-6 p-7">
        <h2 className="text-[15.5px] font-semibold tracking-tight text-fog-100">Performance by domain</h2>
        <div className="mt-5 space-y-4">
          {attempt.categories.map((category) => (
            <div key={category.category}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[13.5px] text-fog-200">{CATEGORY_LABELS[category.category]}</p>
                <p className="tabular text-[13px] text-fog-400">
                  {category.correct}/{category.total}
                  {category.score !== null ? ` · ${category.score}` : " · too few items"}
                </p>
              </div>
              <div className="mt-2">
                <Meter value={category.accuracy * 100} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-ink-800 pt-4 text-[12.5px] leading-relaxed text-fog-400">
          Domain figures on the IQ scale are shown only where an attempt contained at least three
          items in that domain. They are noisier than the overall estimate.
        </p>
      </Card>

      <Card className="mt-6 p-7">
        <h2 className="text-[15.5px] font-semibold tracking-tight text-fog-100">Answer review</h2>
        <p className="mt-2 text-[13px] text-fog-400">
          Now that the attempt is submitted, here is every question with the correct answer.
        </p>
        <ol className="mt-6 space-y-5">
          {questions.map((question, i) => {
            if (!question) return null;
            const given = attempt.responses[question.id] ?? null;
            const right = isCorrect(question, given);
            const spec = question.answer;
            const label = (value: number | null) => {
              if (value === null) return "Not answered";
              if (spec.kind === "numeric") return String(value);
              const option = spec.options[value];
              if (option === undefined) return "—";
              return typeof option === "string" ? option : `Option ${value + 1}`;
            };
            const correctValue = spec.kind === "numeric" ? spec.value : spec.correctIndex;

            return (
              <li key={question.id} className="rounded-xl border border-ink-800 p-4">
                <div className="flex items-start gap-3">
                  <span className={`tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-medium ${right ? "bg-jade-500/15 text-jade-400" : "bg-red-950/40 text-red-300"}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] leading-relaxed text-fog-100">{question.prompt}</p>
                    {question.stimulus?.kind === "text-sequence" ? (
                      <p className="tabular mt-2 text-[13px] text-fog-300">
                        {question.stimulus.items.join("  ·  ")}
                      </p>
                    ) : null}
                    {question.stimulus?.kind === "glyph-matrix" ? (
                      <div className="mt-3 inline-grid grid-cols-3 gap-1 rounded-lg border border-ink-800 p-1.5">
                        {question.stimulus.cells.map((cell, ci) =>
                          cell ? (
                            <div key={ci} className="text-fog-200"><GlyphFigure glyph={cell} size={34} /></div>
                          ) : (
                            <div key={ci} className="flex h-[34px] w-[34px] items-center justify-center text-sand-500">?</div>
                          ),
                        )}
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px]">
                      <span className={right ? "text-jade-400" : "text-red-300"}>
                        Your answer: {label(given)}
                      </span>
                      {!right ? (
                        <span className="text-fog-300">Correct: {label(correctValue)}</span>
                      ) : null}
                    </div>
                    {question.explanation ? (
                      <p className="mt-2 text-[12.5px] leading-relaxed text-fog-400">
                        {question.explanation}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/tests" size="lg">Take another test</ButtonLink>
        <ButtonLink href="/history" size="lg" variant="secondary">View full history</ButtonLink>
      </div>

      <div className="mt-8">
        <Disclaimer>
          {DISCLAIMER} Everything is stored in this browser and can be deleted from the{" "}
          <Link href="/history" className="underline underline-offset-2">history page</Link>.
        </Disclaimer>
      </div>
    </div>
  );
}
