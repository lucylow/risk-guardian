import { useOneWallet } from "@/hooks/useOneWallet";

const QUESTS = [
  { id: "safe-10", title: "Safe Trader", description: "Complete 10 swaps with Safety Score > 80", reward: "🏅 Gold Shield Badge + 500 XP", progress: 7, total: 10 },
  { id: "streak-7", title: "Risk Avoidance Streak", description: "Avoid all high-risk scores for 7 days", reward: "🛡️ Iron Guard Badge + 300 XP", progress: 5, total: 7 },
  { id: "diverse-5", title: "Diversifier", description: "Assess risk on 5 different token pairs", reward: "🌐 Explorer Badge + 200 XP", progress: 3, total: 5 },
  { id: "whale-1", title: "Whale Whisperer", description: "Complete a $10,000+ swap with Safety Score > 60", reward: "🐋 Whale Badge + 1000 XP", progress: 0, total: 1 },
];

export default function PlayPage() {
  const { gamification } = useOneWallet();

  return (
    <>
      <section className="pb-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-risk-safe/5 rounded-full blur-3xl" />
        </div>
        <div className="text-center">
          <div className="section-label mb-4 inline-flex">GameFi</div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            Play Safe, <span className="text-gradient">Earn More</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Turn safe trading behaviors into XP, badges, and achievements — powered by OnePlay & OnePoker.
          </p>
        </div>
      </section>

      {/* Stats */}
      {gamification && (
        <section className="pb-10">
          <div className="glass-card rounded-2xl p-8 border border-border grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-foreground-subtle text-xs font-mono mb-1">Level</p>
              <p className="font-display font-bold text-3xl text-primary">{gamification.level}</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs font-mono mb-1">XP</p>
              <p className="font-display font-bold text-3xl text-foreground">{gamification.xp.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs font-mono mb-1">Safe Streak</p>
              <p className="font-display font-bold text-3xl text-risk-safe">{gamification.safeTradeStreak}</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs font-mono mb-1">Badges</p>
              <p className="font-display font-bold text-3xl text-accent">{gamification.badges.length}</p>
            </div>
          </div>
        </section>
      )}

      {/* Badges */}
      {gamification && gamification.badges.length > 0 && (
        <section className="pb-10">
          <h2 className="font-display font-bold text-2xl mb-6">Your Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gamification.badges.map((b) => (
              <div key={b.id} className="glass-card rounded-xl p-5 border border-border text-center">
                <span className="text-3xl mb-2 block">{b.icon}</span>
                <p className="font-display font-semibold text-foreground text-sm">{b.name}</p>
                <p className="text-foreground-subtle text-xs mt-1">{b.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Risk Quests */}
      <section className="pb-12">
        <h2 className="font-display font-bold text-2xl mb-6">Risk Quests</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {QUESTS.map((q) => (
            <div key={q.id} className="glass-card rounded-xl p-6 border border-border">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-display font-semibold text-foreground">{q.title}</h3>
                <span className="text-xs font-mono text-foreground-subtle">{q.progress}/{q.total}</span>
              </div>
              <p className="text-foreground-muted text-sm mb-3">{q.description}</p>
              <div className="w-full h-2 rounded-full bg-surface-highlight overflow-hidden mb-3">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${(q.progress / q.total) * 100}%` }} />
              </div>
              <p className="text-xs font-mono text-accent">{q.reward}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OnePoker concept */}
      <section className="pb-12">
        <div className="glass-card rounded-2xl p-8 md:p-12 border border-primary/20 text-center">
          <span className="text-5xl mb-4 block">🃏</span>
          <h2 className="font-display font-bold text-3xl mb-4">OnePoker × Risk Engine</h2>
          <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
            Imagine dynamic multipliers adjusted by the same Safety Score engine. High-risk hands get bigger potential payouts — but the same transparency and protection. This is the future of risk-aware GameFi on OneChain.
          </p>
        </div>
      </section>
    </>
  );
}
