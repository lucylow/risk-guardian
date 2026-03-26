/**
 * OneChainVolatilityBadge — displays OnePredict volatility indicator inline.
 */

import { volatilityLabel } from "@/onechain/onepredict/onepredictClient";

interface Props {
  volatilityIndex: number;
  trend?: "up" | "down" | "stable";
  confidence?: number;
}

export default function OneChainVolatilityBadge({ volatilityIndex, trend, confidence }: Props) {
  const label = volatilityLabel(volatilityIndex);
  const colorMap = {
    Low: "text-risk-safe bg-risk-safe/10 border-risk-safe/20",
    Medium: "text-risk-moderate bg-risk-moderate/10 border-risk-moderate/20",
    High: "text-risk-danger bg-risk-danger/10 border-risk-danger/20",
  };
  const trendIcon = trend === "up" ? "📈" : trend === "down" ? "📉" : "➡️";

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono ${colorMap[label]}`}>
      <span>{trendIcon}</span>
      <span>Volatility: {label} ({volatilityIndex})</span>
      {confidence !== undefined && (
        <span className="text-foreground-subtle">
          · {Math.round(confidence * 100)}% conf
        </span>
      )}
      <span className="text-foreground-subtle ml-1">Powered by OnePredict</span>
    </div>
  );
}
