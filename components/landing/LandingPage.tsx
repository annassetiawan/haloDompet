"use client"

import { Navbar } from './Navbar'
import { HeroSection } from './HeroSection'
import { LiveDemoSection } from './LiveDemoSection'
import { ProcessSteps } from './ProcessSteps'
import { SocialProof } from './SocialProof'
import { FAQ } from './FAQ'
import { Footer } from './Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <HeroSection />
      <LiveDemoSection />
      <ProcessSteps />
      <SocialProof />
      <FAQ />
      <Footer />
    </div>
  )
}
