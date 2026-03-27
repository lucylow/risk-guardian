/**
 * Breadcrumbs — Auto-generated from current route path.
 */

import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const LABEL_MAP: Record<string, string> = {
  portfolio: "Portfolio",
  simulator: "Simulator",
  play: "Play & Earn",
  alerts: "Alerts",
  history: "History",
  settings: "Settings",
  integration: "Integrations",
  developers: "Developers",
  docs: "Docs",
  "risk-model": "Risk Model",
  oracle: "Oracle",
  about: "About",
  experiments: "Experiments",
  demo: "Demo",
  roadmap: "Roadmap",
  "how-it-works": "How It Works",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1.5 text-sm text-foreground-muted">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {segments.map((segment, i) => {
          const path = "/" + segments.slice(0, i + 1).join("/");
          const label =
            LABEL_MAP[segment] ||
            segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          const isLast = i === segments.length - 1;

          return (
            <li key={path} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-foreground-subtle" />
              {isLast ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to={path} className="hover:text-foreground transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
