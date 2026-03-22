import logoIcon from "@/assets/logo-icon.png";

export default function Footer() {
  const links = {
    Product: [
      { label: "Demo", href: "#demo" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Roadmap", href: "#roadmap" },
      { label: "Integration API", href: "#" },
    ],
    Ecosystem: [
      { label: "OneDEX", href: "#" },
      { label: "OnePredict", href: "#" },
      { label: "OneID", href: "#" },
      { label: "OneWallet", href: "#" },
    ],
    Developers: [
      { label: "Documentation", href: "#" },
      { label: "SDK", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Changelog", href: "#" },
    ],
    Community: [
      { label: "Twitter / X", href: "#" },
      { label: "Discord", href: "#" },
      { label: "Telegram", href: "#" },
      { label: "Blog", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-border">
      {/* Early access bar */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-border py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="section-label mb-4 inline-flex">Early Access</div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-3">
            Be the first to swap <span className="text-gradient">risk-free.</span>
          </h2>
          <p className="text-foreground-muted mb-6 max-w-lg mx-auto">
            Join the waitlist for early access to The Risk Oracle when it launches on OneDEX mainnet.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground-subtle font-mono text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button type="submit" className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap">
              Request Access
            </button>
          </form>
          <p className="text-xs text-foreground-subtle mt-3 font-mono">No spam. Unsubscribe anytime.</p>
        </div>
      </div>

      {/* Main footer */}
      <div className="py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={logoIcon} alt="The Risk Oracle" className="w-8 h-8" />
                <span className="font-display font-bold text-foreground">
                  Risk <span className="text-gradient">Oracle</span>
                </span>
              </div>
              <p className="text-sm text-foreground-muted leading-relaxed mb-4">
                AI-powered DeFi safety engine. Protecting traders on OneChain.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-risk-safe animate-pulse" />
                <span className="text-xs font-mono text-foreground-muted">OneHack 3.0 Submission</span>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(links).map(([group, items]) => (
              <div key={group}>
                <h4 className="font-display font-semibold text-sm text-foreground mb-4">{group}</h4>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foreground-subtle font-mono">
            <span>© 2025 The Risk Oracle — Built for OneHack 3.0 · OneDEX × OneChain Labs</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-foreground transition-colors">Disclaimer</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
