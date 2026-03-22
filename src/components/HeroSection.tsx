import { useEffect, useRef, useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

function AnimatedGauge() {
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState(0); // 0=loading, 1=danger, 2=moderate, 3=safe

  const phases = [
    { value: 0, color: "#6366f1", label: "Scanning..." },
    { value: 18, color: "hsl(4 86% 58%)", label: "High Risk" },
    { value: 54, color: "hsl(38 92% 50%)", label: "Moderate" },
    { value: 89, color: "hsl(158 64% 52%)", label: "Low Risk" },
  ];

  useEffect(() => {
    const timings = [600, 2000, 3800, 5600];
    const targets = [0, 18, 54, 89];

    timings.forEach((t, i) => {
      setTimeout(() => {
        setPhase(i);
        const start = i === 0 ? 0 : targets[i - 1];
        const end = targets[i];
        const duration = 1200;
        const startTime = performance.now();
        const step = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setScore(Math.round(start + (end - start) * eased));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, t);
    });

    const loop = setInterval(() => {
      timings.forEach((t, i) => {
        setTimeout(() => {
          setPhase(i);
          const start = i === 0 ? 0 : targets[i - 1];
          const end = targets[i];
          const duration = 1200;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setScore(Math.round(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }, t);
      });
    }, 9000);

    return () => clearInterval(loop);
  }, []);

  const circumference = 283;
  const offset = circumference - (score / 100) * circumference;
  const current = phases[phase];

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Ripple rings */}
      {phase === 3 && (
        <>
          <div className="absolute inset-0 rounded-full border border-risk-safe/30 animate-ripple" style={{ animationDelay: "0s" }} />
          <div className="absolute inset-0 rounded-full border border-risk-safe/20 animate-ripple" style={{ animationDelay: "0.5s" }} />
        </>
      )}

      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Track */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(225 30% 16%)" strokeWidth="8" />
        {/* Fill */}
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke={current.color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s ease, stroke 0.5s ease", filter: `drop-shadow(0 0 8px ${current.color})` }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-6xl text-foreground" style={{ color: current.color, textShadow: `0 0 20px ${current.color}` }}>
          {score}
        </span>
        <span className="font-mono text-xs text-foreground-muted mt-1">SAFETY SCORE</span>
        <span className="text-xs font-semibold mt-2 px-2 py-0.5 rounded-full" style={{ color: current.color, border: `1px solid ${current.color}33` }}>
          {current.label}
        </span>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden hex-bg"
      style={{
        background: `radial-gradient(ellipse at 60% 40%, hsl(239 60% 10% / 0.8) 0%, hsl(222 47% 5%) 60%)`,
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      {/* Radial overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div className="text-center lg:text-left">
            <div className="section-label mb-6 inline-flex">
              <span className="w-2 h-2 rounded-full bg-risk-safe animate-pulse" />
              AI-Powered Risk Engine · OneChain
            </div>

            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
              Swap with{" "}
              <span className="text-gradient block">Confidence.</span>
              <span className="text-foreground-muted text-4xl sm:text-5xl lg:text-6xl font-medium">Know Your Risk.</span>
            </h1>

            <p className="text-foreground-muted text-lg sm:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              The Risk Oracle delivers real-time sandwich attack detection, liquidity health analysis, and wallet reputation scores — before you hit swap.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#demo" className="btn-primary px-8 py-3.5 text-base rounded-xl inline-flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Try the Demo
              </a>
              <a href="#solution" className="btn-ghost px-8 py-3.5 text-base rounded-xl inline-flex items-center justify-center gap-2">
                Learn More
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
              {[
                { value: "$1.4B+", label: "MEV extracted yearly" },
                { value: "~1.2%", label: "Avg slippage stolen" },
                { value: "3 layers", label: "AI protection" },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <div className="font-display font-bold text-xl text-gradient">{s.value}</div>
                  <div className="text-xs text-foreground-subtle">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — gauge */}
          <div className="flex flex-col items-center gap-8">
            <div className="glass-card p-10 rounded-2xl animate-pulse-glow">
              <AnimatedGauge />
              <div className="mt-6 text-center">
                <p className="text-foreground-muted text-sm">Live risk assessment simulation</p>
                <p className="font-mono text-xs text-foreground-subtle mt-1">ONE → USDC · 5,000 ONE</p>
              </div>
            </div>

            {/* Mini data cards */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
              {[
                { label: "Sandwich", value: "Low", color: "text-risk-safe" },
                { label: "Liquidity", value: "92/100", color: "text-risk-safe" },
                { label: "Wallet", value: "Good", color: "text-risk-safe" },
              ].map((c) => (
                <div key={c.label} className="glass-card p-3 text-center">
                  <div className={`font-mono font-bold text-sm ${c.color}`}>{c.value}</div>
                  <div className="text-xs text-foreground-subtle mt-0.5">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground-subtle">
        <span className="text-xs font-mono">SCROLL</span>
        <div className="w-px h-8 bg-gradient-to-b from-foreground-subtle to-transparent" />
      </div>
    </section>
  );
}
