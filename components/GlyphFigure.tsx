"use client";

import { useId } from "react";
import type { FillStyle, Glyph, ShapeName } from "@/lib/iq/types";

function polygonPoints(cx: number, cy: number, r: number, sides: number, offset = -90) {
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = ((offset + (360 / sides) * i) * Math.PI) / 180;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(" ");
}

function starPoints(cx: number, cy: number, r: number) {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.44;
    const angle = ((-90 + 36 * i) * Math.PI) / 180;
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return points.join(" ");
}

function shapeElement(
  shape: ShapeName,
  cx: number,
  cy: number,
  r: number,
  paint: { fill: string; stroke: string; strokeWidth: number },
) {
  const common = { ...paint, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (shape) {
    case "circle":
      return <circle cx={cx} cy={cy} r={r} {...common} />;
    case "square":
      return (
        <rect x={cx - r * 0.88} y={cy - r * 0.88} width={r * 1.76} height={r * 1.76} rx={r * 0.12} {...common} />
      );
    case "triangle":
      return <polygon points={polygonPoints(cx, cy, r * 1.1, 3)} {...common} />;
    case "diamond":
      return <polygon points={polygonPoints(cx, cy, r * 1.15, 4)} {...common} />;
    case "hexagon":
      return <polygon points={polygonPoints(cx, cy, r, 6)} {...common} />;
    case "star":
      return <polygon points={starPoints(cx, cy, r * 1.12)} {...common} />;
    case "cross": {
      const a = r * 0.36;
      const b = r * 0.98;
      return (
        <polygon
          points={`${cx - a},${cy - b} ${cx + a},${cy - b} ${cx + a},${cy - a} ${cx + b},${cy - a} ${cx + b},${cy + a} ${cx + a},${cy + a} ${cx + a},${cy + b} ${cx - a},${cy + b} ${cx - a},${cy + a} ${cx - b},${cy + a} ${cx - b},${cy - a} ${cx - a},${cy - a}`}
          {...common}
        />
      );
    }
    case "arrow": {
      const h = r * 1.15;
      const w = r * 0.92;
      const stem = r * 0.3;
      return (
        <polygon
          points={`${cx},${cy - h} ${cx + w},${cy} ${cx + stem},${cy} ${cx + stem},${cy + h} ${cx - stem},${cy + h} ${cx - stem},${cy} ${cx - w},${cy}`}
          {...common}
        />
      );
    }
    case "chevron": {
      const h = r * 0.95;
      const w = r * 1.05;
      const t = r * 0.42;
      return (
        <polygon
          points={`${cx},${cy - h} ${cx + w},${cy + h * 0.35} ${cx + w - t},${cy + h} ${cx},${cy - h + t * 1.6} ${cx - w + t},${cy + h} ${cx - w},${cy + h * 0.35}`}
          {...common}
        />
      );
    }
    default:
      return <circle cx={cx} cy={cy} r={r} {...common} />;
  }
}

const LAYOUTS: Record<number, { cx: number; cy: number; r: number }[]> = {
  1: [{ cx: 50, cy: 50, r: 29 }],
  2: [
    { cx: 29, cy: 50, r: 19 },
    { cx: 71, cy: 50, r: 19 },
  ],
  3: [
    { cx: 50, cy: 28, r: 17 },
    { cx: 29, cy: 68, r: 17 },
    { cx: 71, cy: 68, r: 17 },
  ],
  4: [
    { cx: 31, cy: 31, r: 16 },
    { cx: 69, cy: 31, r: 16 },
    { cx: 31, cy: 69, r: 16 },
    { cx: 69, cy: 69, r: 16 },
  ],
};

export function GlyphFigure({
  glyph,
  size = 72,
  color = "currentColor",
  className = "",
}: {
  glyph: Glyph;
  size?: number;
  color?: string;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const halfId = `mg-half-${uid}`;
  const dotId = `mg-dot-${uid}`;

  const layout = LAYOUTS[Math.min(4, Math.max(1, glyph.count))] ?? LAYOUTS[1]!;

  const paintFor = (fill: FillStyle) => {
    switch (fill) {
      case "solid":
        return { fill: color, stroke: color, strokeWidth: 1 };
      case "outline":
        return { fill: "none", stroke: color, strokeWidth: 3.2 };
      case "half":
        return { fill: `url(#${halfId})`, stroke: color, strokeWidth: 2.6 };
      case "dotted":
        return { fill: `url(#${dotId})`, stroke: color, strokeWidth: 2.6 };
      default:
        return { fill: color, stroke: color, strokeWidth: 1 };
    }
  };

  const paint = paintFor(glyph.fill);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={halfId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} />
          <stop offset="50%" stopColor={color} />
          <stop offset="50%" stopColor={color} stopOpacity="0" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <pattern id={dotId} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.6" fill={color} />
        </pattern>
      </defs>
      {layout.map((slot, index) => (
        <g
          key={index}
          transform={`rotate(${glyph.rotation} ${slot.cx} ${slot.cy})`}
        >
          {shapeElement(glyph.shape, slot.cx, slot.cy, slot.r, paint)}
        </g>
      ))}
    </svg>
  );
}

export function describeGlyph(glyph: Glyph): string {
  const fills: Record<FillStyle, string> = {
    solid: "solid",
    outline: "outlined",
    half: "half-filled",
    dotted: "dotted",
  };
  const plural = glyph.count > 1 ? `${glyph.count} ${glyph.shape}s` : `a ${glyph.shape}`;
  return `${fills[glyph.fill]} ${plural} rotated ${glyph.rotation} degrees`;
}
