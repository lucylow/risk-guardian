/**
 * TopNav — Fixed top bar with logo, search hint, and wallet status.
 */

import { Link } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import WalletConnectButton from "@/components/WalletConnectButton";

interface TopNavProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export default function TopNav({ sidebarOpen, onSidebarToggle }: TopNavProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/90 backdrop-blur-md border-b border-border"
      role="banner"
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-highlight transition-colors"
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src={logoIcon}
              alt=""
              className="w-8 h-8 group-hover:scale-110 transition-transform duration-200"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display font-bold text-sm text-foreground">
                Risk <span className="text-primary">Oracle</span>
              </span>
              <span className="text-[10px] font-mono text-foreground-subtle tracking-wider">
                OneChain
              </span>
            </div>
          </Link>
        </div>

        {/* Center: search hint (desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground-subtle text-sm cursor-pointer hover:border-border-bright transition-colors max-w-xs w-full">
          <Search className="w-4 h-4 shrink-0" />
          <span className="truncate">Search pages…</span>
          <kbd className="hidden lg:inline-flex ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-raised border border-border">
            ⌘K
          </kbd>
        </div>

        {/* Right: wallet */}
        <div className="flex items-center gap-2">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
