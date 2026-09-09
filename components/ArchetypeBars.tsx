"use client";

import { ARCHETYPE_4_DEFINITIONS, type Archetype4 } from "@/lib/personality/archetypes4";
import type { ArchetypeReading } from "@/lib/personality/profile";

/**
 * Access against aspiration for each energy. Two marks on one track: the
 * distance between them is the point being made.
 */
export function ArchetypeBars({
  readings,
  dominant,
}: {
  readings: ArchetypeReading[];
  dominant: Archetype4;
}) {
  return (
    <div className="space-y-5">
      {readings.map((reading) => {
        const definition = ARCHETYPE_4_DEFINITIONS[reading.archetype];
        const lo = Math.min(reading.access, reading.aspiration);
        const hi = Math.max(reading.access, reading.aspiration);
        const isDominant = reading.archetype === dominant;
        return (
          <div key={reading.archetype}>
            <div className="flex items-baseline justify-between gap-4">
              <p
                className={`text-[13.5px] ${isDominant ? "font-semibold text-fog-100" : "text-fog-200"}`}
              >
                {definition.name}
              </p>
              <p className="tabular text-[12px] text-fog-400">
                <span className="text-jade-400">{Math.round(reading.access)}</span>
                <span className="mx-1 opacity-50">reach for</span>
                <span className="text-sand-400">{Math.round(reading.aspiration)}</span>
                <span className="ml-1 opacity-50">value</span>
              </p>
            </div>

            <div className="relative mt-2 h-5">
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-800" />
              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-600"
                style={{ left: `${lo}%`, width: `${Math.max(0.5, hi - lo)}%` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink-950 bg-jade-500"
                style={{ left: `${reading.access}%` }}
                title={`Reach for it: ${Math.round(reading.access)}`}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sand-400 bg-ink-950"
                style={{ left: `${reading.aspiration}%` }}
                title={`Say you value it: ${Math.round(reading.aspiration)}`}
              />
            </div>

            <p className="mt-1 text-[11.5px] text-fog-400">{definition.tagline}</p>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-800 pt-4 text-[11.5px] text-fog-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-jade-500" /> what you reach for
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-sand-400" /> what you say you value
        </span>
      </div>
    </div>
  );
}
