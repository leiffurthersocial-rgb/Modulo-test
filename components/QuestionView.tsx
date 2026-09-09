"use client";

import { GlyphFigure } from "./GlyphFigure";
import type { Question, ResponseValue } from "@/lib/iq/types";

function OptionShell({
  selected,
  onClick,
  children,
  letter,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  letter: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      onClick={onClick}
      aria-checked={selected}
      className={`group flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-colors ${
        selected
          ? "border-sand-500 bg-sand-500/10"
          : "border-ink-700 bg-ink-900/50 hover:border-ink-500 hover:bg-ink-850"
      }`}
    >
      <span
        className={`tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[12px] font-medium ${
          selected ? "border-sand-500 bg-sand-400 text-ink-950" : "border-ink-600 text-fog-400"
        }`}
      >
        {letter}
      </span>
      {children}
    </button>
  );
}

export function QuestionView({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: ResponseValue;
  onChange: (value: ResponseValue) => void;
}) {
  const letters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div>
      <h2 className="text-[17px] font-medium leading-relaxed tracking-tight text-fog-100 sm:text-[19px]">
        {question.prompt}
      </h2>

      {question.stimulus?.kind === "text-sequence" ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {question.stimulus.items.map((item, index) => (
            <span
              key={index}
              className={`tabular flex min-w-[3.25rem] items-center justify-center rounded-lg border px-3 py-2.5 text-[15px] font-medium ${
                item === "?"
                  ? "border-dashed border-sand-500/60 text-sand-400"
                  : "border-ink-700 bg-ink-900 text-fog-100"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {question.stimulus?.kind === "text-block" ? (
        <p className="mt-5 rounded-xl border border-ink-700 bg-ink-900 p-4 text-[14px] leading-relaxed text-fog-200">
          {question.stimulus.text}
        </p>
      ) : null}

      {question.stimulus?.kind === "glyph-row" ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {question.stimulus.glyphs.map((glyph, index) => (
            <div key={index} className="rounded-xl border border-ink-700 bg-ink-900 p-2 text-fog-100">
              <GlyphFigure glyph={glyph} size={68} />
            </div>
          ))}
        </div>
      ) : null}

      {question.stimulus?.kind === "glyph-matrix" ? (
        <div className="mt-6 inline-grid grid-cols-3 gap-1.5 rounded-2xl border border-ink-700 bg-ink-900 p-2">
          {question.stimulus.cells.map((cell, index) =>
            cell ? (
              <div key={index} className="rounded-lg bg-ink-850 p-1 text-fog-100">
                <GlyphFigure glyph={cell} size={62} />
              </div>
            ) : (
              <div
                key={index}
                className="flex h-[70px] w-[70px] items-center justify-center rounded-lg border border-dashed border-sand-500/60 text-2xl text-sand-500"
              >
                ?
              </div>
            ),
          )}
        </div>
      ) : null}

      <div className="mt-7">
        {question.answer.kind === "numeric" ? (
          <div className="max-w-xs">
            <label htmlFor={`answer-${question.id}`} className="text-[12px] uppercase tracking-[0.14em] text-fog-400">
              Your answer
            </label>
            <input
              id={`answer-${question.id}`}
              type="number"
              inputMode="decimal"
              value={value === null ? "" : value}
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "") return onChange(null);
                const parsed = Number(raw);
                onChange(Number.isFinite(parsed) ? parsed : null);
              }}
              placeholder="Type a number"
              className="tabular mt-2 w-full rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-[16px] text-fog-100 placeholder:text-fog-400 focus:border-sand-500 focus:outline-none"
            />
          </div>
        ) : question.answer.kind === "glyph-choice" ? (
          <div role="radiogroup" aria-label="Answer options" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {question.answer.options.map((glyph, index) => (
              <button
                key={index}
                type="button"
                role="radio"
                aria-checked={value === index}
                aria-label={`Option ${letters[index]}`}
                onClick={() => onChange(value === index ? null : index)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${
                  value === index
                    ? "border-sand-500 bg-sand-500/10 text-sand-300"
                    : "border-ink-700 bg-ink-900/50 text-fog-100 hover:border-ink-500 hover:bg-ink-850"
                }`}
              >
                <GlyphFigure glyph={glyph} size={64} />
                <span className="text-[11px] font-medium text-fog-400">{letters[index]}</span>
              </button>
            ))}
          </div>
        ) : (
          <div role="radiogroup" aria-label="Answer options" className="space-y-2.5">
            {question.answer.options.map((option, index) => (
              <OptionShell
                key={index}
                letter={letters[index] ?? String(index + 1)}
                selected={value === index}
                onClick={() => onChange(value === index ? null : index)}
              >
                <span className="text-[14.5px] leading-relaxed text-fog-100">{option}</span>
              </OptionShell>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
