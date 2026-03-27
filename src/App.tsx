import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import DemoPage from "./pages/DemoPage.tsx";
import RoadmapPage from "./pages/RoadmapPage.tsx";
import HowItWorksPage from "./pages/HowItWorksPage.tsx";
import IntegrationPage from "./pages/IntegrationPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import HistoryPage from "./pages/HistoryPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import PortfolioPage from "./pages/PortfolioPage.tsx";
import SimulatorPage from "./pages/SimulatorPage.tsx";
import PlayPage from "./pages/PlayPage.tsx";
import DevelopersPage from "./pages/DevelopersPage.tsx";
import RiskModelPage from "./pages/RiskModelPage.tsx";
import AlertsPage from "./pages/AlertsPage.tsx";
import ExperimentsPage from "./pages/ExperimentsPage.tsx";
import OraclePage from "./pages/OraclePage.tsx";
import NotFound from "./pages/NotFound.tsx";
import DemoModeToggle from "./components/DemoModeToggle";
import AppShell from "./components/layout/AppShell";
import { isMockModeEnabled, setMockModeEnabled } from "./lib/mockMode";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [useMock, setUseMock] = useState<boolean>(() => isMockModeEnabled());

  const toggleMock = () => {
    const next = !useMock;
    setUseMock(next);
    setMockModeEnabled(next);
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing page — has its own full-width layout */}
            <Route path="/" element={<Index />} />

            {/* All inner pages wrapped in AppShell (sidebar + topbar) */}
            <Route element={<AppShell><Routes><Route path="*" element={null} /></Routes></AppShell>}>
              {/* This won't work — use layout route pattern instead */}
            </Route>
          </Routes>

          {/* Use a simpler approach: AppShell wrapper per route group */}
          <Routes>
            <Route path="/demo" element={<AppShell><DemoPage /></AppShell>} />
            <Route path="/roadmap" element={<AppShell><RoadmapPage /></AppShell>} />
            <Route path="/how-it-works" element={<AppShell><HowItWorksPage /></AppShell>} />
            <Route path="/integration" element={<AppShell><IntegrationPage /></AppShell>} />
            <Route path="/settings" element={<AppShell><SettingsPage /></AppShell>} />
            <Route path="/history" element={<AppShell><HistoryPage /></AppShell>} />
            <Route path="/about" element={<AppShell><AboutPage /></AppShell>} />
            <Route path="/portfolio" element={<AppShell><PortfolioPage /></AppShell>} />
            <Route path="/simulator" element={<AppShell><SimulatorPage /></AppShell>} />
            <Route path="/play" element={<AppShell><PlayPage /></AppShell>} />
            <Route path="/developers" element={<AppShell><DevelopersPage /></AppShell>} />
            <Route path="/docs/risk-model" element={<AppShell><RiskModelPage /></AppShell>} />
            <Route path="/alerts" element={<AppShell><AlertsPage /></AppShell>} />
            <Route path="/experiments" element={<AppShell><ExperimentsPage /></AppShell>} />
            <Route path="/oracle" element={<AppShell><OraclePage /></AppShell>} />
          </Routes>

          <DemoModeToggle isMock={useMock} onToggle={toggleMock} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
