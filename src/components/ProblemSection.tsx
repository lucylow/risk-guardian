import { useEffect, useRef, useState } from "react";

function StatCard({ value, label, detail, color }: { value: string; label: string; detail: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`glass-card p-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className={`font-display font-bold text-4xl mb-2`} style={{ color }}>{value}</div>
      <div className="font-semibold text-foreground mb-1">{label}</div>
      <div className="text-sm text-foreground-muted">{detail}</div>
    </div>
  );
}

function AttackDiagram() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 1800);
    return () => clearInterval(t);
  }, []);

  const steps = [
    { label: "Your TX enters mempool", icon: "📤", active: step >= 0 },
    { label: "Bot detects your trade", icon: "🤖", active: step >= 1 },
    { label: "Front-run: Bot buys first", icon: "⚡", active: step >= 2 },
    { label: "Your TX executes — worse price", icon: "📉", active: step >= 3 },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-risk-danger animate-pulse" />
        <span className="font-mono text-xs text-foreground-muted">SANDWICH ATTACK — LIVE SIMULATION</span>
      </div>

      <div className="space-y-3">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${
              s.active ? "bg-surface-highlight border border-border-bright" : "bg-surface border border-transparent opacity-40"
            }`}
          >
            <span className="text-xl">{s.icon}</span>
            <span className={`text-sm font-medium ${s.active ? "text-foreground" : "text-foreground-subtle"}`}>
              {s.label}
            </span>
            {s.active && i < 3 && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
            {s.active && i === 3 && (
              <div className="ml-auto font-mono text-xs text-risk-danger font-bold">-2.4% slippage stolen</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-risk-danger/10 border border-risk-danger/20">
        <p className="text-xs text-risk-danger font-mono">
          ⚠ Without protection: $240 stolen on a $10,000 swap
        </p>
      </div>
    </div>
  );
}

export default function ProblemSection() {
  return (
    <section id="problem" className="py-24 relative hex-bg">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="section-label mb-4">The Problem</div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            DeFi is a{" "}
            <span className="text-gradient">battlefield.</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Every unprotected swap is an opportunity for bots, rug pulls, and liquidity traps to extract value from unsuspecting traders.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — stats */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                value="$1.4B+"
                label="MEV Extracted Per Year"
                detail="Sandwich attacks, front-running, and arbitrage bots drain value from DeFi users annually."
                color="hsl(var(--risk-danger))"
              />
              <StatCard
                value="~30%"
                label="Of Transactions Affected"
                detail="Nearly a third of all on-chain swaps experience some form of MEV extraction."
                color="hsl(var(--risk-moderate))"
              />
              <StatCard
                value="$7.7B"
                label="Lost to Rug Pulls (2021-23)"
                detail="Shallow liquidity pools and malicious tokens continue to drain retail investors."
                color="hsl(var(--risk-danger))"
              />
              <StatCard
                value="0.001s"
                label="Bot Reaction Time"
                detail="MEV bots respond to mempool activity faster than any human can — you need AI protection."
                color="hsl(var(--risk-moderate))"
              />
            </div>

            {/* Risk categories */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-foreground mb-4">The Three Threat Vectors</h3>
              <div className="space-y-4">
                {[
                  {
                    icon: "👁️",
                    title: "Sandwich Attacks",
                    desc: "Bots front-run your transaction by buying just before and selling just after, pocketing the difference.",
                    risk: "HIGH",
                    color: "text-risk-danger",
                    bg: "bg-risk-danger/10",
                    border: "border-risk-danger/20",
                  },
                  {
                    icon: "💧",
                    title: "Liquidity Pool Traps",
                    desc: "Shallow pools mean a single large swap can move the price dramatically — or drain entirely.",
                    risk: "MED",
                    color: "text-risk-moderate",
                    bg: "bg-risk-moderate/10",
                    border: "border-risk-moderate/20",
                  },
                  {
                    icon: "🎭",
                    title: "Malicious Wallet Patterns",
                    desc: "Honeypot contracts and known scam wallets that appear legitimate until it's too late.",
                    risk: "HIGH",
                    color: "text-risk-danger",
                    bg: "bg-risk-danger/10",
                    border: "border-risk-danger/20",
                  },
                ].map((item) => (
                  <div key={item.title} className={`flex gap-4 p-3 rounded-lg ${item.bg} border ${item.border}`}>
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground text-sm">{item.title}</span>
                        <span className={`font-mono text-xs font-bold ${item.color} ml-auto`}>{item.risk}</span>
                      </div>
                      <p className="text-xs text-foreground-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — attack diagram */}
          <div className="space-y-6">
            <AttackDiagram />

            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-foreground mb-3">
                "I didn't even know it happened."
              </h3>
              <p className="text-foreground-muted text-sm leading-relaxed">
                The insidious nature of MEV is that victims often don't know they've been targeted. The transaction succeeds — but at a worse price than expected. Without a risk oracle, you're flying blind every single swap.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-sm">🧑</div>
                <div>
                  <div className="text-sm font-medium text-foreground">Average DeFi Trader</div>
                  <div className="text-xs text-foreground-subtle">Loses $180-$600/year to MEV</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
