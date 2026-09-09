"use client";

import { PILLAR_DEFINITIONS, type Pillar } from "@/lib/personality/pillars";
import type { PillarReading } from "@/lib/personality/profile";

/**
 * Expression against aspiration for each pillar. The two marks on one track are
 * the point: the distance between them is what the taker is being told.
 */
export function PillarChart({ readings }: { readings: PillarReading[] }) {
  return (
    <div className="space-y-5">
      {readings.map((reading) => {
        const definition = PILLAR_DEFINITIONS[reading.pillar as Pillar];
        const gap = reading.gap;
        const lo = Math.min(reading.expression, reading.aspiration);
        const hi = Math.max(reading.expression, reading.aspiration);
        return (
          <div key={reading.pillar}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[13.5px] font-medium text-fog-100">{definition.name}</p>
              <p className="tabular text-[12.5px] text-fog-400">
                {Math.round(reading.expression)}
                <span className="mx-1.5 opacity-50">now</span>
                <span className="text-fog-200">{Math.round(reading.aspiration)}</span>
                <span className="ml-1 opacity-50">valued</span>
                <span
                  className={`ml-2.5 ${gap > 8 ? "text-sand-400" : gap < -8 ? "text-jade-400" : "text-fog-400"}`}
                >
                  {gap > 0 ? "+" : ""}
                  {Math.round(gap)}
                </span>
              </p>
            </div>

            <div className="relative mt-2 h-6">
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-800" />
              {/* Span between what you do and what you value. */}
              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-600"
                style={{ left: `${lo}%`, width: `${Math.max(0.5, hi - lo)}%` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink-950 bg-jade-500"
                style={{ left: `${reading.expression}%` }}
                title={`Currently expressed: ${Math.round(reading.expression)}`}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sand-400 bg-ink-950"
                style={{ left: `${reading.aspiration}%` }}
                title={`Valued: ${Math.round(reading.aspiration)}`}
              />
            </div>

            <p className="mt-1 text-[11.5px] text-fog-400">{definition.tagline}</p>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-800 pt-4 text-[11.5px] text-fog-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-jade-500" /> how you currently act
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-sand-400" /> what you say you value
        </span>
      </div>
    </div>
  );
}
