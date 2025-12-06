'use client'

import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { BentoFeatures } from './BentoFeatures'
import { InteractiveDemo } from './InteractiveDemo'
import { AboutUs } from './AboutUs'
import { MeetMyTeam } from './MeetMyTeam'
import { ProcessedSteps } from './ProcessedSteps'
import { Footer } from './Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
      <Hero />
      <AboutUs />
      <ProcessedSteps />
      <BentoFeatures />
      <InteractiveDemo />
      <MeetMyTeam />
      <Footer />
    </div>
  )
}
