'use client'

import dynamic from 'next/dynamic'
import { Navbar } from './Navbar'
import { HeroSection } from './HeroSection'
import { FeatureCards } from './FeatureCards'
import { VoiceDemoSimple } from './VoiceDemoSimple'
import { LiveDemoSection } from './LiveDemoSection'
import { StatsSection } from './StatsSection'
import { MobileShowcase } from './MobileShowcase'
import { QuoteSection } from './QuoteSection'

// Lazy load below-the-fold components for better initial load performance
const ProcessSteps = dynamic(() => import('./ProcessSteps').then(mod => ({ default: mod.ProcessSteps })), {
  loading: () => <div className="h-96 animate-pulse bg-zinc-900/50" />,
})

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
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Noise Texture Overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <Navbar />
      <HeroSection />
      <FeatureCards />
      <VoiceDemoSimple />
      <MobileShowcase />
      <LiveDemoSection />
      <StatsSection />
      <QuoteSection />
      <ProcessSteps />
      <SocialProof />
      <FAQ />
      <Footer />
    </div>
  )
}
