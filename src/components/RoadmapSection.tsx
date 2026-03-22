import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function RoadmapSection() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.2);

  const items = [
    {
      phase: "Phase 1", label: "LIVE", status: "done",
      color: "hsl(var(--risk-safe))", bg: "bg-risk-safe/10", border: "border-risk-safe/30",
      title: "MVP – Safety Score Engine", quarter: "Q2 2025",
      items: ["Sandwich attack detection (mock + basic mempool)", "Liquidity pool health scoring", "Wallet reputation via OneID", "OneDEX integration (pre-swap display)", "OneWallet safety gauge UI"],
    },
    {
      phase: "Phase 2", label: "BUILDING", status: "in-progress",
      color: "hsl(var(--primary))", bg: "bg-primary/10", border: "border-primary/25",
      title: "Real-time AI Models", quarter: "Q3 2025",
      items: ["Live mempool streaming integration", "GBM sandwich attack classifier (trained on historical data)", "OnePredict volatility pipeline", "REST API for third-party dApp integration", "Real-time risk alerts in OneWallet"],
    },
    {
      phase: "Phase 3", label: "PLANNED", status: "planned",
      color: "hsl(var(--accent))", bg: "bg-accent/10", border: "border-accent/20",
      title: "Advanced Protection", quarter: "Q4 2025",
      items: ["Flashbots / private mempool routing integration", "MEV-protected transaction submission", "Cross-chain risk assessment (ETH, BSC)", "Historical risk analytics dashboard", "Developer SDK for protocol integrations"],
    },
    {
      phase: "Phase 4", label: "FUTURE", status: "future",
      color: "hsl(var(--foreground-muted))", bg: "bg-surface-highlight", border: "border-border",
      title: "Ecosystem Expansion", quarter: "2026",
      items: ["On-chain Oracle contract for composable risk data", "Risk score NFT badges via OneID", "DAO governance for risk parameters", "Insurance protocol integration", "Mobile SDK for OneWallet native app"],
    },
  ];

  return (
    <section id="roadmap" className="py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="section-label mb-4">Roadmap</div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            Building the{" "}
            <span className="text-gradient">future of DeFi safety</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            From hackathon MVP to production-grade AI protection layer — here's the journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => {
            const { ref, visible } = useScrollReveal(0.1);
            return (
              <div
                key={i}
                ref={ref}
                className={`glass-card p-6 rounded-2xl border ${item.border} hover:scale-[1.02] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${item.status === "done" ? "shadow-glow-safe" : item.status === "in-progress" ? "shadow-glow-primary" : ""}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono text-foreground-subtle">{item.phase}</span>
                  <span
                    className={`ml-auto text-xs font-mono font-bold px-2 py-0.5 rounded-full ${item.bg} border ${item.border}`}
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-foreground mb-1">{item.title}</h3>
                <p className="font-mono text-xs mb-4" style={{ color: item.color }}>{item.quarter}</p>

                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${item.status === "done" ? "bg-risk-safe animate-pulse" : item.status === "in-progress" ? "bg-primary animate-pulse" : "bg-border"}`} />
                  <div className="flex-1 h-px bg-border-bright" />
                </div>

                <ul className="space-y-2">
                  {item.items.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-foreground-muted">
                      <div
                        className={`w-1 h-1 rounded-full flex-shrink-0 mt-1.5 ${
                          item.status === "done" ? "bg-risk-safe" : item.status === "in-progress" ? "bg-primary" : "bg-foreground-subtle"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
