'use client'

import dynamic from 'next/dynamic'
import { Navbar } from './Navbar'
import { HeroSection } from './HeroSection'
import { LiveDemoSection } from './LiveDemoSection'
import { ProcessSteps } from './ProcessSteps'

// Lazy load below-the-fold components for better initial load performance
const SocialProof = dynamic(() => import('./SocialProof').then(mod => ({ default: mod.SocialProof })), {
  loading: () => <div className="h-96 animate-pulse bg-zinc-900/50" />,
})

const FAQ = dynamic(() => import('./FAQ').then(mod => ({ default: mod.FAQ })), {
  loading: () => <div className="h-96 animate-pulse bg-zinc-900/50" />,
})

const Footer = dynamic(() => import('./Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-64 animate-pulse bg-zinc-900/50" />,
})

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
