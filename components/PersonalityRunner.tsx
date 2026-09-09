"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, Card, Eyebrow } from "./ui";
import { itemsForForm } from "@/lib/personality/items";
import { scorePersonality } from "@/lib/personality/scoring";
import {
  LIKERT_LABELS,
  LIKERT_VALUES,
  type FormLength,
  type LikertValue,
} from "@/lib/personality/types";
import {
  addPersonalityResult,
  createId,
  loadStore,
  saveActivePersonality,
} from "@/lib/storage";

const PAGE_SIZE = 6;

const SCALE_HINT: Record<LikertValue, string> = {
  1: "Not me",
  2: "Rarely",
  3: "Mixed",
  4: "Often",
  5: "Very me",
};

export function PersonalityRunner() {
  const router = useRouter();
  const [form, setForm] = useState<FormLength | null>(null);
  const [responses, setResponses] = useState<Record<string, LikertValue>>({});
  const [page, setPage] = useState(0);
  const [saved, setSaved] = useState<{ form: FormLength; answered: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const active = loadStore().activePersonality;
    if (active && Object.keys(active.responses).length > 0) {
      setSaved({ form: active.form, answered: Object.keys(active.responses).length });
      setResponses(active.responses);
      setPage(active.index);
    }
  }, []);

  const items = useMemo(() => (form ? itemsForForm(form) : []), [form]);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [items, page],
  );
  const answered = items.filter((i) => responses[i.id] !== undefined).length;
  const pageComplete = pageItems.every((i) => responses[i.id] !== undefined);

  const persist = useCallback(
    (next: Record<string, LikertValue>, index: number, which: FormLength) => {
      setResponses(next);
      saveActivePersonality({
        form: which,
        responses: next,
        index,
        startedAt: Date.now(),
      });
    },
    [],
  );

  const answer = useCallback(
    (id: string, value: LikertValue, rowIndex: number) => {
      if (!form) return;
      persist({ ...responses, [id]: value }, page, form);
      // Move focus to the next unanswered statement so the keyboard flow keeps going.
      const next = rowRefs.current[rowIndex + 1];
      if (next) next.focus();
    },
    [form, page, persist, responses],
  );

  const submit = () => {
    if (!form) return;
    try {
      const outcome = scorePersonality(responses, items);
      const id = createId("pers");
      addPersonalityResult({
        id,
        completedAt: Date.now(),
        form,
        qualityLevel: outcome.quality.level,
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

  /* ------------------------------------------------------------- chooser */

  if (!form) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <Eyebrow>Personality</Eyebrow>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fog-100 sm:text-4xl">
          The Modulo trait profile
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-fog-300">
          Rate each statement from strongly disagree to strongly agree. There are no right
          answers and no time limit — answer for how you usually are, not how you would like
          to be.
        </p>

        {saved ? (
          <div className="mt-8 rounded-2xl border border-jade-500/40 bg-jade-500/5 p-5">
            <p className="text-[14px] font-medium text-fog-100">You have an unfinished profile</p>
            <p className="mt-1 text-[13px] text-fog-300">
              {saved.answered} statements answered on the{" "}
              {saved.form === "short" ? "short" : "full"} form.
            </p>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <Button onClick={() => setForm(saved.form)}>Resume</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setResponses({});
                  setPage(0);
                  setSaved(null);
                  saveActivePersonality(null);
                }}
              >
                Start over
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {(
            [
              {
                key: "full" as FormLength,
                name: "Full form",
                count: 72,
                time: "10–12 minutes",
                blurb:
                  "Eight statements per trait. More items means each trait score is less sensitive to any one answer, and the consistency check has more to work with.",
                recommended: true,
              },
              {
                key: "short" as FormLength,
                name: "Short form",
                count: 36,
                time: "5–6 minutes",
                blurb:
                  "Four statements per trait, still balanced between forward and reversed wording. Faster, and correspondingly noisier per trait.",
                recommended: false,
              },
            ] as const
          ).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setResponses({});
                setPage(0);
                setForm(option.key);
              }}
              className="panel panel-hover rounded-2xl p-5 text-left"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[16px] font-semibold tracking-tight text-fog-100">
                  {option.name}
                </h2>
                {option.recommended ? (
                  <span className="rounded-full border border-jade-500/40 bg-jade-500/10 px-2 py-0.5 text-[10.5px] text-jade-400">
                    Recommended
                  </span>
                ) : null}
              </div>
              <p className="tabular mt-1 text-[12.5px] text-fog-400">
                {option.count} statements · {option.time}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-fog-300">{option.blurb}</p>
            </button>
          ))}
        </div>

        <Card className="mt-6 p-6">
          <h2 className="text-[13px] font-semibold text-fog-100">How this is built</h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-fog-300">
            <li>
              · Exactly half the statements for each trait are reverse-worded, so agreeing with
              everything cannot produce a high profile.
            </li>
            <li>
              · Statements are interleaved rather than grouped, so consecutive questions never
              measure the same trait.
            </li>
            <li>
              · Your answers are checked for straight-lining and self-contradiction, and the
              result says plainly when the data does not support a confident reading.
            </li>
            <li>· Progress is saved in this browser, so you can stop and come back.</li>
          </ul>
        </Card>

        <p className="mt-8 text-[12px] leading-relaxed text-fog-400">
          Modulo archetypes are created by Modulo. They are a readable summary of your trait
          profile — not a scientifically established personality typology.
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------- running */

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[12px] uppercase tracking-[0.14em] text-fog-400">
          {form === "short" ? "Short form" : "Full form"}
        </p>
        <p className="tabular text-[13px] text-fog-300">
          {answered} / {items.length}
        </p>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full bg-jade-500 transition-[width] duration-300"
          style={{ width: `${(answered / items.length) * 100}%` }}
        />
      </div>

      <div className="mt-8 space-y-3">
        {pageItems.map((item, i) => {
          const value = responses[item.id];
          return (
            <div
              key={item.id}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              tabIndex={0}
              role="group"
              aria-label={item.text}
              onKeyDown={(event) => {
                const digit = Number(event.key);
                if (Number.isInteger(digit) && digit >= 1 && digit <= 5) {
                  event.preventDefault();
                  answer(item.id, digit as LikertValue, i);
                }
              }}
              className={`rounded-2xl border p-5 transition-colors focus:outline-none focus-visible:border-jade-500 ${
                value === undefined
                  ? "border-ink-700 bg-ink-900"
                  : "border-ink-800 bg-ink-900/60"
              }`}
            >
              <p className="text-[15px] leading-relaxed text-fog-100">
                <span className="tabular mr-2 text-fog-400">
                  {page * PAGE_SIZE + i + 1}.
                </span>
                {item.text}
              </p>
              <div
                role="radiogroup"
                aria-label={`Response to: ${item.text}`}
                className="mt-4 grid grid-cols-5 gap-1.5"
              >
                {LIKERT_VALUES.map((option) => {
                  const selected = value === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={LIKERT_LABELS[option]}
                      title={LIKERT_LABELS[option]}
                      onClick={() => answer(item.id, option, i)}
                      className={`flex h-14 flex-col items-center justify-center gap-1 rounded-lg border text-[13px] font-medium transition-colors ${
                        selected
                          ? "border-jade-500 bg-jade-500/15 text-jade-400"
                          : "border-ink-700 bg-ink-900/50 text-fog-400 hover:border-ink-500 hover:text-fog-200"
                      }`}
                    >
                      <span className="tabular text-[14px]">{option}</span>
                      <span className="text-[9.5px] leading-none opacity-80">
                        {SCALE_HINT[option]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error ? <p className="mt-5 text-[13px] text-red-300">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </Button>
        <p className="tabular text-[12.5px] text-fog-400">
          Page {page + 1} of {pages}
        </p>
        {page === pages - 1 ? (
          <Button onClick={submit} disabled={answered < items.length}>
            See my archetype
          </Button>
        ) : (
          <Button
            onClick={() => {
              const next = page + 1;
              setPage(next);
              persist(responses, next, form);
              rowRefs.current = [];
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={!pageComplete}
          >
            Next
          </Button>
        )}
      </div>

      <p className="mt-5 text-[12px] text-fog-400">
        Keyboard: press <span className="text-fog-300">1</span>–
        <span className="text-fog-300">5</span> to answer the focused statement; focus moves on
        automatically.
        {page === pages - 1 && answered < items.length
          ? ` ${items.length - answered} statement${items.length - answered === 1 ? "" : "s"} still to answer.`
          : ""}
      </p>
    </div>
  );
}
