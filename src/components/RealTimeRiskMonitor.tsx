/**
 * RealTimeRiskMonitor — live feed of on-chain risk events from the oracle.
 */

import { useOracleEvents } from "@/hooks/useOracleEvents";

function shortenHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function shortenAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function scoreColor(score: number): string {
  if (score >= 700) return "text-risk-safe";
  if (score >= 400) return "text-risk-moderate";
  return "text-risk-danger";
}

function dotColor(score: number): string {
  if (score >= 700) return "bg-risk-safe";
  if (score >= 400) return "bg-risk-moderate";
  return "bg-risk-danger";
}

export default function RealTimeRiskMonitor() {
  const events = useOracleEvents(8);

  return (
    <div className="glass-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-risk-safe animate-pulse" />
          <h3 className="font-display font-semibold text-foreground text-sm">Live Oracle Feed</h3>
        </div>
        <span className="font-mono text-[10px] text-foreground-subtle">On-Chain Events</span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <p className="text-foreground-subtle text-xs font-mono">Listening for events…</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((e, i) => (
            <div
              key={`${e.transactionHash}-${e.logIndex}`}
              className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border/50 transition-all duration-300"
              style={{ opacity: 1 - i * 0.08 }}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${dotColor(e.score.safetyScore)}`} />
                <div>
                  <p className="font-mono text-xs text-foreground">
                    {e.score.tokenIn}/{e.score.tokenOut}
                  </p>
                  <p className="font-mono text-[10px] text-foreground-subtle">
                    {shortenAddr(e.score.swapInitiator)} · Block {e.blockNumber.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-display font-bold text-sm ${scoreColor(e.score.safetyScore)}`}>
                  {(e.score.safetyScore / 10).toFixed(1)}
                </p>
                <p className="font-mono text-[10px] text-foreground-subtle">
                  {shortenHash(e.transactionHash)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
