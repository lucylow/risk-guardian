import { useState, useEffect } from "react";

export interface BreakdownData {
  sandwich_risk: number;
  liquidity_health: number;
  wallet_risk: number;
}

interface RiskBarProps {
  label: string;
  value: number;
  loading?: boolean;
  colorFn: (v: number) => string;
  icon: string;
}

function RiskBar({ label, value, loading, colorFn, icon }: RiskBarProps) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    if (loading) { setAnimated(0); return; }
    const t = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(t);
  }, [value, loading]);

  const colorClass = colorFn(animated);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground-muted flex items-center gap-1.5">
          <span>{icon}</span>
          {label}
        </span>
        <span className={`font-mono text-sm font-bold tabular-nums transition-colors ${colorClass.replace("bg-", "text-")}`}>
          {loading ? "–" : animated}
        </span>
      </div>
      <div className="w-full bg-surface-highlight rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: loading ? "0%" : `${animated}%` }}
        />
      </div>
    </div>
  );
}

function sandwichColor(v: number) {
  return v > 40 ? "bg-risk-danger" : v > 20 ? "bg-risk-moderate" : "bg-risk-safe";
}
function liquidityColor(v: number) {
  return v < 50 ? "bg-risk-danger" : v < 70 ? "bg-risk-moderate" : "bg-risk-safe";
}
function walletColor(v: number) {
  return v > 60 ? "bg-risk-danger" : v > 30 ? "bg-risk-moderate" : "bg-risk-safe";
}

interface RiskBreakdownProps {
  data: BreakdownData | null;
  loading?: boolean;
}

export default function RiskBreakdown({ data, loading = false }: RiskBreakdownProps) {
  const d = data ?? { sandwich_risk: 0, liquidity_health: 0, wallet_risk: 0 };

  return (
    <div className="space-y-4">
      <RiskBar
        icon="🥪"
        label="Sandwich Attack Risk"
        value={d.sandwich_risk}
        loading={loading}
        colorFn={sandwichColor}
      />
      <RiskBar
        icon="💧"
        label="Liquidity Pool Health"
        value={d.liquidity_health}
        loading={loading}
        colorFn={liquidityColor}
      />
      <RiskBar
        icon="👛"
        label="Wallet Risk Score"
        value={d.wallet_risk}
        loading={loading}
        colorFn={walletColor}
      />
    </div>
  );
}
