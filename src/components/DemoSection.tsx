import { useState, useEffect, useRef } from "react";

interface RiskData {
  safety: number;
  sandwich: number;
  liquidity: number;
  wallet: number;
  explanation: string;
  recommendation: string;
  recommendationType: "safe" | "moderate" | "danger";
}

function getRiskData(pair: string, amount: number, wallet: string): RiskData {
  let sandwich = 10;
  let liquidity = 85;
  let walletRisk = 20;

  switch (pair) {
    case "ONE_USDC": sandwich = 12; liquidity = 92; break;
    case "ONE_BTC": sandwich = 8; liquidity = 88; break;
    case "USDC_ONE": sandwich = 15; liquidity = 85; break;
    case "ONE_ETH": sandwich = 20; liquidity = 78; break;
    case "HIGH_RISK_PAIR": sandwich = 68; liquidity = 28; break;
    default: break;
  }

  const amountFactor = Math.min(amount / 5000, 1);
  sandwich = Math.min(100, sandwich + amountFactor * 25);
  liquidity = Math.max(0, liquidity - amountFactor * 15);

  if (wallet === "new") walletRisk = 55;
  else if (wallet === "suspicious") walletRisk = 87;
  else walletRisk = 15;

  const riskScore = 0.5 * sandwich + 0.3 * (100 - liquidity) + 0.2 * walletRisk;
  const safety = Math.max(0, Math.min(100, Math.round(100 - riskScore)));

  let explanation = "";
  if (sandwich > 40) explanation += "⚡ High sandwich probability: 3+ pending txs in mempool targeting this pair with higher gas. ";
  else if (sandwich > 20) explanation += "⚠ Moderate sandwich risk — some bot activity detected in the mempool. ";
  else explanation += "✓ Sandwich risk is low — mempool looks clean for this pair. ";

  if (liquidity < 50) explanation += "💧 Pool is shallow — your trade will cause significant price impact. ";
  else if (liquidity < 70) explanation += "💧 Pool health is moderate; acceptable but monitor slippage. ";
  else explanation += "💧 Pool has deep liquidity — price impact will be minimal. ";

  if (walletRisk > 60) explanation += "🔴 Wallet flagged by OneID for suspicious on-chain activity.";
  else if (walletRisk > 30) explanation += "🟡 Limited wallet history — no flags but verify contract addresses.";
  else explanation += "✅ Wallet reputation is clean per OneID.";

  let recommendation = "";
  let recommendationType: RiskData["recommendationType"] = "safe";
  if (safety < 30) {
    recommendation = "Do NOT proceed — extremely high risk. Consider a different pair or a much smaller amount.";
    recommendationType = "danger";
  } else if (safety < 60) {
    recommendation = "Proceed with caution. Consider reducing your swap size or increasing slippage tolerance to mitigate risk.";
    recommendationType = "moderate";
  } else {
    recommendation = "Low risk — safe to swap. Always double-check the token contract address before confirming.";
    recommendationType = "safe";
  }

  return { safety, sandwich: Math.round(sandwich), liquidity: Math.round(liquidity), wallet: Math.round(walletRisk), explanation, recommendation, recommendationType };
}

function RiskBar({ value, label, colorClass }: { value: number; label: string; colorClass: string }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div>
      <div className="flex justify-between text-sm font-medium text-foreground-muted mb-2">
        <span className="font-mono">{label}</span>
        <span className="font-mono text-foreground">{value}</span>
      </div>
      <div className="w-full bg-surface-highlight rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${animated}%` }}
        />
      </div>
    </div>
  );
}

function GaugeCircle({ score }: { score: number | null }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score ?? 0), 150);
    return () => clearTimeout(t);
  }, [score]);

  const circumference = 283;
  const offset = circumference - (animated / 100) * circumference;
  const color = animated >= 70 ? "hsl(var(--risk-safe))" : animated >= 40 ? "hsl(var(--risk-moderate))" : "hsl(var(--risk-danger))";
  const label = score === null ? "---" : animated >= 70 ? "Low Risk" : animated >= 40 ? "Moderate Risk" : "High Risk";
  const labelColor = animated >= 70 ? "text-risk-safe" : animated >= 40 ? "text-risk-moderate" : "text-risk-danger";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--surface-highlight))" strokeWidth="9" />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1), stroke 0.5s ease",
              filter: score !== null ? `drop-shadow(0 0 8px ${color})` : "none",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-5xl" style={{ color: score !== null ? color : "hsl(var(--foreground-subtle))" }}>
            {score !== null ? animated : "–"}
          </span>
          <span className="font-mono text-xs text-foreground-subtle mt-0.5">SAFETY</span>
        </div>
      </div>
      {score !== null && (
        <div className={`mt-2 font-mono text-sm font-bold px-3 py-1 rounded-full border ${
          animated >= 70 ? "border-risk-safe/30 bg-risk-safe/10 text-risk-safe" :
          animated >= 40 ? "border-risk-moderate/30 bg-risk-moderate/10 text-risk-moderate" :
          "border-risk-danger/30 bg-risk-danger/10 text-risk-danger"
        }`}>
          {label}
        </div>
      )}
    </div>
  );
}

export default function DemoSection() {
  const [pair, setPair] = useState("ONE_USDC");
  const [amount, setAmount] = useState(1000);
  const [wallet, setWallet] = useState("normal");
  const [result, setResult] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAssess = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(getRiskData(pair, amount, wallet));
      setLoading(false);
    }, 900);
  };

  // Run initial assessment
  useEffect(() => { handleAssess(); }, []);

  const displayResult = result;

  const sandwichBarColor = displayResult && displayResult.sandwich > 40 ? "bg-risk-danger" : displayResult && displayResult.sandwich > 20 ? "bg-risk-moderate" : "bg-risk-safe";
  const liquidityBarColor = displayResult && displayResult.liquidity < 50 ? "bg-risk-danger" : displayResult && displayResult.liquidity < 70 ? "bg-risk-moderate" : "bg-risk-safe";
  const walletBarColor = displayResult && displayResult.wallet > 60 ? "bg-risk-danger" : displayResult && displayResult.wallet > 30 ? "bg-risk-moderate" : "bg-risk-safe";

  return (
    <section id="demo" className="py-24 relative hex-bg">
      {/* Glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="section-label mb-4">Interactive Demo</div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            See The Oracle{" "}
            <span className="text-gradient">in Action</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Simulate a swap and get a real-time Safety Score — exactly like the live product experience inside OneDEX.
          </p>
        </div>

        <div className="max-w-5xl mx-auto glass-card rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left — inputs */}
            <div className="p-8 border-r border-border">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h3 className="font-display font-bold text-xl text-foreground">Swap Parameters</h3>
              </div>

              {/* Token pair */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground-muted mb-2">Token Pair</label>
                <select
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="w-full p-3 bg-surface border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="ONE_USDC">ONE → USDC (Stable)</option>
                  <option value="ONE_BTC">ONE → BTC</option>
                  <option value="USDC_ONE">USDC → ONE</option>
                  <option value="ONE_ETH">ONE → ETH</option>
                  <option value="HIGH_RISK_PAIR">⚠ SHIT → USDC (High Risk)</option>
                </select>
              </div>

              {/* Amount */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  Swap Amount — <span className="font-mono text-primary">{amount.toLocaleString()} ONE</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={100}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-primary mb-2"
                  style={{ accentColor: "hsl(var(--primary))" }}
                />
                <div className="flex justify-between text-xs font-mono text-foreground-subtle">
                  <span>0 ONE</span>
                  <span>10,000 ONE</span>
                </div>
                <p className="text-xs text-foreground-subtle mt-2">Larger amounts increase price impact and sandwich risk.</p>
              </div>

              {/* Wallet */}
              <div className="mb-7">
                <label className="block text-sm font-medium text-foreground-muted mb-2">Wallet Profile</label>
                <select
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  className="w-full p-3 bg-surface border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="normal">✅ Normal Trader (0x123…abc)</option>
                  <option value="new">🟡 New Wallet — First Trade</option>
                  <option value="suspicious">🔴 Suspicious History (OneID Flagged)</option>
                </select>
              </div>

              <button
                onClick={handleAssess}
                disabled={loading}
                className="w-full btn-primary py-3.5 rounded-xl text-base font-display font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing Mempool…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Assess Risk
                  </>
                )}
              </button>

              {/* Quick presets */}
              <div className="mt-5">
                <p className="text-xs text-foreground-subtle mb-2 font-mono">QUICK SCENARIOS</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Safe Swap", pair: "ONE_USDC", amount: 500, wallet: "normal" },
                    { label: "Large Trade", pair: "ONE_USDC", amount: 9000, wallet: "normal" },
                    { label: "Risky Pair", pair: "HIGH_RISK_PAIR", amount: 2000, wallet: "normal" },
                    { label: "Flagged Wallet", pair: "ONE_USDC", amount: 1000, wallet: "suspicious" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => { setPair(preset.pair); setAmount(preset.amount); setWallet(preset.wallet); }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground-muted hover:border-primary hover:text-primary transition-colors font-mono"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — results */}
            <div className="p-8 bg-surface">
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full ${loading ? "bg-risk-moderate animate-pulse" : displayResult ? "bg-risk-safe" : "bg-foreground-subtle"}`} />
                <h3 className="font-display font-bold text-xl text-foreground">Safety Score</h3>
              </div>

              {/* Gauge */}
              <div className="flex justify-center mb-6">
                <GaugeCircle score={loading ? null : displayResult?.safety ?? null} />
              </div>

              {/* Component bars */}
              <div className="space-y-4 mb-6">
                <RiskBar
                  label="Sandwich Attack Risk"
                  value={loading ? 0 : displayResult?.sandwich ?? 0}
                  colorClass={sandwichBarColor}
                />
                <RiskBar
                  label="Liquidity Pool Health"
                  value={loading ? 0 : displayResult?.liquidity ?? 0}
                  colorClass={liquidityBarColor}
                />
                <RiskBar
                  label="Wallet Risk Score"
                  value={loading ? 0 : displayResult?.wallet ?? 0}
                  colorClass={walletBarColor}
                />
              </div>

              {/* Explanation */}
              <div className="p-4 rounded-xl bg-surface-raised border border-border mb-3">
                <p className="text-xs font-mono text-foreground-muted mb-2">💡 AI EXPLANATION</p>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {loading ? "Scanning mempool and analyzing pool data…" : displayResult?.explanation ?? "Select parameters and click Assess Risk."}
                </p>
              </div>

              {/* Recommendation */}
              {displayResult && !loading && (
                <div className={`p-4 rounded-xl border text-sm font-medium ${
                  displayResult.recommendationType === "safe"
                    ? "bg-risk-safe/10 border-risk-safe/25 text-risk-safe"
                    : displayResult.recommendationType === "moderate"
                    ? "bg-risk-moderate/10 border-risk-moderate/25 text-risk-moderate"
                    : "bg-risk-danger/10 border-risk-danger/25 text-risk-danger"
                }`}>
                  <p className="font-mono text-xs mb-1 opacity-70">RECOMMENDATION</p>
                  {displayResult.recommendation}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-foreground-subtle text-xs font-mono mt-6">
          ⚠ This is a simulation for demonstration purposes. The live product uses real-time mempool data and OnePredict AI models.
        </p>
      </div>
    </section>
  );
}
