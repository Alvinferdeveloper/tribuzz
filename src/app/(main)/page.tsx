"use client"

import AnimatedBackground from "@/src/app/(main)/components/AnimatedBackground"
import HeroSection from "@/src/app/(main)/components/HeroSection"
import LiveTribes from "@/src/app/(main)/components/LiveTribes"
import FeaturesSection from "@/src/app/(main)/components/FeaturesSection"
import CtaSection from "@/src/app/(main)/components/CtaSection"

export default function Home() {
  return (
    // `isolate` keeps the fixed background (-z-50) inside this stacking context,
    // above the layout's own background but behind every section.
    <main className="relative isolate overflow-hidden">
      <AnimatedBackground />
      <HeroSection />
      <LiveTribes />
      <FeaturesSection />
      <CtaSection />
    </main>
  )
}
