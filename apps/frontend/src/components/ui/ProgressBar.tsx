"use client";

interface ProgressBarProps {
  percent: number; // 0–100
  label?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function ProgressBar({ percent, label, size = "sm", showLabel = false }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const h = size === "sm" ? "h-1" : "h-2";

  return (
    <div className="space-y-1">
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs text-[var(--text-3)]">
          {label && <span>{label}</span>}
          {showLabel && <span>{clamped}%</span>}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-[var(--surface-3)] ${h}`}>
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-all duration-300"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
