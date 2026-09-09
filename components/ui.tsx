import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium tracking-tight transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-sand-400 text-ink-950 hover:bg-sand-300 disabled:hover:bg-sand-400 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset]",
  secondary:
    "border border-ink-600 bg-ink-850 text-fog-100 hover:border-ink-500 hover:bg-ink-800",
  ghost: "text-fog-300 hover:text-fog-100 hover:bg-ink-850",
  danger:
    "border border-red-900/60 bg-red-950/30 text-red-300 hover:border-red-800 hover:bg-red-950/60",
};

const SIZES = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-10 px-5",
  lg: "h-12 px-7 text-[15px]",
} as const;

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: keyof typeof SIZES = "md",
  extra = "",
) {
  return [BUTTON_BASE, BUTTON_VARIANTS[variant], SIZES[size], extra]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: keyof typeof SIZES }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
}) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`panel rounded-2xl ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fog-400">
      {children}
    </p>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "sand" | "jade";
}) {
  const tones = {
    neutral: "border-ink-600 text-fog-300",
    sand: "border-sand-500/40 text-sand-400 bg-sand-500/10",
    jade: "border-jade-500/40 text-jade-400 bg-jade-500/10",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-[12.5px] leading-relaxed text-fog-400">
      {children}
    </p>
  );
}

export function Meter({
  value,
  max = 100,
  tone = "sand",
}: {
  value: number;
  max?: number;
  tone?: "sand" | "jade" | "fog";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const colors = {
    sand: "bg-sand-500",
    jade: "bg-jade-500",
    fog: "bg-fog-300",
  } as const;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700"
      role="presentation"
    >
      <div
        className={`h-full rounded-full ${colors[tone]} transition-[width] duration-500 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-fog-400">{label}</p>
      <p className="tabular mt-1 text-2xl font-semibold tracking-tight text-fog-100">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-fog-400">{hint}</p> : null}
    </div>
  );
}
