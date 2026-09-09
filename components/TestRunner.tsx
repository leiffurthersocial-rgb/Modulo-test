"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionView } from "./QuestionView";
import { Button, ButtonLink, Card, Eyebrow } from "./ui";
import { getQuestion } from "@/lib/iq/bank";
import { scoreAttempt } from "@/lib/iq/scoring";
import { selectQuestions } from "@/lib/iq/select";
import type { TestDefinition } from "@/lib/iq/tests";
import { CATEGORY_LABELS, type Question, type ResponseValue } from "@/lib/iq/types";
import { createRng, randomSeed } from "@/lib/rng";
import {
  addAttempt,
  createId,
  loadStore,
  markSeen,
  saveActiveIq,
  type ActiveIqSession,
} from "@/lib/storage";

type Phase = "intro" | "resume" | "running" | "review";

function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TestRunner({ test }: { test: TestDefinition }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [session, setSession] = useState<ActiveIqSession | null>(null);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  // A saved-but-unfinished paper for this test is offered on mount.
  useEffect(() => {
    const active = loadStore().activeIq;
    if (active && active.testId === test.id && active.questionIds.length > 0) {
      setSession(active);
      setIndex(Math.min(active.index, active.questionIds.length - 1));
      setPhase("resume");
    }
  }, [test.id]);

  const questions = useMemo<Question[]>(() => {
    if (!session) return [];
    return session.questionIds
      .map((id) => getQuestion(id))
      .filter((q): q is Question => Boolean(q));
  }, [session]);

  const secondsLeft =
    session?.expiresAt != null ? Math.max(0, Math.round((session.expiresAt - now) / 1000)) : null;

  const persist = useCallback((next: ActiveIqSession) => {
    setSession(next);
    saveActiveIq(next);
  }, []);

  const finish = useCallback(
    (active: ActiveIqSession, list: Question[]) => {
      if (submitting.current) return;
      submitting.current = true;
      try {
        const score = scoreAttempt(list, active.responses);
        const id = createId("iq");
        addAttempt({
          id,
          testId: test.id,
          testName: test.name,
          completedAt: Date.now(),
          durationSec: Math.round((Date.now() - active.startedAt) / 1000),
          iq: score.iq,
          low: score.low,
          high: score.high,
          standardError: score.standardError,
          percentile: score.percentile,
          band: score.band,
          correct: score.correct,
          total: score.total,
          accuracy: score.accuracy,
          noveltyRatio: active.noveltyRatio,
          categoryCount: new Set(list.map((q) => q.category)).size,
          categories: score.categories.map((c) => ({
            category: c.category,
            correct: c.correct,
            total: c.total,
            accuracy: c.accuracy,
            score: c.score,
          })),
          questionIds: list.map((q) => q.id),
          responses: active.responses,
        });
        router.push(`/results/${id}`);
      } catch {
        submitting.current = false;
        setError("Something went wrong while scoring this attempt. Your answers are still here — try submitting again.");
      }
    },
    [router, test.id, test.name],
  );

  // Timer tick, and auto-submit when a timed paper runs out.
  useEffect(() => {
    if (phase !== "running" || !session?.expiresAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [phase, session?.expiresAt]);

  useEffect(() => {
    if (phase !== "running" || !session?.expiresAt) return;
    if (Date.now() >= session.expiresAt) finish(session, questions);
  }, [now, phase, session, questions, finish]);

  const start = useCallback(() => {
    setError(null);
    try {
      const seed = randomSeed();
      const { questions: picked, noveltyRatio } = selectQuestions({
        test,
        seen: loadStore().seen,
        rng: createRng(seed),
      });
      if (picked.length === 0) {
        setError("No questions are available for this test right now.");
        return;
      }
      markSeen(picked.map((q) => q.id));
      const next: ActiveIqSession = {
        testId: test.id,
        seed,
        questionIds: picked.map((q) => q.id),
        responses: {},
        index: 0,
        startedAt: Date.now(),
        expiresAt: test.timeLimitSec ? Date.now() + test.timeLimitSec * 1000 : null,
        noveltyRatio,
      };
      setIndex(0);
      setNow(Date.now());
      persist(next);
      setPhase("running");
    } catch {
      setError("This test could not be started. Please reload and try again.");
    }
  }, [persist, test]);

  const discardAndRestart = useCallback(() => {
    saveActiveIq(null);
    setSession(null);
    start();
  }, [start]);

  const answer = useCallback(
    (value: ResponseValue) => {
      if (!session) return;
      const question = questions[index];
      if (!question) return;
      persist({ ...session, responses: { ...session.responses, [question.id]: value }, index });
    },
    [index, persist, questions, session],
  );

  const goRef = useRef<(delta: number) => void>(() => {});

  const go = useCallback(
    (delta: number) => {
      if (!session) return;
      const next = Math.min(questions.length - 1, Math.max(0, index + delta));
      setIndex(next);
      persist({ ...session, index: next });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [index, persist, questions.length, session],
  );

  goRef.current = go;

  // Keyboard control. Number keys choose an option, arrows move between
  // questions, Enter advances — so a full paper can be answered without a mouse.
  useEffect(() => {
    if (phase !== "running") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const question = questions[index];
      if (!question) return;

      // Inside a text field the arrows and digits belong to the field. Enter
      // still advances, which is what someone typing an answer expects.
      const target = event.target as HTMLElement | null;
      const inField =
        !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
      if (inField) {
        if (event.key === "Enter") {
          event.preventDefault();
          target.blur();
          if (index === questions.length - 1) setPhase("review");
          else goRef.current(1);
        }
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goRef.current(-1);
        return;
      }
      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        if (index === questions.length - 1) setPhase("review");
        else goRef.current(1);
        return;
      }

      if (question.answer.kind === "numeric") return;
      const optionCount = question.answer.options.length;
      const digit = Number(event.key);
      if (Number.isInteger(digit) && digit >= 1 && digit <= optionCount) {
        event.preventDefault();
        answer(digit - 1);
        return;
      }
      const letter = event.key.toLowerCase().charCodeAt(0) - 97;
      if (event.key.length === 1 && letter >= 0 && letter < optionCount) {
        event.preventDefault();
        answer(letter);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, index, phase, questions]);

  /* ------------------------------------------------------------ intro */

  if (phase === "intro" || phase === "resume") {
    const answered = session ? Object.values(session.responses).filter((v) => v !== null).length : 0;
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <Eyebrow>IQ test</Eyebrow>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fog-100 sm:text-4xl">{test.name}</h1>
        <p className="tabular mt-2 text-[13px] text-fog-400">{test.tagline}</p>
        <p className="mt-5 text-[15px] leading-relaxed text-fog-300">{test.description}</p>

        <Card className="mt-8 p-6">
          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-fog-400">Questions</dt>
              <dd className="tabular mt-1 text-xl font-semibold text-fog-100">{test.questionCount}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-fog-400">Time limit</dt>
              <dd className="tabular mt-1 text-xl font-semibold text-fog-100">
                {test.timeLimitSec ? `${Math.round(test.timeLimitSec / 60)} min` : "None"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-fog-400">Domains</dt>
              <dd className="mt-1 text-[13px] leading-snug text-fog-200">
                {test.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}
              </dd>
            </div>
          </dl>
          <ul className="mt-6 space-y-2 border-t border-ink-800 pt-5 text-[13px] leading-relaxed text-fog-300">
            <li>· You can move backwards and forwards, and change any answer before submitting.</li>
            <li>· Correct answers and explanations stay hidden until you submit.</li>
            <li>· Your progress is saved in this browser, so you can close the tab and resume.</li>
            <li>· Questions are drawn at random, and ones you have already seen are avoided.</li>
            <li>· Keyboard shortcuts: number keys select an answer, arrow keys move between questions.</li>
          </ul>
        </Card>

        {error ? <p className="mt-5 text-[13px] text-red-300">{error}</p> : null}

        {phase === "resume" && session ? (
          <div className="mt-8 rounded-2xl border border-sand-500/40 bg-sand-500/5 p-5">
            <p className="text-[14px] font-medium text-fog-100">You have an unfinished attempt</p>
            <p className="mt-1 text-[13px] text-fog-300">
              {answered} of {session.questionIds.length} questions answered
              {session.expiresAt && session.expiresAt < Date.now() ? " · the timer has since expired" : ""}.
            </p>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <Button
                onClick={() => {
                  setNow(Date.now());
                  setPhase("running");
                }}
              >
                Resume attempt
              </Button>
              <Button variant="secondary" onClick={discardAndRestart}>Start a fresh test</Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={start}>Begin test</Button>
            <ButtonLink href="/tests" size="lg" variant="secondary">Choose another test</ButtonLink>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------- running */

  const current = questions[index];
  if (!session || !current) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <p className="text-[15px] text-fog-300">This attempt could not be loaded.</p>
        <div className="mt-6 flex justify-center">
          <Button onClick={discardAndRestart}>Start a fresh test</Button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.entries(session.responses).filter(([, v]) => v !== null).length;
  const progress = ((index + 1) / questions.length) * 100;
  const lowTime = secondsLeft !== null && secondsLeft <= 60;

  if (phase === "review") {
    const unanswered = questions.filter((q) => (session.responses[q.id] ?? null) === null);
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <Eyebrow>Before you submit</Eyebrow>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fog-100">Review your paper</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-fog-300">
          {answeredCount} of {questions.length} answered.{" "}
          {unanswered.length > 0
            ? "Unanswered questions are marked incorrect, so a considered guess is better than a blank."
            : "Everything is answered."}
        </p>

        <div className="mt-7 grid grid-cols-6 gap-2 sm:grid-cols-8">
          {questions.map((q, i) => {
            const done = (session.responses[q.id] ?? null) !== null;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setIndex(i);
                  setPhase("running");
                }}
                className={`tabular flex h-10 items-center justify-center rounded-lg border text-[13px] transition-colors ${
                  done
                    ? "border-ink-600 bg-ink-800 text-fog-100"
                    : "border-dashed border-sand-500/50 text-sand-400"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => finish(session, questions)}>Submit and see results</Button>
          <Button size="lg" variant="secondary" onClick={() => setPhase("running")}>Keep working</Button>
        </div>
        {error ? <p className="mt-5 text-[13px] text-red-300">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">{test.name}</p>
          <p className="tabular mt-1 text-[13px] text-fog-300">
            Question {index + 1} of {questions.length} · {CATEGORY_LABELS[current.category]}
          </p>
        </div>
        {secondsLeft !== null ? (
          <div className={`tabular rounded-full border px-3.5 py-1.5 text-[13px] font-medium ${lowTime ? "border-red-800 bg-red-950/40 text-red-300" : "border-ink-700 text-fog-200"}`}>
            {formatClock(secondsLeft)}
          </div>
        ) : null}
      </div>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-ink-800">
        <div className="h-full rounded-full bg-sand-400 transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>

      <Card className="mt-7 p-6 sm:p-8">
        <QuestionView
          question={current}
          value={session.responses[current.id] ?? null}
          onChange={answer}
        />
      </Card>

      {error ? <p className="mt-5 text-[13px] text-red-300">{error}</p> : null}

      <div className="mt-7 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => go(-1)} disabled={index === 0}>Previous</Button>
        <p className="tabular hidden text-[12.5px] text-fog-400 sm:block">{answeredCount} answered</p>
        {index === questions.length - 1 ? (
          <Button onClick={() => setPhase("review")}>Review &amp; submit</Button>
        ) : (
          <Button onClick={() => go(1)}>Next</Button>
        )}
      </div>

      <div className="mt-7 flex flex-wrap gap-1.5" aria-hidden="true">
        {questions.map((q, i) => {
          const done = (session.responses[q.id] ?? null) !== null;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => go(i - index)}
              title={`Question ${i + 1}${done ? " — answered" : ""}`}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i === index
                  ? "bg-sand-400"
                  : done
                    ? "bg-ink-500 hover:bg-ink-600"
                    : "bg-ink-800 hover:bg-ink-700"
              }`}
            />
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={() => setPhase("review")}
          className="text-[12.5px] text-fog-400 underline underline-offset-4 hover:text-fog-200"
        >
          Jump to review &amp; submit
        </button>
        <p className="hidden text-[12px] text-fog-400 sm:block">
          Keyboard: <span className="text-fog-300">1–9</span> to answer,{" "}
          <span className="text-fog-300">← →</span> to move,{" "}
          <span className="text-fog-300">Enter</span> to continue
        </p>
      </div>
    </div>
  );
}
