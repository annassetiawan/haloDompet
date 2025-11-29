'use client'

import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { BentoFeatures } from './BentoFeatures'
import { InteractiveDemo } from './InteractiveDemo'
import { Footer } from './Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Noise Texture Overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <Navbar />
      <Hero />
      <BentoFeatures />
      <InteractiveDemo />
      <Footer />
    </div>
  )
}
