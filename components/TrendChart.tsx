"use client";

/**
 * Attempt scores over time against the stable estimate. Deliberately plain: the
 * point is to show whether retakes are drifting upward, so the stable line is
 * the reference and the individual attempts are the scatter around it.
 */
export function TrendChart({
  scores,
  stable,
}: {
  scores: { iq: number; label: string }[];
  stable: number | null;
}) {
  if (scores.length < 2) return null;

  const values = scores.map((s) => s.iq);
  const min = Math.min(...values, stable ?? 100) - 8;
  const max = Math.max(...values, stable ?? 100) + 8;
  const span = Math.max(1, max - min);

  const W = 100;
  const H = 40;
  const x = (i: number) => (scores.length === 1 ? W / 2 : (i / (scores.length - 1)) * W);
  const y = (iq: number) => H - ((iq - min) / span) * H;

  const path = scores.map((s, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(s.iq)}`).join(" ");

  return (
    <figure className="mt-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-24 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Attempt scores over time: ${scores.map((s) => s.iq).join(", ")}${
          stable !== null ? `. Stable estimate ${stable}.` : ""
        }`}
      >
        {stable !== null ? (
          <line
            x1="0"
            x2={W}
            y1={y(stable)}
            y2={y(stable)}
            stroke="var(--color-sand-500)"
            strokeWidth="0.6"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        <path
          d={path}
          fill="none"
          stroke="var(--color-fog-300)"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {scores.map((s, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(s.iq)}
            r="1.6"
            fill="var(--color-ink-950)"
            stroke="var(--color-fog-200)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-fog-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-px w-4 bg-fog-300" /> individual attempts, oldest first
        </span>
        {stable !== null ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-px w-4 border-t border-dashed border-sand-500" /> stable estimate
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
