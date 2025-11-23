"use client"

import { LandingNavbar } from './LandingNavbar'
import { HeroSection } from './HeroSection'
import { DemoFeatureSection } from './DemoFeatureSection'
import { HowItWorksSection } from './HowItWorksSection'
import { TestimonialsSection } from './TestimonialsSection'
import { FAQSection } from './FAQSection'
import { LandingFooter } from './LandingFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sticky Navbar */}
      <LandingNavbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Demo & Feature Section */}
      <DemoFeatureSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}
