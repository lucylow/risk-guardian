/**
 * NavSidebar — Grouped navigation sidebar with icons and badges.
 */

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FlaskConical,
  Gamepad2,
  Bell,
  Clock,
  Settings,
  Link2,
  Code,
  Database,
  BookOpen,
  Info,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Core",
    defaultOpen: true,
    items: [
      { href: "/portfolio", label: "Portfolio", icon: Briefcase },
      { href: "/simulator", label: "Simulator", icon: FlaskConical },
      { href: "/alerts", label: "Alerts", icon: Bell },
      { href: "/history", label: "History", icon: Clock },
    ],
  },
  {
    label: "OneChain",
    defaultOpen: true,
    items: [
      { href: "/play", label: "Play & Earn", icon: Gamepad2, badge: "New" },
      { href: "/oracle", label: "Oracle", icon: Database },
      { href: "/integration", label: "Integrations", icon: Link2 },
    ],
  },
  {
    label: "Developer",
    defaultOpen: false,
    items: [
      { href: "/developers", label: "Developers", icon: Code },
      { href: "/docs/risk-model", label: "Risk Model", icon: BookOpen },
      { href: "/experiments", label: "Experiments", icon: Sparkles },
      { href: "/about", label: "About", icon: Info },
    ],
  },
];

function SidebarGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  const hasActive = group.items.some((item) => pathname === item.href);
  const [open, setOpen] = useState(group.defaultOpen || hasActive);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-foreground-subtle hover:text-foreground-muted transition-colors"
        aria-expanded={open}
      >
        {group.label}
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <ul className="space-y-0.5 mb-2" role="list">
          {group.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface-highlight"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface NavSidebarProps {
  className?: string;
}

export default function NavSidebar({ className }: NavSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "bg-surface border-r border-border overflow-y-auto",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex flex-col h-full px-3 py-4">
        {/* Dashboard link (always top) */}
        <Link
          to="/"
          aria-current={location.pathname === "/" ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold mb-3 transition-all duration-150",
            location.pathname === "/"
              ? "bg-primary/10 text-primary"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-highlight"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>

        {/* Grouped nav */}
        <div className="flex-1 space-y-1">
          {NAV_GROUPS.map((group) => (
            <SidebarGroup
              key={group.label}
              group={group}
              pathname={location.pathname}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-3 mt-3">
          <Link
            to="/settings"
            aria-current={location.pathname === "/settings" ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
              location.pathname === "/settings"
                ? "bg-primary/10 text-primary"
                : "text-foreground-muted hover:text-foreground hover:bg-surface-highlight"
            )}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
