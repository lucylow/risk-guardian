import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";

const FEATURES = [
  { icon: "🥪", title: "Sandwich Attack Detection", desc: "AI analysis of mempool patterns predicts front-running bots before they strike." },
  { icon: "💧", title: "Liquidity Pool Health", desc: "Deep-learning models forecast pool stability using OnePredict volatility data." },
  { icon: "🪪", title: "Wallet Reputation Scoring", desc: "Leverages OneID to flag risky addresses and anomalous on-chain behaviour." },
  { icon: "🛡️", title: "Auto-Protect Mode", desc: "Automatically routes high-risk swaps through a private mempool." },
  { icon: "🔗", title: "Native OneChain Integration", desc: "Built on OneDEX, OnePredict, OneID, and OneWallet APIs for seamless coverage." },
];

const TEAM = [
  { name: "The Risk Oracle Team", role: "OneHack 3.0 Participants", emoji: "🚀" },
];

const STACK = [
  { label: "Frontend", value: "React + TypeScript + Tailwind" },
  { label: "Backend", value: "Lovable Cloud Edge Functions" },
  { label: "Database", value: "Lovable Cloud (PostgreSQL)" },
  { label: "AI Models", value: "OnePredict + Custom Heuristics" },
  { label: "Auth", value: "OneWallet Signature Verification" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-label mb-4">OneHack 3.0 · AI & GameFi Edition</div>
          <h1 className="font-display font-bold text-5xl mb-4">
            The Risk <span className="text-gradient">Oracle</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            An AI-powered risk assessment engine that gives traders a Safety Score before every swap on OneDEX — protecting against sandwich attacks, rug pulls, and suspicious wallets.
          </p>
        </div>

        {/* Mission */}
        <div className="glass-card rounded-2xl p-8 mb-8 border-l-4 border-primary">
          <h2 className="font-display font-bold text-2xl mb-3 text-foreground">Mission</h2>
          <p className="text-foreground-muted leading-relaxed">
            DeFi is powerful but dangerous. Every year hundreds of millions of dollars are lost to MEV bots, rug pulls, and liquidity manipulation. The Risk Oracle exists to level the playing field — giving everyday traders the same intelligence that institutional participants take for granted.
          </p>
        </div>

        {/* Features */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl mb-5 text-foreground">Key Features</h2>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card rounded-xl p-5 flex items-start gap-4">
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <p className="font-display font-semibold text-foreground">{f.title}</p>
                  <p className="text-sm text-foreground-muted mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl mb-5 text-foreground">Tech Stack</h2>
          <div className="glass-card rounded-2xl overflow-hidden">
            {STACK.map((s, i) => (
              <div
                key={s.label}
                className={`flex justify-between items-center px-6 py-4 ${
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
              <div key={t.name} className="glass-card rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-2xl">
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
        <div className="text-center glass-card rounded-2xl p-8">
          <p className="font-display font-bold text-xl mb-4 text-foreground">
            Ready to swap safely?
          </p>
          <a href="/#demo" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-display font-semibold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            Try the Demo
          </a>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
