export default function TeamSection() {
  const team = [
    {
      name: "Alex Chen",
      role: "Lead AI Engineer",
      bio: "Former MEV researcher at Flashbots. Specialist in on-chain data pipelines and adversarial ML. Built the sandwich attack classifier.",
      avatar: "AC",
      color: "hsl(var(--primary))",
      bg: "bg-primary/10",
      links: { github: "#", twitter: "#" },
    },
    {
      name: "Maya Patel",
      role: "DeFi Protocol Engineer",
      bio: "5 years building DEX infrastructure. Integrated OneDEX smart contracts with the Oracle's risk API and designed the slippage recommendation engine.",
      avatar: "MP",
      color: "hsl(var(--accent))",
      bg: "bg-accent/10",
      links: { github: "#", twitter: "#" },
    },
    {
      name: "Jordan Lee",
      role: "Full-Stack Developer",
      bio: "Built the OneWallet safety gauge UI and the REST API microservice. Contributor to the OneChain developer toolkit.",
      avatar: "JL",
      color: "hsl(var(--risk-safe))",
      bg: "bg-risk-safe/10",
      links: { github: "#", twitter: "#" },
    },
  ];

  return (
    <section id="team" className="py-24 relative hex-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="section-label mb-4">Team</div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            Built by{" "}
            <span className="text-gradient">DeFi builders</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-xl mx-auto">
            A focused team of blockchain engineers, AI researchers, and protocol designers passionate about making DeFi safer.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-7 max-w-4xl mx-auto">
          {team.map((member) => (
            <div key={member.name} className="glass-card p-7 rounded-2xl text-center group hover:scale-[1.02] transition-transform">
              {/* Avatar */}
              <div
                className={`w-20 h-20 rounded-2xl ${member.bg} border border-border mx-auto mb-4 flex items-center justify-center font-display font-bold text-2xl`}
                style={{ color: member.color }}
              >
                {member.avatar}
              </div>

              <h3 className="font-display font-bold text-xl text-foreground mb-1">{member.name}</h3>
              <p className="text-xs font-mono mb-3" style={{ color: member.color }}>{member.role}</p>
              <p className="text-sm text-foreground-muted leading-relaxed mb-5">{member.bio}</p>

              {/* Social links */}
              <div className="flex items-center justify-center gap-3">
                <a href={member.links.github} className="w-8 h-8 rounded-lg bg-surface-highlight flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a href={member.links.twitter} className="w-8 h-8 rounded-lg bg-surface-highlight flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto mt-16 glass-card p-8 rounded-3xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand mx-auto mb-4 flex items-center justify-center shadow-glow-primary">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-2xl text-foreground mb-2">Want to Integrate?</h3>
          <p className="text-foreground-muted mb-6">
            Building a dApp on OneChain? Reach out — we'd love to embed The Risk Oracle into your protocol.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:team@riskoracle.one" className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact the Team
            </a>
            <a href="#demo" className="btn-ghost px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2">
              Try the Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
