import { useState, useEffect } from "react";

interface RiskGaugeProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const SIZE_MAP = {
  sm: { container: "w-28 h-28", font: "text-3xl", label: "text-[10px]" },
  md: { container: "w-40 h-40", font: "text-4xl", label: "text-xs" },
  lg: { container: "w-48 h-48", font: "text-5xl", label: "text-xs" },
};

export default function RiskGauge({ score, size = "lg", loading = false }: RiskGaugeProps) {
  const [animated, setAnimated] = useState(0);
  const cls = SIZE_MAP[size];

  useEffect(() => {
    if (score === null || loading) { setAnimated(0); return; }
    const t = setTimeout(() => setAnimated(score), 150);
    return () => clearTimeout(t);
  }, [score, loading]);

  const circumference = 283;
  const offset = circumference - (animated / 100) * circumference;

  const color =
    loading || score === null
      ? "hsl(var(--foreground-subtle))"
      : animated >= 70
      ? "hsl(var(--risk-safe))"
      : animated >= 40
      ? "hsl(var(--risk-moderate))"
      : "hsl(var(--risk-danger))";

  const label =
    loading || score === null
      ? null
      : animated >= 70
      ? "Low Risk"
      : animated >= 40
      ? "Moderate Risk"
      : "High Risk";

  const badgeCls =
    animated >= 70
      ? "border-risk-safe/30 bg-risk-safe/10 text-risk-safe"
      : animated >= 40
      ? "border-risk-moderate/30 bg-risk-moderate/10 text-risk-moderate"
      : "border-risk-danger/30 bg-risk-danger/10 text-risk-danger";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${cls.container}`}>
        {/* Track */}
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 100 100"
          role="img"
          aria-label={`Safety score gauge${score !== null ? `: ${score} out of 100` : ""}`}
        >
          <title>{`Safety score: ${score ?? 0} out of 100`}</title>
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="hsl(var(--surface-highlight))"
            strokeWidth="9"
          />
          {/* Glow arc */}
          {!loading && score !== null && (
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              opacity="0.25"
              style={{
                transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1), stroke 0.5s ease",
                filter: `blur(4px)`,
              }}
            />
          )}
          {/* Main arc */}
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={loading ? circumference : offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1), stroke 0.5s ease",
              filter: !loading && score !== null ? `drop-shadow(0 0 6px ${color})` : "none",
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {loading ? (
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <>
              <span
                className={`font-display font-bold ${cls.font} tabular-nums`}
                style={{ color: score !== null ? color : "hsl(var(--foreground-subtle))" }}
              >
                {score !== null ? animated : "–"}
              </span>
              <span className={`font-mono ${cls.label} text-foreground-subtle mt-0.5`}>SAFETY</span>
            </>
          )}
        </div>
      </div>

      {label && !loading && (
        <span className={`font-mono text-xs font-bold px-3 py-1 rounded-full border ${badgeCls}`}>
          {label}
        </span>
      )}
    </div>
  );
}
