"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, Card, Eyebrow } from "./ui";
import { aspirationForForm, type AspirationChoice } from "@/lib/personality/aspiration";
import { itemsForForm } from "@/lib/personality/items";
import { scenariosForForm } from "@/lib/personality/scenarios";
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
const SCENARIO_PAGE_SIZE = 2;
const ASPIRATION_PAGE_SIZE = 3;

type Section = "statements" | "scenarios" | "priorities";
const SECTIONS: Section[] = ["statements", "scenarios", "priorities"];

const SECTION_META: Record<Section, { name: string; blurb: string }> = {
  statements: {
    name: "Statements",
    blurb: "How you see yourself. Answer for how you usually are, not how you would like to be.",
  },
  scenarios: {
    name: "Situations",
    blurb:
      "Every option is something a reasonable man might do. Pick what you would actually do, not what reads best.",
  },
  priorities: {
    name: "Priorities",
    blurb:
      "Both options are creditable. Choosing between them is the point — it is what tells us what you are aiming at.",
  },
};

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
  const [section, setSection] = useState<Section>("statements");
  const [responses, setResponses] = useState<Record<string, LikertValue>>({});
  const [scenarioChoices, setScenarioChoices] = useState<Record<string, string>>({});
  const [aspirationChoices, setAspirationChoices] = useState<Record<string, AspirationChoice>>({});
  const [page, setPage] = useState(0);
  const [saved, setSaved] = useState<{ form: FormLength; answered: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const active = loadStore().activePersonality;
    if (!active) return;
    const answered =
      Object.keys(active.responses ?? {}).length +
      Object.keys(active.scenarioChoices ?? {}).length +
      Object.keys(active.aspirationChoices ?? {}).length;
    if (answered === 0) return;
    setSaved({ form: active.form, answered });
    setResponses(active.responses ?? {});
    setScenarioChoices(active.scenarioChoices ?? {});
    setAspirationChoices(active.aspirationChoices ?? {});
    setSection(active.section ?? "statements");
    setPage(active.index ?? 0);
  }, []);

  const items = useMemo(() => (form ? itemsForForm(form) : []), [form]);
  const scenarios = useMemo(() => (form ? scenariosForForm(form) : []), [form]);
  const priorities = useMemo(() => (form ? aspirationForForm(form) : []), [form]);

  const totalQuestions = items.length + scenarios.length + priorities.length;
  const totalAnswered =
    Object.keys(responses).length +
    Object.keys(scenarioChoices).length +
    Object.keys(aspirationChoices).length;

  const sectionItems =
    section === "statements" ? items : section === "scenarios" ? scenarios : priorities;
  const pageSize =
    section === "statements"
      ? PAGE_SIZE
      : section === "scenarios"
        ? SCENARIO_PAGE_SIZE
        : ASPIRATION_PAGE_SIZE;
  const pages = Math.max(1, Math.ceil(sectionItems.length / pageSize));

  const persist = useCallback(
    (next: {
      responses?: Record<string, LikertValue>;
      scenarioChoices?: Record<string, string>;
      aspirationChoices?: Record<string, AspirationChoice>;
      section?: Section;
      index?: number;
    }) => {
      if (!form) return;
      saveActivePersonality({
        form,
        responses: next.responses ?? responses,
        scenarioChoices: next.scenarioChoices ?? scenarioChoices,
        aspirationChoices: next.aspirationChoices ?? aspirationChoices,
        section: next.section ?? section,
        index: next.index ?? page,
        startedAt: Date.now(),
      });
    },
    [aspirationChoices, form, page, responses, scenarioChoices, section],
  );

  const answerStatement = useCallback(
    (id: string, value: LikertValue, rowIndex: number) => {
      const next = { ...responses, [id]: value };
      setResponses(next);
      persist({ responses: next });
      rowRefs.current[rowIndex + 1]?.focus();
    },
    [persist, responses],
  );

  const answerScenario = (scenarioId: string, optionId: string) => {
    const next = { ...scenarioChoices, [scenarioId]: optionId };
    setScenarioChoices(next);
    persist({ scenarioChoices: next });
  };

  const answerPriority = (itemId: string, side: AspirationChoice) => {
    const next = { ...aspirationChoices, [itemId]: side };
    setAspirationChoices(next);
    persist({ aspirationChoices: next });
  };

  const pageSlice = sectionItems.slice(page * pageSize, page * pageSize + pageSize);
  const pageComplete = pageSlice.every((entry) => {
    const id = (entry as { id: string }).id;
    if (section === "statements") return responses[id] !== undefined;
    if (section === "scenarios") return scenarioChoices[id] !== undefined;
    return aspirationChoices[id] !== undefined;
  });

  const sectionIndex = SECTIONS.indexOf(section);
  const isLastSection = sectionIndex === SECTIONS.length - 1;
  const isLastPage = page === pages - 1;
  const complete = totalAnswered >= totalQuestions;

  const advance = () => {
    if (!isLastPage) {
      const next = page + 1;
      setPage(next);
      persist({ index: next });
    } else if (!isLastSection) {
      const nextSection = SECTIONS[sectionIndex + 1] as Section;
      setSection(nextSection);
      setPage(0);
      persist({ section: nextSection, index: 0 });
    }
    rowRefs.current = [];
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    if (page > 0) {
      const next = page - 1;
      setPage(next);
      persist({ index: next });
    } else if (sectionIndex > 0) {
      const prevSection = SECTIONS[sectionIndex - 1] as Section;
      const prevItems =
        prevSection === "statements" ? items : prevSection === "scenarios" ? scenarios : priorities;
      const prevSize =
        prevSection === "statements"
          ? PAGE_SIZE
          : prevSection === "scenarios"
            ? SCENARIO_PAGE_SIZE
            : ASPIRATION_PAGE_SIZE;
      const lastPage = Math.max(0, Math.ceil(prevItems.length / prevSize) - 1);
      setSection(prevSection);
      setPage(lastPage);
      persist({ section: prevSection, index: lastPage });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = () => {
    if (!form) return;
    try {
      const outcome = scorePersonality(responses, items, {
        scenarioChoices,
        scenarios,
        aspirationChoices,
        aspirationItems: priorities,
      });
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
        answered: totalAnswered,
        total: totalQuestions,
        responses,
        scenarioChoices,
        aspirationChoices,
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
          The four pillars
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-fog-300">
          Three sections, measuring three different things: how you describe yourself, what you
          would actually do in a given situation, and what you would refuse to give up. Where
          those three disagree is the most useful part of the result.
        </p>

        {saved ? (
          <div className="mt-8 rounded-2xl border border-jade-500/40 bg-jade-500/5 p-5">
            <p className="text-[14px] font-medium text-fog-100">You have an unfinished profile</p>
            <p className="mt-1 text-[13px] text-fog-300">
              {saved.answered} questions answered on the {saved.form === "short" ? "short" : "full"} form.
            </p>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <Button onClick={() => setForm(saved.form)}>Resume</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setResponses({});
                  setScenarioChoices({});
                  setAspirationChoices({});
                  setSection("statements");
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
                count: "72 statements · 20 situations · 12 priorities",
                time: "18–22 minutes",
                blurb:
                  "Eight statements per trait and the complete situational set. The pressure scenarios that read your shadow only work in numbers, so this is the version worth doing.",
                recommended: true,
              },
              {
                key: "short" as FormLength,
                name: "Short form",
                count: "36 statements · 10 situations · 6 priorities",
                time: "9–11 minutes",
                blurb:
                  "Balanced but thinner. Enough for a reliable pillar profile; the shadow reading and per-trait scores are correspondingly noisier.",
                recommended: false,
              },
            ] as const
          ).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setResponses({});
                setScenarioChoices({});
                setAspirationChoices({});
                setSection("statements");
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
              <p className="tabular mt-1 text-[12px] text-fog-400">{option.count}</p>
              <p className="tabular mt-0.5 text-[12px] text-fog-400">{option.time}</p>
              <p className="mt-3 text-[13px] leading-relaxed text-fog-300">{option.blurb}</p>
            </button>
          ))}
        </div>

        <Card className="mt-6 p-6">
          <h2 className="text-[13px] font-semibold text-fog-100">Why three sections</h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-fog-300">
            <li>
              · A statement like &ldquo;I take charge&rdquo; tells you exactly what it measures, so
              it records self-image as much as behaviour. Situations with four defensible answers
              do not.
            </li>
            <li>
              · You can agree with every statement. You cannot pick every option — so the
              situational sections force real trade-offs.
            </li>
            <li>
              · Priorities are pairs of equally creditable things. When both look good, the choice
              cannot be explained by wanting to look good.
            </li>
            <li>· Progress is saved in this browser, so you can stop and come back.</li>
          </ul>
        </Card>

        <p className="mt-8 text-[12px] leading-relaxed text-fog-400">
          The four-pillar structure follows the King / Warrior / Magician / Lover model described
          by Moore and Gillette (1990). The content and scoring here are Modulo&rsquo;s own, and
          neither the framework nor this implementation is an empirically validated instrument.
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------- running */

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {SECTIONS.map((s, i) => (
            <span
              key={s}
              className={`rounded-full px-2.5 py-1 text-[11.5px] ${
                s === section
                  ? "bg-jade-500/15 text-jade-400"
                  : i < sectionIndex
                    ? "text-fog-400"
                    : "text-fog-500 opacity-60"
              }`}
            >
              {SECTION_META[s].name}
            </span>
          ))}
        </div>
        <p className="tabular text-[13px] text-fog-300">
          {totalAnswered} / {totalQuestions}
        </p>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full bg-jade-500 transition-[width] duration-300"
          style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }}
        />
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-fog-400">
        {SECTION_META[section].blurb}
      </p>

      {section === "statements" ? (
        <div className="mt-7 space-y-3">
          {(pageSlice as typeof items).map((item, i) => {
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
                    answerStatement(item.id, digit as LikertValue, i);
                  }
                }}
                className="rounded-2xl border border-ink-700 bg-ink-900 p-5 focus:outline-none focus-visible:border-jade-500"
              >
                <p className="text-[15px] leading-relaxed text-fog-100">
                  <span className="tabular mr-2 text-fog-400">{page * PAGE_SIZE + i + 1}.</span>
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
                        onClick={() => answerStatement(item.id, option, i)}
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
      ) : null}

      {section === "scenarios" ? (
        <div className="mt-7 space-y-4">
          {(pageSlice as typeof scenarios).map((scenario, i) => (
            <div key={scenario.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
              <p className="text-[12.5px] leading-relaxed text-fog-400">
                <span className="tabular mr-2">{page * SCENARIO_PAGE_SIZE + i + 1}.</span>
                {scenario.setting}
              </p>
              <p className="mt-2 text-[15.5px] font-medium leading-relaxed text-fog-100">
                {scenario.prompt}
              </p>
              <div
                role="radiogroup"
                aria-label={scenario.setting}
                className="mt-4 space-y-2"
              >
                {scenario.options.map((option, oi) => {
                  const selected = scenarioChoices[scenario.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => answerScenario(scenario.id, option.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                        selected
                          ? "border-jade-500 bg-jade-500/10"
                          : "border-ink-700 bg-ink-900/50 hover:border-ink-500 hover:bg-ink-850"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[11px] font-medium ${
                          selected
                            ? "border-jade-500 bg-jade-500 text-ink-950"
                            : "border-ink-600 text-fog-400"
                        }`}
                      >
                        {["A", "B", "C", "D"][oi]}
                      </span>
                      <span className="text-[14px] leading-relaxed text-fog-100">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {section === "priorities" ? (
        <div className="mt-7 space-y-4">
          {(pageSlice as typeof priorities).map((item, i) => {
            const chosen = aspirationChoices[item.id];
            return (
              <div key={item.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
                <p className="text-[14px] font-medium text-fog-100">
                  <span className="tabular mr-2 text-fog-400">
                    {page * ASPIRATION_PAGE_SIZE + i + 1}.
                  </span>
                  {item.prompt}
                </p>
                <div
                  role="radiogroup"
                  aria-label={item.prompt}
                  className="mt-3.5 grid gap-2 sm:grid-cols-2"
                >
                  {(["left", "right"] as AspirationChoice[]).map((side) => {
                    const option = side === "left" ? item.left : item.right;
                    const selected = chosen === side;
                    return (
                      <button
                        key={side}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => answerPriority(item.id, side)}
                        className={`rounded-xl border p-3.5 text-left text-[13.5px] leading-relaxed transition-colors ${
                          selected
                            ? "border-jade-500 bg-jade-500/10 text-fog-100"
                            : "border-ink-700 bg-ink-900/50 text-fog-200 hover:border-ink-500 hover:bg-ink-850"
                        }`}
                      >
                        {option.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {error ? <p className="mt-5 text-[13px] text-red-300">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={back}
          disabled={page === 0 && sectionIndex === 0}
        >
          Previous
        </Button>
        <p className="tabular text-[12.5px] text-fog-400">
          {SECTION_META[section].name} · {page + 1} of {pages}
        </p>
        {isLastSection && isLastPage ? (
          <Button onClick={submit} disabled={!complete}>
            See my profile
          </Button>
        ) : (
          <Button onClick={advance} disabled={!pageComplete}>
            {isLastPage ? "Next section" : "Next"}
          </Button>
        )}
      </div>

      {section === "statements" ? (
        <p className="mt-5 text-[12px] text-fog-400">
          Keyboard: press <span className="text-fog-300">1</span>–
          <span className="text-fog-300">5</span> to answer the focused statement; focus moves on
          automatically.
        </p>
      ) : null}
      {isLastSection && isLastPage && !complete ? (
        <p className="mt-5 text-[12.5px] text-fog-400">
          {totalQuestions - totalAnswered} question
          {totalQuestions - totalAnswered === 1 ? "" : "s"} still unanswered across the three
          sections.
        </p>
      ) : null}
    </div>
  );
}
