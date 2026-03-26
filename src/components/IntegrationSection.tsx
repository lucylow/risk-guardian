export default function IntegrationSection() {
  const integrations = [
    {
      name: "OneDEX",
      icon: "⚡",
      color: "hsl(var(--primary))",
      bg: "bg-primary/10",
      border: "border-primary/20",
      role: "Primary Integration",
      desc: "Safety Score displayed directly in the swap interface — users see their risk before confirming any trade.",
      features: ["Pre-swap risk gate", "Real-time pool data", "Slippage recommendations"],
    },
    {
      name: "OnePredict",
      icon: "📈",
      color: "hsl(var(--accent))",
      bg: "bg-accent/10",
      border: "border-accent/20",
      role: "Volatility Intelligence",
      desc: "Feeds short-term price volatility forecasts into the liquidity health model for enhanced accuracy.",
      features: ["Price volatility signals", "Pool drain prediction", "Trend anomaly alerts"],
    },
    {
      name: "OneID",
      icon: "🪪",
      color: "hsl(var(--risk-safe))",
      bg: "bg-risk-safe/10",
      border: "border-risk-safe/20",
      role: "Identity & Reputation",
      desc: "Cross-chain DID providing on-chain reputation scores, flagging known scammers and honeypots.",
      features: ["Cross-chain DID", "Reputation tiers", "Risk flag database"],
    },
    {
      name: "OneWallet",
      icon: "👛",
      color: "hsl(var(--risk-moderate))",
      bg: "bg-risk-moderate/10",
      border: "border-risk-moderate/20",
      role: "Auth & Signing",
      desc: "Native wallet with Zero Gas Mode, USDO stable yield, and seamless message signing for risk assessments.",
      features: ["Zero Gas Mode", "USDO / OCT balances", "Message signing"],
    },
    {
      name: "OneTransfer",
      icon: "🔄",
      color: "hsl(var(--primary))",
      bg: "bg-primary/10",
      border: "border-primary/20",
      role: "Token Routing",
      desc: "Analyzes transfer paths and hop complexity to adjust risk scoring for cross-chain and bridged transactions.",
      features: ["Path analysis", "Bridge detection", "Hop-based risk"],
    },
    {
      name: "OneRWA",
      icon: "🏛️",
      color: "hsl(var(--accent))",
      bg: "bg-accent/10",
      border: "border-accent/20",
      role: "RWA Collateral",
      desc: "Real-World Asset exposure feeds into systemic risk scoring — collateralized positions lower overall risk.",
      features: ["Collateral strength", "Diversification index", "RWA portfolio view"],
    },
    {
      name: "OnePlay",
      icon: "🎮",
      color: "hsl(var(--risk-safe))",
      bg: "bg-risk-safe/10",
      border: "border-risk-safe/20",
      role: "GameFi Hooks",
      desc: "Gamification layer with badges, XP, safe-trade streaks, and risk quests for an engaging user experience.",
      features: ["Trade badges", "Safe streak tracking", "Risk quests"],
    },
    {
      name: "OnePoker",
      icon: "🃏",
      color: "hsl(var(--risk-moderate))",
      bg: "bg-risk-moderate/10",
      border: "border-risk-moderate/20",
      role: "Social Risk",
      desc: "Social gaming context brings playful risk awareness — \"know when to hold, know when to fold.\"",
      features: ["Risk awareness UI", "Social signals", "Community badges"],
    },
  ];

  return (
    <section id="integration" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="section-label mb-4">Ecosystem Integration</div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            Native to the{" "}
            <span className="text-gradient">OneChain Ecosystem</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            The Risk Oracle is deeply embedded across 8 OneChain products — not a plugin, but a native safety layer.
          </p>
        </div>

        {/* Central diagram */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <div className="glass-card p-8 rounded-3xl text-center relative overflow-hidden">
            <div className="relative z-10 w-20 h-20 mx-auto rounded-2xl bg-gradient-brand flex items-center justify-center mb-3 shadow-glow-primary">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-2xl text-gradient">The Risk Oracle</h3>
            <p className="text-foreground-muted text-sm mt-1">AI Safety Engine · 8 Integrations</p>

            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                {[80, 200, 330, 470, 600, 720, 150, 650].map((x, i) => (
                  <line key={i} x1="400" y1="100" x2={x} y2={i % 2 === 0 ? 15 : 185} stroke="hsl(239 84% 67% / 0.12)" strokeWidth="1" strokeDasharray="4 4" />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Integration cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {integrations.map((item) => (
            <div key={item.name} className={`glass-card p-6 rounded-2xl border ${item.border} hover:scale-[1.02] transition-transform`}>
              <div className={`w-12 h-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center text-2xl mb-4`}>
                {item.icon}
              </div>
              <div className="font-display font-bold text-xl text-foreground mb-0.5">{item.name}</div>
              <div className="text-xs font-mono mb-3" style={{ color: item.color }}>{item.role}</div>
              <p className="text-sm text-foreground-muted mb-4 leading-relaxed">{item.desc}</p>
              <ul className="space-y-1.5">
                {item.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-foreground-muted">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
