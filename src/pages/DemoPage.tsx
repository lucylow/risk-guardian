import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import DemoSection from "@/components/DemoSection";
import ScrollProgressBar from "@/components/ScrollProgressBar";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />
      <div className="pt-8">
        <DemoSection />
      </div>
      <FooterSection />
    </div>
  );
}
