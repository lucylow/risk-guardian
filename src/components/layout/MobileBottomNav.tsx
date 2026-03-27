/**
 * MobileBottomNav — Fixed bottom navigation for mobile screens.
 */

import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, Gamepad2, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/play", label: "Play", icon: Gamepad2 },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/95 backdrop-blur-md border-t border-border"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center justify-around h-14">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = location.pathname === href;
          return (
            <li key={href}>
              <Link
                to={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-foreground-subtle hover:text-foreground-muted"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary))]")} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
