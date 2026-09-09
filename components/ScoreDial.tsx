export function ScoreDial({
  iq,
  percentile,
  size = 200,
}: {
  iq: number;
  percentile: number;
  size?: number;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, percentile / 100));
  const stroke = circumference * 0.75;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="-rotate-[135deg]">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-ink-700)" strokeWidth="6"
          strokeDasharray={`${stroke} ${circumference}`} strokeLinecap="round" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-sand-500)" strokeWidth="6"
          strokeDasharray={`${stroke * progress} ${circumference}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-5xl font-semibold tracking-tight text-fog-100">{iq}</span>
        <span className="mt-1 text-[11px] uppercase tracking-[0.16em] text-fog-400">estimated IQ</span>
      </div>
    </div>
  );
}
