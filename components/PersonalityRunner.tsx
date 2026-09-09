"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, Card, Eyebrow } from "./ui";
import { ARCHETYPE_4_LIST, NOT_A_TYPE_NOTE } from "@/lib/personality/archetypes4";
import { aspirationForForm, type AspirationChoice } from "@/lib/personality/aspiration";
import { scenariosForForm } from "@/lib/personality/scenarios";
import { scoreFourArchetypes } from "@/lib/personality/scoring";
import {
  addPersonalityResult,
  createId,
  loadStore,
  saveActivePersonality,
} from "@/lib/storage";

type FormLength = "core" | "deep";
type Section = "situations" | "priorities";
const SECTIONS: Section[] = ["situations", "priorities"];

const SECTION_META: Record<Section, { name: string; blurb: string }> = {
  situations: {
    name: "Situations",
    blurb:
      "Every option is something a reasonable man might do. Pick what you would actually do — not what reads best.",
  },
  priorities: {
    name: "Priorities",
    blurb:
      "Both options are creditable. Having to choose is the point: it is what separates what you value from what you do.",
  },
};

const SCENARIO_PAGE = 2;
const PRIORITY_PAGE = 4;

export function PersonalityRunner() {
  const router = useRouter();
  const [form, setForm] = useState<FormLength | null>(null);
  const [section, setSection] = useState<Section>("situations");
  const [scenarioChoices, setScenarioChoices] = useState<Record<string, string>>({});
  const [aspirationChoices, setAspirationChoices] = useState<Record<string, AspirationChoice>>({});
  const [page, setPage] = useState(0);
  const [saved, setSaved] = useState<{ form: FormLength; answered: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const active = loadStore().activePersonality;
    if (!active) return;
    const answered =
      Object.keys(active.scenarioChoices ?? {}).length +
      Object.keys(active.aspirationChoices ?? {}).length;
    if (answered === 0) return;
    const savedForm: FormLength = active.form === "deep" ? "deep" : "core";
    setSaved({ form: savedForm, answered });
    setScenarioChoices(active.scenarioChoices ?? {});
    setAspirationChoices(active.aspirationChoices ?? {});
    setSection(active.section === "priorities" ? "priorities" : "situations");
    setPage(active.index ?? 0);
  }, []);

  const scenarios = useMemo(() => (form ? scenariosForForm(form) : []), [form]);
  const priorities = useMemo(() => (form ? aspirationForForm(form) : []), [form]);

  const total = scenarios.length + priorities.length;
  const answered =
    Object.keys(scenarioChoices).length + Object.keys(aspirationChoices).length;

  const list = section === "situations" ? scenarios : priorities;
  const pageSize = section === "situations" ? SCENARIO_PAGE : PRIORITY_PAGE;
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const slice = list.slice(page * pageSize, page * pageSize + pageSize);

  const persist = useCallback(
    (next: {
      scenarioChoices?: Record<string, string>;
      aspirationChoices?: Record<string, AspirationChoice>;
      section?: Section;
      index?: number;
    }) => {
      if (!form) return;
      saveActivePersonality({
        form,
        scenarioChoices: next.scenarioChoices ?? scenarioChoices,
        aspirationChoices: next.aspirationChoices ?? aspirationChoices,
        section: next.section ?? section,
        index: next.index ?? page,
        startedAt: Date.now(),
      });
    },
    [aspirationChoices, form, page, scenarioChoices, section],
  );

  const pageComplete = slice.every((entry) => {
    const id = (entry as { id: string }).id;
    return section === "situations"
      ? scenarioChoices[id] !== undefined
      : aspirationChoices[id] !== undefined;
  });

  const sectionIndex = SECTIONS.indexOf(section);
  const isLast = sectionIndex === SECTIONS.length - 1 && page === pages - 1;

  const advance = () => {
    if (page < pages - 1) {
      setPage(page + 1);
      persist({ index: page + 1 });
    } else if (sectionIndex < SECTIONS.length - 1) {
      setSection("priorities");
      setPage(0);
      persist({ section: "priorities", index: 0 });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    if (page > 0) {
      setPage(page - 1);
      persist({ index: page - 1 });
    } else if (sectionIndex > 0) {
      const lastPage = Math.max(0, Math.ceil(scenarios.length / SCENARIO_PAGE) - 1);
      setSection("situations");
      setPage(lastPage);
      persist({ section: "situations", index: lastPage });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = () => {
    if (!form) return;
    try {
      const outcome = scoreFourArchetypes({
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
        traitScores: outcome.traitScores,
        primaryId: outcome.facet?.archetype.id ?? outcome.four.dominant,
        primaryMatch: outcome.four.byArchetype[outcome.four.dominant].access,
        secondaryId: outcome.four.supporting,
        secondaryMatch: outcome.four.byArchetype[outcome.four.supporting].access,
        confidencePercent: outcome.four.confidence.percent,
        confidenceMargin: outcome.four.confidence.margin,
        dominant: outcome.four.dominant,
        answered,
        total,
        scenarioChoices,
        aspirationChoices,
      });
      router.push(`/personality/result/${id}`);
    } catch {
      setError("Something went wrong while scoring. Your answers are still here — try again.");
    }
  };

  /* -------------------------------------------------------------- intro */

  if (!form) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <Eyebrow>King · Warrior · Magician · Lover</Eyebrow>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fog-100 sm:text-4xl">
          The four archetypes
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-fog-300">
          {NOT_A_TYPE_NOTE}
        </p>

        {saved ? (
          <div className="mt-8 rounded-2xl border border-jade-500/40 bg-jade-500/5 p-5">
            <p className="text-[14px] font-medium text-fog-100">You have an unfinished assessment</p>
            <p className="mt-1 text-[13px] text-fog-300">{saved.answered} questions answered.</p>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <Button onClick={() => setForm(saved.form)}>Resume</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setScenarioChoices({});
                  setAspirationChoices({});
                  setSection("situations");
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

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {(
            [
              {
                key: "core" as FormLength,
                name: "Core",
                count: "18 situations · 8 priorities",
                time: "about 6 minutes",
                blurb: "Enough to place you clearly. Confidence is reported with the band it earns.",
                recommended: true,
              },
              {
                key: "deep" as FormLength,
                name: "Deep",
                count: "34 situations · 12 priorities",
                time: "about 11 minutes",
                blurb: "Narrower confidence band and a firmer read on your sub-archetype and shadow.",
                recommended: false,
              },
            ] as const
          ).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setScenarioChoices({});
                setAspirationChoices({});
                setSection("situations");
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

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {ARCHETYPE_4_LIST.map((archetype) => (
            <div key={archetype.id} className="rounded-xl border border-ink-800 bg-ink-950/40 p-4">
              <p className="text-[14px] font-medium tracking-tight text-fog-100">
                {archetype.name}
              </p>
              <p className="mt-1 text-[11.5px] leading-snug text-fog-400">{archetype.tagline}</p>
              <p className="mt-2 text-[11px] leading-snug text-fog-400">
                <span className="text-fog-300">Shadows:</span> {archetype.shadow.active.name} ·{" "}
                {archetype.shadow.passive.name}
              </p>
            </div>
          ))}
        </div>

        <Card className="mt-6 p-6">
          <h2 className="text-[13px] font-semibold text-fog-100">What you get</h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-fog-300">
            <li>· How much you access each of the four, with a confidence percentage and range.</li>
            <li>· Which sub-archetype of your leading energy you actually expressed.</li>
            <li>· What each energy desires, fears, and looks like at work and in relationships.</li>
            <li>· Which shadow — active or passive — you fall into under pressure.</li>
            <li>· The gap between what you say you value and what you reach for.</li>
          </ul>
        </Card>
      </div>
    );
  }

  /* ------------------------------------------------------------ running */

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          {SECTIONS.map((s, i) => (
            <span
              key={s}
              className={`rounded-full px-2.5 py-1 text-[11.5px] ${
                s === section
                  ? "bg-jade-500/15 text-jade-400"
                  : i < sectionIndex
                    ? "text-fog-400"
                    : "text-fog-400 opacity-50"
              }`}
            >
              {SECTION_META[s].name}
            </span>
          ))}
        </div>
        <p className="tabular text-[13px] text-fog-300">
          {answered} / {total}
        </p>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full bg-jade-500 transition-[width] duration-300"
          style={{ width: `${(answered / total) * 100}%` }}
        />
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-fog-400">
        {SECTION_META[section].blurb}
      </p>

      {section === "situations" ? (
        <div className="mt-7 space-y-4">
          {(slice as typeof scenarios).map((scenario, i) => (
            <div key={scenario.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
              <p className="text-[12.5px] leading-relaxed text-fog-400">
                <span className="tabular mr-2">{page * SCENARIO_PAGE + i + 1}.</span>
                {scenario.setting}
              </p>
              <p className="mt-2 text-[15.5px] font-medium leading-relaxed text-fog-100">
                {scenario.prompt}
              </p>
              <div role="radiogroup" aria-label={scenario.setting} className="mt-4 space-y-2">
                {scenario.options.map((option, oi) => {
                  const selected = scenarioChoices[scenario.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        const next = { ...scenarioChoices, [scenario.id]: option.id };
                        setScenarioChoices(next);
                        persist({ scenarioChoices: next });
                      }}
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
      ) : (
        <div className="mt-7 space-y-3">
          {(slice as typeof priorities).map((item, i) => {
            const chosen = aspirationChoices[item.id];
            return (
              <div key={item.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
                <p className="text-[14px] font-medium text-fog-100">
                  <span className="tabular mr-2 text-fog-400">
                    {page * PRIORITY_PAGE + i + 1}.
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
                        onClick={() => {
                          const next = { ...aspirationChoices, [item.id]: side };
                          setAspirationChoices(next);
                          persist({ aspirationChoices: next });
                        }}
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
      )}

      {error ? <p className="mt-5 text-[13px] text-red-300">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={back} disabled={page === 0 && sectionIndex === 0}>
          Previous
        </Button>
        <p className="tabular text-[12.5px] text-fog-400">
          {SECTION_META[section].name} · {page + 1} of {pages}
        </p>
        {isLast ? (
          <Button onClick={submit} disabled={answered < total}>
            See my profile
          </Button>
        ) : (
          <Button onClick={advance} disabled={!pageComplete}>
            {page === pages - 1 ? "Next section" : "Next"}
          </Button>
        )}
      </div>

      {isLast && answered < total ? (
        <p className="mt-5 text-[12.5px] text-fog-400">
          {total - answered} question{total - answered === 1 ? "" : "s"} still unanswered.
        </p>
      ) : null}
    </div>
  );
}
