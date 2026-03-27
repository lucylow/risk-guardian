import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";
import WalletConnectButton from "./WalletConnectButton";

const SECTIONS = ["problem", "solution", "demo", "how-it-works", "roadmap", "team"];

const NAV_GROUPS = [
  {
    label: "User",
    links: [
      { label: "Portfolio", href: "/portfolio", icon: "💼" },
      { label: "Simulator", href: "/simulator", icon: "🧪" },
      { label: "Play", href: "/play", icon: "🎮" },
      { label: "Alerts", href: "/alerts", icon: "🔔" },
      { label: "History", href: "/history", icon: "📜" },
      { label: "Settings", href: "/settings", icon: "⚙️" },
    ],
  },
  {
    label: "Advanced",
    links: [
      { label: "Oracle", href: "/oracle", icon: "⛓️" },
      { label: "Integrations", href: "/integration", icon: "🔗" },
      { label: "Risk Model", href: "/docs/risk-model", icon: "📊" },
      { label: "Experiments", href: "/experiments", icon: "🔬" },
      { label: "Developers", href: "/developers", icon: "💻" },
      { label: "About", href: "/about", icon: "ℹ️" },
    ],
  },
];

const ALL_PAGE_LINKS = NAV_GROUPS.flatMap((g) => g.links);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      let current = "";
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const showBg = scrolled || !isHome;

  const sectionLinks = [
    { label: "Problem", href: "/#problem", id: "problem" },
    { label: "Solution", href: "/#solution", id: "solution" },
    { label: "Demo", href: "/#demo", id: "demo" },
    { label: "How It Works", href: "/#how-it-works", id: "how-it-works" },
    { label: "Roadmap", href: "/#roadmap", id: "roadmap" },
    { label: "Team", href: "/#team", id: "team" },
  ];

  // Compact top-bar links (most important ones)
  const TOP_BAR_LINKS = [
    { label: "Portfolio", href: "/portfolio", icon: "💼" },
    { label: "Simulator", href: "/simulator", icon: "🧪" },
    { label: "Play", href: "/play", icon: "🎮" },
    { label: "Alerts", href: "/alerts", icon: "🔔" },
  ];

  return (
    <header
      className={`fixed top-0.5 left-0 right-0 z-50 transition-all duration-300 ${
        showBg
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src={logoIcon}
            alt="The Risk Oracle"
            className="w-8 h-8 group-hover:scale-110 transition-transform duration-200"
          />
          <span className="font-display font-bold text-lg text-foreground">
            The Risk <span className="text-gradient">Oracle</span>
          </span>
        </Link>

        {/* Desktop nav — section links (only shown on home) */}
        {isHome && (
          <nav className="hidden lg:flex items-center gap-1">
            {sectionLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`relative text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                  active === l.id
                    ? "text-primary bg-primary/10"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-highlight"
                }`}
              >
                {l.label}
                {active === l.id && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </a>
            ))}
          </nav>
        )}

        {/* Desktop right — page links + CTA */}
        <div className="hidden md:flex items-center gap-1">
          {TOP_BAR_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className={`text-sm px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                location.pathname === l.href
                  ? "text-primary bg-primary/10"
                  : "text-foreground-muted hover:text-foreground hover:bg-surface-highlight"
              }`}
            >
              <span className="text-xs">{l.icon}</span>
              {l.label}
            </Link>
          ))}
          {/* More dropdown */}
          <div className="relative group">
            <button className="text-sm px-2.5 py-1.5 rounded-lg font-medium text-foreground-muted hover:text-foreground hover:bg-surface-highlight transition-colors flex items-center gap-1">
              <span className="text-xs">⋯</span> More
            </button>
            <div className="absolute right-0 top-full mt-1 w-52 bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
              {NAV_GROUPS.map((g) => (
                <div key={g.label}>
                  <p className="px-4 py-1.5 text-[10px] font-mono text-foreground-subtle uppercase tracking-wider">{g.label}</p>
                  {g.links
                    .filter((l) => !TOP_BAR_LINKS.some((t) => t.href === l.href))
                    .map((l) => (
                    <Link
                      key={l.label}
                      to={l.href}
                      className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                        location.pathname === l.href
                          ? "text-primary bg-primary/5"
                          : "text-foreground-muted hover:text-foreground hover:bg-surface-highlight"
                      }`}
                    >
                      <span className="text-xs">{l.icon}</span>
                      {l.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="ml-2">
            <WalletConnectButton />
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-highlight transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-surface/95 backdrop-blur-md border-t border-border px-4 py-4 flex flex-col gap-1 shadow-xl max-h-[80vh] overflow-y-auto">
          {isHome && sectionLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2.5 rounded-lg font-medium transition-colors ${
                active === l.id
                  ? "text-primary bg-primary/10"
                  : "text-foreground-muted hover:text-foreground hover:bg-surface-highlight"
              }`}
            >
              {l.label}
            </a>
          ))}
          {NAV_GROUPS.map((g) => (
            <div key={g.label} className={isHome ? "border-t border-border pt-2 mt-1" : ""}>
              <p className="px-3 py-1 text-[10px] font-mono text-foreground-subtle uppercase tracking-wider">{g.label}</p>
              {g.links.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    location.pathname === l.href
                      ? "text-primary bg-primary/10"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface-highlight"
                  }`}
                >
                  <span>{l.icon}</span>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
          <a href="/#demo" className="btn-primary px-4 py-2.5 text-sm rounded-lg text-center mt-2">
            Try Demo
          </a>
        </div>
      )}
    </header>
  );
}
