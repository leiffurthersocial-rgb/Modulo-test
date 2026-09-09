export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  const dim = size === "lg" ? 30 : 22;
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="1" y="1" width="22" height="22" rx="6" stroke="var(--color-sand-500)" strokeWidth="1.4" />
        <circle cx="8.5" cy="8.5" r="2.6" fill="var(--color-sand-500)" />
        <rect x="13" y="13" width="5.4" height="5.4" rx="1.2" fill="var(--color-jade-500)" />
        <path d="M13.4 8.5h5M8.5 13.2v5" stroke="var(--color-fog-400)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <span
        className={`font-semibold tracking-[-0.02em] text-fog-100 ${
          size === "lg" ? "text-xl" : "text-[15px]"
        }`}
      >
        Modulo<span className="text-sand-400">: Test</span>
      </span>
    </span>
  );
}
