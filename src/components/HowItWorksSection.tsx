import { useScrollReveal } from "@/hooks/use-scroll-reveal";

type Step = {
  number: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  details: string[];
  color: string;
  bg: string;
  border: string;
};

function StepCard({ step, delay }: { step: Step; delay: number }) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={`relative transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex justify-center mb-6">
        <div
          className={`w-14 h-14 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center hover:scale-110 transition-transform duration-300`}
          style={{ color: step.color, boxShadow: `0 0 20px ${step.color}30` }}
        >
          {step.icon}
        </div>
      </div>
      <div className="glass-card p-6 rounded-2xl text-center lg:text-left hover:border-primary/30 transition-colors duration-300">
        <div className="font-mono text-xs mb-2" style={{ color: step.color }}>STEP {step.number}</div>
        <h3 className="font-display font-bold text-xl text-foreground mb-1">{step.title}</h3>
        <p className="text-xs text-foreground-subtle font-mono mb-4">{step.subtitle}</p>
        <ul className="space-y-2">
          {step.details.map((d) => (
            <li key={d} className="flex items-start gap-2 text-sm text-foreground-muted">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: step.color }} />
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.2);
  const { ref: archRef, visible: archVisible } = useScrollReveal(0.15);

  const steps: Step[] = [
    {
      number: "01",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      title: "Data Ingestion", subtitle: "Real-time multi-source",
      details: ["Mempool scanning for pending txs targeting your pair", "On-chain pool reserves & depth from OneDEX", "Wallet history lookup via OneID reputation API", "Volatility signals from OnePredict forecasts"],
      color: "hsl(var(--accent))", bg: "bg-accent/10", border: "border-accent/20",
    },
    {
      number: "02",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
        </svg>
      ),
      title: "AI Models", subtitle: "Three specialized engines",
      details: ["Sandwich classifier: GBM model on mempool features", "Liquidity scorer: Pool health regression + Monte Carlo", "Wallet reputation: Graph neural network via OneID", "All three scores synthesized into unified Safety Score"],
      color: "hsl(var(--primary))", bg: "bg-primary/10", border: "border-primary/20",
    },
    {
      number: "03",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Safety Score Delivered", subtitle: "Native wallet integration",
      details: ["Score (0-100) displayed in OneWallet UI", "Color-coded gauge: green / amber / red", "Plain-language explanation + actionable recommendations", "Optional hard block for scores below threshold"],
      color: "hsl(var(--risk-safe))", bg: "bg-risk-safe/10", border: "border-risk-safe/20",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative hex-bg">
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="section-label mb-4">How It Works</div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            Three steps to a{" "}
            <span className="text-gradient">safe swap</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            From raw blockchain data to a human-readable safety score in under 50 milliseconds.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="hidden lg:block absolute top-16 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-accent/30 via-primary/50 to-risk-safe/30" />
          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, i) => <StepCard key={step.number} step={step} delay={i * 150} />)}
          </div>
        </div>

        <div
          ref={archRef}
          className={`max-w-3xl mx-auto mt-12 glass-card p-6 rounded-2xl transition-all duration-700 ${archVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-1">Technical Architecture</h4>
              <p className="text-sm text-foreground-muted leading-relaxed">
                The Oracle runs as an off-chain microservice with sub-50ms P95 response time. Data is cached at the mempool layer and only fresh predictions are computed per request. The Safety Score API is RESTful and designed for easy dApp integration — any protocol on OneChain can embed risk scoring with a single API call.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
