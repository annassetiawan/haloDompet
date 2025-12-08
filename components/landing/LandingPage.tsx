'use client'
import dynamic from 'next/dynamic'
import { Navbar } from './Navbar'
import { Hero } from './Hero'

// OPTIMIZED: Lazy load below-the-fold components
const BentoFeatures = dynamic(() => import('./BentoFeatures').then(mod => mod.BentoFeatures))
const InteractiveDemo = dynamic(() => import('./InteractiveDemo').then(mod => mod.InteractiveDemo))
const AboutUs = dynamic(() => import('./AboutUs').then(mod => mod.AboutUs))
const MeetMyTeam = dynamic(() => import('./MeetMyTeam').then(mod => mod.MeetMyTeam))
const ProcessedSteps = dynamic(() => import('./ProcessedSteps').then(mod => mod.ProcessedSteps))
const Footer = dynamic(() => import('./Footer').then(mod => mod.Footer))

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
      <Hero />
      <InteractiveDemo />
      <AboutUs />
      <ProcessedSteps />
      <BentoFeatures />
      <MeetMyTeam />
      <Footer />
    </div>
  )
}
