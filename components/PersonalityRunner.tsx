"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, Card, Eyebrow } from "./ui";
import { PERSONALITY_ITEMS } from "@/lib/personality/items";
import { scorePersonality } from "@/lib/personality/scoring";
import { LIKERT_LABELS, type LikertValue } from "@/lib/personality/types";
import { addPersonalityResult, createId, loadStore, saveActivePersonality } from "@/lib/storage";

const PAGE_SIZE = 5;
const VALUES: LikertValue[] = [1, 2, 3, 4, 5];

export function PersonalityRunner() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [responses, setResponses] = useState<Record<string, LikertValue>>({});
  const [page, setPage] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const active = loadStore().activePersonality;
    if (active && Object.keys(active.responses).length > 0) {
      setResponses(active.responses);
      setPage(active.index);
      setHasSaved(true);
    }
  }, []);

  const pages = Math.ceil(PERSONALITY_ITEMS.length / PAGE_SIZE);
  const items = useMemo(
    () => PERSONALITY_ITEMS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [page],
  );
  const answered = Object.keys(responses).length;
  const pageComplete = items.every((item) => responses[item.id] !== undefined);

  const persist = useCallback((next: Record<string, LikertValue>, index: number) => {
    setResponses(next);
    saveActivePersonality({ responses: next, index, startedAt: Date.now() });
  }, []);

  const answer = (id: string, value: LikertValue) => {
    persist({ ...responses, [id]: value }, page);
  };

  const submit = () => {
    try {
      const outcome = scorePersonality(responses);
      const id = createId("pers");
      addPersonalityResult({
        id,
        completedAt: Date.now(),
        traitScores: outcome.traitScores,
        primaryId: outcome.primary.archetype.id,
        primaryMatch: outcome.primary.match,
        secondaryId: outcome.secondary.archetype.id,
        secondaryMatch: outcome.secondary.match,
        answered: outcome.answered,
        total: outcome.total,
        responses,
      });
      router.push(`/personality/result/${id}`);
    } catch {
      setError("Something went wrong while scoring. Your answers are still here — try again.");
    }
  };

  if (!started && !hasSaved) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <Eyebrow>Personality</Eyebrow>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fog-100 sm:text-4xl">
          The Modulo trait profile
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-fog-300">
          {PERSONALITY_ITEMS.length} statements, rated from strongly disagree to strongly agree.
          There are no right answers and no time limit — answer for how you usually are, not how
          you would like to be.
        </p>
        <Card className="mt-8 p-6">
          <ul className="space-y-2 text-[13.5px] leading-relaxed text-fog-300">
            <li>· Nine traits are scored, each from five statements.</li>
            <li>· Some statements are reverse-keyed, so agreeing with everything will not maximise your profile.</li>
            <li>· Your primary and secondary archetypes come from the shape of the whole profile.</li>
            <li>· Progress is saved in this browser, so you can stop and come back.</li>
          </ul>
        </Card>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => setStarted(true)}>Begin the profile</Button>
          <ButtonLink href="/tests" size="lg" variant="secondary">Take an IQ test instead</ButtonLink>
        </div>
        <p className="mt-8 text-[12px] leading-relaxed text-fog-400">
          Modulo archetypes are created by Modulo. They are a readable summary of your trait
          profile — not a scientifically established personality typology.
        </p>
      </div>
    );
  }

  if (!started && hasSaved) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <Eyebrow>Personality</Eyebrow>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fog-100">Continue where you left off</h1>
        <p className="mt-4 text-[14.5px] text-fog-300">
          {answered} of {PERSONALITY_ITEMS.length} statements answered.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => setStarted(true)}>Resume</Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              setResponses({});
              setPage(0);
              saveActivePersonality(null);
              setStarted(true);
            }}
          >
            Start over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">Trait profile</p>
        <p className="tabular text-[13px] text-fog-300">{answered} / {PERSONALITY_ITEMS.length}</p>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink-800">
        <div className="h-full rounded-full bg-jade-500 transition-[width] duration-300"
          style={{ width: `${(answered / PERSONALITY_ITEMS.length) * 100}%` }} />
      </div>

      <div className="mt-8 space-y-4">
        {items.map((item, i) => (
          <Card key={item.id} className="p-5">
            <p className="text-[15px] leading-relaxed text-fog-100">
              <span className="tabular mr-2 text-fog-400">{page * PAGE_SIZE + i + 1}.</span>
              {item.text}
            </p>
            <div className="mt-4 grid grid-cols-5 gap-1.5">
              {VALUES.map((value) => {
                const selected = responses[item.id] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    aria-label={LIKERT_LABELS[value]}
                    title={LIKERT_LABELS[value]}
                    onClick={() => answer(item.id, value)}
                    className={`flex h-11 items-center justify-center rounded-lg border text-[13px] font-medium transition-colors ${
                      selected
                        ? "border-jade-500 bg-jade-500/15 text-jade-400"
                        : "border-ink-700 bg-ink-900/50 text-fog-400 hover:border-ink-500 hover:text-fog-200"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-fog-400">
              <span>Strongly disagree</span>
              <span>Strongly agree</span>
            </div>
          </Card>
        ))}
      </div>

      {error ? <p className="mt-5 text-[13px] text-red-300">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
          Previous
        </Button>
        <p className="tabular text-[12.5px] text-fog-400">Page {page + 1} of {pages}</p>
        {page === pages - 1 ? (
          <Button onClick={submit} disabled={answered < PERSONALITY_ITEMS.length}>
            See my archetype
          </Button>
        ) : (
          <Button
            onClick={() => {
              const next = page + 1;
              setPage(next);
              persist(responses, next);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={!pageComplete}
          >
            Next
          </Button>
        )}
      </div>
      {page === pages - 1 && answered < PERSONALITY_ITEMS.length ? (
        <p className="mt-4 text-[12.5px] text-fog-400">
          Answer all {PERSONALITY_ITEMS.length} statements to get a result — every trait needs its
          full set of items.
        </p>
      ) : null}
    </div>
  );
}
