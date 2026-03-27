import { useState } from "react";

interface AlertConfig {
  safetyThreshold: number;
  volatilityThreshold: number;
  rwaThreshold: number;
  safetyEnabled: boolean;
  volatilityEnabled: boolean;
  rwaEnabled: boolean;
}

const MOCK_ALERTS = [
  { id: 1, type: "Swap Risk", pair: "ONE/BTC", score: 35, ts: "2025-01-22 14:32" },
  { id: 2, type: "Volatility Spike", pair: "HIGHRISK/USDC", score: 88, ts: "2025-01-21 09:15" },
  { id: 3, type: "RWA Risk", pair: "—", score: 72, ts: "2025-01-20 17:45" },
  { id: 4, type: "Swap Risk", pair: "OCT/USDO", score: 42, ts: "2025-01-19 11:20" },
];

export default function AlertsPage() {
  const [config, setConfig] = useState<AlertConfig>({
    safetyThreshold: 40,
    volatilityThreshold: 70,
    rwaThreshold: 50,
    safetyEnabled: true,
    volatilityEnabled: true,
    rwaEnabled: false,
  });

  const toggle = (key: keyof AlertConfig) =>
    setConfig((c) => ({ ...c, [key]: !c[key] }));

  const setThreshold = (key: keyof AlertConfig, value: number) =>
    setConfig((c) => ({ ...c, [key]: value }));

  return (
    <>
      <section className="pb-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-risk-danger/5 rounded-full blur-3xl" />
        </div>
        <div className="text-center">
          <div className="section-label mb-4 inline-flex">Alerts</div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            Risk <span className="text-gradient">Alerts</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Configure thresholds and get notified when risk levels change.
          </p>
        </div>
      </section>

      {/* Config */}
      <section className="pb-12">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Safety */}
          <div className="glass-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-foreground">Swap Safety Alert</h3>
                <p className="text-foreground-muted text-xs">Alert when Safety Score falls below threshold</p>
              </div>
              <button
                onClick={() => toggle("safetyEnabled")}
                className={`w-12 h-6 rounded-full transition-colors relative ${config.safetyEnabled ? "bg-primary" : "bg-surface-highlight"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${config.safetyEnabled ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
            {config.safetyEnabled && (
              <div>
                <label className="text-xs font-mono text-foreground-subtle">Threshold: {config.safetyThreshold}</label>
                <input type="range" min={0} max={100} value={config.safetyThreshold} onChange={(e) => setThreshold("safetyThreshold", +e.target.value)} className="w-full accent-primary mt-1" />
              </div>
            )}
          </div>

          {/* Volatility */}
          <div className="glass-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-foreground">Volatility Spike Alert</h3>
                <p className="text-foreground-muted text-xs">Alert when OnePredict volatility index exceeds threshold</p>
              </div>
              <button
                onClick={() => toggle("volatilityEnabled")}
                className={`w-12 h-6 rounded-full transition-colors relative ${config.volatilityEnabled ? "bg-primary" : "bg-surface-highlight"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${config.volatilityEnabled ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
            {config.volatilityEnabled && (
              <div>
                <label className="text-xs font-mono text-foreground-subtle">Threshold: {config.volatilityThreshold}</label>
                <input type="range" min={0} max={100} value={config.volatilityThreshold} onChange={(e) => setThreshold("volatilityThreshold", +e.target.value)} className="w-full accent-primary mt-1" />
              </div>
            )}
          </div>

          {/* RWA */}
          <div className="glass-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-foreground">RWA Systemic Risk</h3>
                <p className="text-foreground-muted text-xs">Alert when OneRWA systemic risk increases</p>
              </div>
              <button
                onClick={() => toggle("rwaEnabled")}
                className={`w-12 h-6 rounded-full transition-colors relative ${config.rwaEnabled ? "bg-primary" : "bg-surface-highlight"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${config.rwaEnabled ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
            {config.rwaEnabled && (
              <div>
                <label className="text-xs font-mono text-foreground-subtle">Threshold: {config.rwaThreshold}%</label>
                <input type="range" min={0} max={100} value={config.rwaThreshold} onChange={(e) => setThreshold("rwaThreshold", +e.target.value)} className="w-full accent-primary mt-1" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Alert History */}
      <section className="pb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-2xl mb-6">Recent Alerts</h2>
          <div className="space-y-3">
            {MOCK_ALERTS.map((a) => (
              <div key={a.id} className="glass-card rounded-xl p-4 border border-border flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${a.score < 40 ? "bg-risk-danger" : a.score < 70 ? "bg-risk-moderate" : "bg-risk-safe"}`} />
                    <span className="font-display font-semibold text-foreground text-sm">{a.type}</span>
                    {a.pair !== "—" && <span className="font-mono text-xs text-foreground-subtle">{a.pair}</span>}
                  </div>
                  <p className="text-foreground-subtle text-xs font-mono">{a.ts}</p>
                </div>
                <span className={`font-mono text-sm font-bold ${a.score < 40 ? "text-risk-danger" : a.score < 70 ? "text-risk-moderate" : "text-risk-safe"}`}>
                  {a.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
