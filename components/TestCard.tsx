import Link from "next/link";
import type { TestDefinition } from "@/lib/iq/tests";

export function TestCard({ test }: { test: TestDefinition }) {
  return (
    <Link href={`/test/${test.id}`} className="panel panel-hover group flex flex-col rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[17px] font-semibold tracking-tight text-fog-100">{test.name}</h3>
          <p className="tabular mt-1 text-[12.5px] text-fog-400">{test.tagline}</p>
        </div>
        {test.adaptive ? (
          <span className="mt-0.5 shrink-0 rounded-full border border-sand-500/40 bg-sand-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sand-400">
            Adaptive
          </span>
        ) : null}
      </div>
      <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-fog-300">{test.description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-sand-400">
        Start test
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
          <path d="M2 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}
