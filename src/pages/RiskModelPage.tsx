import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useState } from "react";

const SCENARIOS = [
  { pair: "ONE/USDC", amount: 500, sandwich: 12, liquidity: 91, wallet: 10, safety: 84 },
  { pair: "ONE/BTC", amount: 2000, sandwich: 45, liquidity: 65, wallet: 15, safety: 56 },
  { pair: "HIGHRISK/USDC", amount: 5000, sandwich: 78, liquidity: 25, wallet: 40, safety: 22 },
];

export default function RiskModelPage() {
  const [demoScore, setDemoScore] = useState(75);

  const tier = demoScore >= 70 ? "Low Risk" : demoScore >= 40 ? "Moderate Risk" : "High Risk";
  const tierCls = demoScore >= 70
    ? "text-risk-safe"
    : demoScore >= 40
    ? "text-risk-moderate"
    : "text-risk-danger";
  const tierDesc = demoScore >= 70
    ? "This swap appears safe. Good liquidity depth and minimal MEV exposure detected."
    : demoScore >= 40
    ? "Moderate risk — consider reducing size or switching to a more liquid pair."
    : "High risk — significant MEV exposure and thin liquidity. Proceed with extreme caution.";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />

      <section className="pt-28 pb-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <div className="section-label mb-4 inline-flex">Documentation</div>
          <h1 className="font-display font-bold text-5xl sm:text-6xl mb-4">
            Risk Model <span className="text-gradient">Explained</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            How the Safety Score is computed — transparent, reproducible, and extensible.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-3xl prose-custom">
          {/* Inputs */}
          <h2 className="font-display font-bold text-2xl mb-4">Inputs</h2>
          <div className="glass-card rounded-xl p-6 border border-border mb-8">
            <ul className="space-y-2 text-foreground-muted text-sm">
              <li>🔗 <strong className="text-foreground">OneDEX</strong> — Pool TVL, LP concentration, fee tier</li>
              <li>📈 <strong className="text-foreground">OnePredict</strong> — Volatility index and trend forecast</li>
              <li>🆔 <strong className="text-foreground">OneID</strong> — Wallet age, cross-chain activity, reputation tier</li>
              <li>🏦 <strong className="text-foreground">OneRWA</strong> — Real-world asset exposure and collateralization</li>
              <li>🔀 <strong className="text-foreground">OneTransfer</strong> — Path complexity, bridge usage, hop count</li>
            </ul>
          </div>

          {/* Components */}
          <h2 className="font-display font-bold text-2xl mb-4">Risk Components</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              { name: "Sandwich / MEV Risk", weight: "40%", desc: "Measures exposure to front-running and sandwich attacks based on amount, volatility, and pool depth." },
              { name: "Liquidity Health", weight: "30%", desc: "Evaluates pool TVL, LP concentration, and available depth relative to trade size." },
              { name: "Wallet Risk", weight: "20%", desc: "Assesses wallet reputation via OneID — age, cross-chain history, and known flags." },
              { name: "Path / Systemic Risk", weight: "10%", desc: "Accounts for transfer path complexity, bridge usage, and RWA exposure concentration." },
            ].map((c) => (
              <div key={c.name} className="glass-card rounded-xl p-5 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-display font-semibold text-foreground text-sm">{c.name}</h3>
                  <span className="font-mono text-xs text-primary">{c.weight}</span>
                </div>
                <p className="text-foreground-muted text-xs">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Formula */}
          <h2 className="font-display font-bold text-2xl mb-4">Aggregation Formula</h2>
          <div className="glass-card rounded-xl p-6 border border-border mb-8">
            <pre className="font-mono text-sm text-foreground-muted whitespace-pre-wrap">{`riskScore = 0.4 × sandwichRisk
           + 0.3 × (100 − liquidityHealth)
           + 0.2 × walletRisk
           + 0.1 × pathComplexity

safetyScore = clamp(100 − riskScore, 0, 100)`}</pre>
          </div>

          {/* Examples */}
          <h2 className="font-display font-bold text-2xl mb-4">Example Scenarios</h2>
          <div className="glass-card rounded-xl border border-border overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-foreground-subtle text-xs font-mono">
                  <th className="p-3 text-left">Pair</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">Sandwich</th>
                  <th className="p-3 text-right">Liquidity</th>
                  <th className="p-3 text-right">Wallet</th>
                  <th className="p-3 text-right">Safety</th>
                </tr>
              </thead>
              <tbody>
                {SCENARIOS.map((s) => (
                  <tr key={s.pair} className="border-b border-border/50 text-foreground-muted">
                    <td className="p-3 font-mono text-foreground">{s.pair}</td>
                    <td className="p-3 text-right">{s.amount}</td>
                    <td className="p-3 text-right">{s.sandwich}</td>
                    <td className="p-3 text-right">{s.liquidity}</td>
                    <td className="p-3 text-right">{s.wallet}</td>
                    <td className={`p-3 text-right font-bold ${s.safety >= 70 ? "text-risk-safe" : s.safety >= 40 ? "text-risk-moderate" : "text-risk-danger"}`}>{s.safety}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interactive widget */}
          <h2 className="font-display font-bold text-2xl mb-4">Try It</h2>
          <div className="glass-card rounded-xl p-6 border border-border">
            <label className="block text-foreground-muted text-sm font-mono mb-3">Safety Score: <span className={`font-bold ${tierCls}`}>{demoScore}</span></label>
            <input type="range" min={0} max={100} value={demoScore} onChange={(e) => setDemoScore(+e.target.value)} className="w-full accent-primary mb-4" />
            <div className="text-center">
              <span className={`inline-block font-mono text-sm font-bold ${tierCls}`}>{tier}</span>
              <p className="text-foreground-muted text-sm mt-2">{tierDesc}</p>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
