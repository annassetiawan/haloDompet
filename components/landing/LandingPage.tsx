'use client'

import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { BentoFeatures } from './BentoFeatures'
import { InteractiveDemo } from './InteractiveDemo'
import { ProcessedSteps } from './ProcessedSteps'
import { Footer } from './Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
      <Hero />
      <ProcessedSteps />
      <BentoFeatures />
      <InteractiveDemo />
      <Footer />
    </div>
  )
}
