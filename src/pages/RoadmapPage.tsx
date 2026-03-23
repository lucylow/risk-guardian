import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import RoadmapSection from "@/components/RoadmapSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />
      {/* Page header */}
      <section className="pt-28 pb-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <div className="section-label mb-4 inline-flex">Roadmap</div>
          <h1 className="font-display font-bold text-5xl sm:text-6xl mb-4">
            What's <span className="text-gradient">Next</span>
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            From hackathon MVP to production-grade AI protection — here's our roadmap for building the future of DeFi safety.
          </p>
        </div>
      </section>
      <RoadmapSection />
      <FooterSection />
    </div>
  );
}
