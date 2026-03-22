export default function SolutionSection() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: "hsl(var(--risk-danger))",
      bg: "bg-risk-danger/10",
      border: "border-risk-danger/20",
      title: "Sandwich Detection",
      subtitle: "Real-time mempool monitoring",
      desc: "Continuously scans pending transactions to identify front-running bots targeting your swap pair. AI models predict attack probability before you submit.",
      metric: "< 50ms detection",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      color: "hsl(var(--primary))",
      bg: "bg-primary/10",
      border: "border-primary/20",
      title: "Liquidity Health",
      subtitle: "Pool depth & slippage analysis",
      desc: "Evaluates pool depth, reserve ratios, recent volume trends, and price impact of your exact trade size. Powered by OnePredict volatility forecasts.",
      metric: "Live pool data",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
      color: "hsl(var(--accent))",
      bg: "bg-accent/10",
      border: "border-accent/20",
      title: "Wallet Reputation",
      subtitle: "OneID identity scoring",
      desc: "Checks counterparty addresses against OneID's database of known scammers, honeypot contracts, and flagged wallets. Reputation score updated in real-time.",
      metric: "500K+ flagged addresses",
    },
  ];

  return (
    <section id="solution" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="section-label mb-4">The Solution</div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            Introducing{" "}
            <span className="text-gradient">The Risk Oracle</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            A composable AI safety layer that scores every swap in real-time. Three models, one unified Safety Score — displayed in your wallet before you confirm.
          </p>
        </div>

        {/* Safety Score diagram */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="glass-card p-8 rounded-2xl">
            <div className="grid md:grid-cols-3 gap-4 items-center">
              {/* Component scores */}
              <div className="space-y-4">
                {[
                  { label: "Sandwich Risk", score: 12, good: true },
                  { label: "Liquidity Health", score: 91, good: true },
                  { label: "Wallet Risk", score: 8, good: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="text-xs text-foreground-muted w-28">{item.label}</div>
                    <div className="flex-1 h-2 bg-surface-highlight rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${item.label === "Sandwich Risk" || item.label === "Wallet Risk" ? item.score : item.score}%`,
                          background: item.good ? "hsl(var(--risk-safe))" : "hsl(var(--risk-danger))",
                        }}
                      />
                    </div>
                    <div className="font-mono text-xs text-risk-safe w-8 text-right">{item.score}</div>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-3">
                <div className="text-foreground-subtle text-sm font-mono">AI synthesis</div>
                <svg className="w-8 h-8 text-primary hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <svg className="w-8 h-8 text-primary md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* Final score */}
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--surface-highlight))" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="hsl(var(--risk-safe))"
                      strokeWidth="10"
                      strokeDasharray="264"
                      strokeDashoffset="31.7"
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 8px hsl(158 64% 52%))" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-bold text-4xl text-risk-safe">88</span>
                    <span className="font-mono text-xs text-foreground-subtle">SAFE</span>
                  </div>
                </div>
                <p className="text-sm text-foreground-muted mt-2">Safety Score</p>
                <p className="text-xs text-risk-safe font-mono">✅ Safe to swap</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className={`glass-card p-6 rounded-2xl border ${f.border}`} style={{ background: `linear-gradient(145deg, hsl(var(--surface-raised)), hsl(var(--surface)))` }}>
              <div className={`w-14 h-14 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`} style={{ color: f.color }}>
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-1">{f.title}</h3>
              <p className="text-xs font-mono mb-3" style={{ color: f.color }}>{f.subtitle}</p>
              <p className="text-sm text-foreground-muted leading-relaxed mb-4">{f.desc}</p>
              <div className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg ${f.bg} border ${f.border} inline-block`} style={{ color: f.color }}>
                {f.metric}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
