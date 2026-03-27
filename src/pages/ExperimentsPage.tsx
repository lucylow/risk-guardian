import { useState } from "react";

type RiskModelVariant = "baseline" | "volatilityHeavy" | "walletReputationHeavy";

const MODEL_VARIANTS: { id: RiskModelVariant; name: string; desc: string; weights: string }[] = [
  { id: "baseline", name: "Baseline", desc: "Standard balanced weighting across all risk components.", weights: "Sandwich 40% · Liquidity 30% · Wallet 20% · Path 10%" },
  { id: "volatilityHeavy", name: "Volatility-Heavy", desc: "Emphasizes OnePredict volatility and market conditions.", weights: "Sandwich 25% · Liquidity 40% · Wallet 15% · Path 20%" },
  { id: "walletReputationHeavy", name: "Reputation-Heavy", desc: "Emphasizes wallet history and OneID reputation signals.", weights: "Sandwich 20% · Liquidity 25% · Wallet 45% · Path 10%" },
];

const INTEGRATIONS = [
  { name: "OneDEX", key: "onedex", live: true },
  { name: "OnePredict", key: "onepredict", live: true },
  { name: "OneID", key: "oneid", live: true },
  { name: "OneTransfer", key: "onetransfer", live: false },
  { name: "OneRWA", key: "onerwa", live: false },
  { name: "OnePlay", key: "oneplay", live: true },
];

export default function ExperimentsPage() {
  const [model, setModel] = useState<RiskModelVariant>(() => {
    return (localStorage.getItem("riskModelVariant") as RiskModelVariant) || "baseline";
  });

  const selectModel = (v: RiskModelVariant) => {
    setModel(v);
    localStorage.setItem("riskModelVariant", v);
  };

  return (
    <>
      <section className="pb-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="text-center">
          <div className="section-label mb-4 inline-flex">Experiments</div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            Feature <span className="text-gradient">Lab</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Toggle experimental risk models and integration modes for advanced testing.
          </p>
        </div>
      </section>

      <section className="pb-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-2xl mb-6">Risk Model Variant</h2>
          <div className="space-y-3 mb-12">
            {MODEL_VARIANTS.map((v) => (
              <button
                key={v.id}
                onClick={() => selectModel(v.id)}
                className={`w-full text-left glass-card rounded-xl p-6 border transition-colors ${
                  model === v.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-semibold text-foreground">{v.name}</h3>
                  {model === v.id && (
                    <span className="font-mono text-xs text-primary px-3 py-1 rounded-full border border-primary/30 bg-primary/10">Active</span>
                  )}
                </div>
                <p className="text-foreground-muted text-sm mb-2">{v.desc}</p>
                <p className="font-mono text-xs text-foreground-subtle">{v.weights}</p>
              </button>
            ))}
          </div>

          <h2 className="font-display font-bold text-2xl mb-6">Integration Status</h2>
          <div className="glass-card rounded-xl border border-border overflow-hidden mb-12">
            {INTEGRATIONS.map((int, i) => (
              <div key={int.key} className={`flex items-center justify-between p-4 ${i < INTEGRATIONS.length - 1 ? "border-b border-border/50" : ""}`}>
                <span className="font-display font-medium text-foreground">{int.name}</span>
                <span className={`font-mono text-xs font-bold px-3 py-1 rounded-full border ${
                  int.live
                    ? "border-risk-safe/30 bg-risk-safe/10 text-risk-safe"
                    : "border-risk-moderate/30 bg-risk-moderate/10 text-risk-moderate"
                }`}>
                  {int.live ? "Mock Live" : "Stub"}
                </span>
              </div>
            ))}
          </div>

          <h2 className="font-display font-bold text-2xl mb-6">Performance Benchmarks</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-6 border border-border text-center">
              <p className="text-foreground-subtle text-xs font-mono mb-2">Edge Functions</p>
              <p className="font-display font-bold text-3xl text-risk-safe">~120ms</p>
              <p className="text-foreground-muted text-xs mt-1">Low-latency risk scoring at the edge</p>
            </div>
            <div className="glass-card rounded-xl p-6 border border-border text-center">
              <p className="text-foreground-subtle text-xs font-mono mb-2">Full Backend</p>
              <p className="font-display font-bold text-3xl text-risk-moderate">~420ms</p>
              <p className="text-foreground-muted text-xs mt-1">Deep analysis with AI explanation</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
