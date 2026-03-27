/**
 * AppShell — Root layout wrapper with sidebar, topbar, breadcrumbs, and mobile bottom nav.
 * Wraps all inner pages (not the landing page which has its own layout).
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopNav from "./TopNav";
import NavSidebar from "./NavSidebar";
import MobileBottomNav from "./MobileBottomNav";
import Breadcrumbs from "./Breadcrumbs";
import SkipLink from "./SkipLink";
import ScrollProgressBar from "@/components/ScrollProgressBar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SkipLink />
      <ScrollProgressBar />

      {/* Top Navigation */}
      <TopNav
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex pt-16">
        {/* Desktop sidebar — always visible on lg+ */}
        <NavSidebar
          className={`fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        />

        {/* Main content area */}
        <main
          id="main-content"
          className="flex-1 min-h-[calc(100vh-4rem)] lg:ml-64 pb-20 md:pb-0"
        >
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
