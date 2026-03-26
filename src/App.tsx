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
import NotFound from "./pages/NotFound.tsx";
import DemoModeToggle from "./components/DemoModeToggle";
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
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/integration" element={<IntegrationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/developers" element={<DevelopersPage />} />
            <Route path="/docs/risk-model" element={<RiskModelPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/experiments" element={<ExperimentsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <DemoModeToggle isMock={useMock} onToggle={toggleMock} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
