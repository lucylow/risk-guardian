/**
 * OracleMetricsDashboard — displays on-chain oracle health and performance metrics.
 */

import { useState, useEffect } from "react";
import { getOracleMetrics, getFeederStatus } from "@/blockchain/oracleClient";
import type { OracleMetrics, OracleFeederStatus } from "@/blockchain/types";

export default function OracleMetricsDashboard() {
  const [metrics, setMetrics] = useState<OracleMetrics | null>(null);
  const [feeders, setFeeders] = useState<OracleFeederStatus[]>([]);

  useEffect(() => {
    getOracleMetrics().then(setMetrics);
    getFeederStatus().then(setFeeders);
    const interval = setInterval(() => {
      getOracleMetrics().then(setMetrics);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <div className="glass-card rounded-2xl p-8 border border-border animate-pulse">
        <div className="h-8 bg-surface-highlight rounded w-1/3 mb-4" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-surface-highlight rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Swaps Assessed", value: metrics.totalSwapsAssessed.toLocaleString(), icon: "📊" },
    { label: "Avg Safety", value: (metrics.avgSafetyScore / 10).toFixed(1), icon: "🛡️" },
    { label: "Attacks Blocked", value: metrics.sandwichAttacksBlocked.toLocaleString(), icon: "🥪" },
    { label: "TVL Protected", value: metrics.tvlProtected, icon: "💰" },
    { label: "Uptime", value: `${metrics.uptime}%`, icon: "⏱️" },
    { label: "Feeder Latency", value: `${metrics.feederLatencyMs}ms`, icon: "⚡" },
    { label: "Last Block", value: metrics.lastBlockProcessed.toLocaleString(), icon: "🔗" },
    { label: "Active Wallets (24h)", value: metrics.activeWallets24h.toLocaleString(), icon: "👛" },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 border border-border text-center">
            <span className="text-xl mb-1 block">{s.icon}</span>
            <p className="font-display font-bold text-lg text-foreground">{s.value}</p>
            <p className="text-foreground-subtle text-[10px] font-mono mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Feeder Status */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <h4 className="font-display font-semibold text-foreground text-sm mb-4">Oracle Feeders</h4>
        <div className="space-y-2">
          {feeders.map((f) => (
            <div key={f.address} className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/50">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${f.authorized ? "bg-risk-safe" : "bg-risk-danger"}`} />
                <div>
                  <p className="font-mono text-xs text-foreground">{f.address}</p>
                  <p className="font-mono text-[10px] text-foreground-subtle">
                    {f.totalUpdates.toLocaleString()} updates · {f.avgLatencyMs}ms avg
                  </p>
                </div>
              </div>
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
                f.authorized
                  ? "border-risk-safe/30 bg-risk-safe/10 text-risk-safe"
                  : "border-risk-danger/30 bg-risk-danger/10 text-risk-danger"
              }`}>
                {f.authorized ? "Authorized" : "Revoked"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
