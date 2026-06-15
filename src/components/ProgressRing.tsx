// Enkel SVG-progressring med animerad båge. Används i översikten.
import { useEffect, useState } from "react";

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  color = "var(--color-primary)",
  track = "var(--color-muted)",
}: {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  color?: string;
  track?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  // Animera in bågen vid mount.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(clamped));
    return () => cancelAnimationFrame(id);
  }, [clamped]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (shown / 100) * c}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label}
        {sublabel}
      </div>
    </div>
  );
}
