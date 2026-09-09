import type { Confidence } from "@/lib/personality/profile";

const TONE: Record<Confidence["label"], string> = {
  high: "border-jade-500/40 bg-jade-500/10 text-jade-400",
  good: "border-jade-500/30 bg-jade-500/5 text-jade-400",
  moderate: "border-sand-500/40 bg-sand-500/10 text-sand-400",
  low: "border-red-900/60 bg-red-950/25 text-red-300",
};

/** Confidence percentage with the approximate range it implies. */
export function ConfidenceBadge({
  confidence,
  compact = false,
}: {
  confidence: Confidence;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <span
        className={`tabular inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] ${TONE[confidence.label]}`}
        title={confidence.reasons.join(" ")}
      >
        {confidence.percent}% confidence
        <span className="opacity-70">±{Math.round(confidence.margin)}</span>
      </span>
    );
  }

  return (
    <div className={`rounded-xl border px-4 py-3 ${TONE[confidence.label]}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[13px] font-semibold">
          Confidence: {confidence.percent}%{" "}
          <span className="font-normal opacity-80">({confidence.label})</span>
        </p>
        <p className="tabular text-[12px] opacity-80">
          leading score {Math.round(confidence.low)}–{Math.round(confidence.high)} (±
          {Math.round(confidence.margin)})
        </p>
      </div>
      <ul className="mt-2 space-y-1">
        {confidence.reasons.map((reason) => (
          <li key={reason} className="text-[12px] leading-relaxed opacity-90">
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
