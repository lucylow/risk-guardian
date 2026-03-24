/**
 * AboutPage — project mission, features, tech stack, and team.
 */
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";

const FEATURES = [
  {
    icon: "🥪",
    title: "Sandwich Attack Detection",
    desc: "Real-time mempool scanning flags front-running bot patterns before they strike your swap.",
    badge: "AI-Powered",
    badgeCls: "bg-primary/10 border-primary/20 text-primary",
  },
  {
    icon: "💧",
    title: "Liquidity Pool Health",
    desc: "Deep analysis of TVL, LP concentration, and 24h volume forecasts pool stability using OnePredict data.",
    badge: "Predictive",
    badgeCls: "bg-risk-safe/10 border-risk-safe/20 text-risk-safe",
  },
  {
    icon: "🪪",
    title: "Wallet Reputation Scoring",
    desc: "Leverages OneID to flag risky addresses, anomalous on-chain behavior, and known exploiter wallets.",
    badge: "OneID",
    badgeCls: "bg-accent/10 border-accent/20 text-accent",
  },
  {
    icon: "🛡️",
    title: "Auto-Protect Mode",
    desc: "Automatically routes high-risk swaps through a private mempool to neutralize MEV exposure.",
    badge: "Automated",
    badgeCls: "bg-risk-moderate/10 border-risk-moderate/20 text-risk-moderate",
  },
  {
    icon: "🔗",
    title: "Native OneChain Integration",
    desc: "Built on OneDEX, OnePredict, OneID, and OneWallet APIs — deep ecosystem coverage from day one.",
    badge: "Ecosystem",
    badgeCls: "bg-primary/10 border-primary/20 text-primary",
  },
];

const INTEGRATIONS = [
  { name: "OneDEX", emoji: "🔄", desc: "Primary DEX — risk assessment runs before every swap confirmation." },
  { name: "OnePredict", emoji: "📈", desc: "Volatility forecasts and pool health signals for AI models." },
  { name: "OneID", emoji: "🪪", desc: "On-chain identity layer for wallet reputation scoring." },
  { name: "OneWallet", emoji: "👛", desc: "Native wallet integration — Safety Score shown in the swap flow." },
];

const STACK = [
  { label: "Frontend", value: "React + TypeScript + Tailwind CSS" },
  { label: "Backend", value: "Lovable Cloud Edge Functions" },
  { label: "Database", value: "Lovable Cloud (PostgreSQL + RLS)" },
  { label: "AI Engine", value: "Gemini 2.5 Flash via Lovable AI" },
  { label: "Auth", value: "OneWallet Signature Verification" },
  { label: "Realtime", value: "Lovable Cloud WebSocket Channels" },
];

const TEAM = [
  { name: "The Risk Oracle Team", role: "OneHack 3.0 · AI & GameFi Edition", emoji: "🚀" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-3xl">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="section-label mb-5">OneHack 3.0 · AI & GameFi Edition</div>
          <h1 className="font-display font-bold text-5xl mb-5">
            The Risk <span className="text-gradient">Oracle</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto leading-relaxed">
            An AI-powered risk assessment engine that gives traders a Safety Score before every swap on
            OneDEX — protecting against sandwich attacks, rug pulls, and suspicious wallets.
          </p>
        </div>

        {/* Mission */}
        <div className="glass-card rounded-2xl p-8 mb-8 border-l-4 border-primary hover:border-l-primary transition-none">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0 mt-0.5">
              🎯
            </div>
            <div>
              <h2 className="font-display font-bold text-xl mb-3 text-foreground">Mission</h2>
              <p className="text-foreground-muted leading-relaxed">
                DeFi is powerful but dangerous. Every year hundreds of millions of dollars are lost to MEV
                bots, rug pulls, and liquidity manipulation. The Risk Oracle exists to level the playing
                field — giving everyday traders the same intelligence that institutional participants take
                for granted, right inside their swap flow.
              </p>
            </div>
          </div>
        </div>

        {/* Key features */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl mb-5 text-foreground">Key Features</h2>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass-card rounded-xl p-5 flex items-start gap-4 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-xl shrink-0">
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-display font-semibold text-foreground">{f.title}</p>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${f.badgeCls}`}>
                      {f.badge}
                    </span>
                  </div>
                  <p className="text-sm text-foreground-muted leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OneChain Integrations */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl mb-5 text-foreground">OneChain Integrations</h2>
          <div className="grid grid-cols-2 gap-3">
            {INTEGRATIONS.map((i) => (
              <div key={i.name} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-colors">
                <div className="text-2xl mb-2">{i.emoji}</div>
                <p className="font-display font-semibold text-foreground mb-1">{i.name}</p>
                <p className="text-xs text-foreground-muted leading-relaxed">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl mb-5 text-foreground">Tech Stack</h2>
          <div className="glass-card rounded-2xl overflow-hidden">
            {STACK.map((s, i) => (
              <div
                key={s.label}
                className={`flex justify-between items-center px-6 py-4 hover:bg-surface-highlight/50 transition-colors ${
                  i < STACK.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="font-mono text-sm text-foreground-subtle">{s.label}</span>
                <span className="font-mono text-sm text-foreground font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl mb-5 text-foreground">Team</h2>
          <div className="space-y-3">
            {TEAM.map((t) => (
              <div
                key={t.name}
                className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-2xl">
                  {t.emoji}
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-foreground-muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center glass-card rounded-2xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
          <div className="relative">
            <div className="text-4xl mb-4">🔮</div>
            <p className="font-display font-bold text-2xl mb-2 text-foreground">
              Ready to swap safely?
            </p>
            <p className="text-foreground-muted mb-6 text-sm">
              Try the live demo and see your Safety Score in action.
            </p>
            <a
              href="/#demo"
              className="btn-primary inline-flex items-center gap-2 px-7 py-3 rounded-xl font-display font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Try the Demo
            </a>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
