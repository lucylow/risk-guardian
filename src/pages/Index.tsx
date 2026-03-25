import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import DemoSection from "@/components/DemoSection";
import IntegrationSection from "@/components/IntegrationSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import RoadmapSection from "@/components/RoadmapSection";
import TeamSection from "@/components/TeamSection";
import FooterSection from "@/components/FooterSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import MarketPulse from "@/components/MarketPulse";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <DemoSection />
      <MarketPulse />
      <IntegrationSection />
      <HowItWorksSection />
      <RoadmapSection />
      <TeamSection />
      <FooterSection />
    </div>
  );
}

