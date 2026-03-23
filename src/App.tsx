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
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

