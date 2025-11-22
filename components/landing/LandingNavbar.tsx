"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/70 border-b border-zinc-800/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              HaloDompet
            </span>
          </Link>

          {/* Center Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              How it Works
            </a>
          </div>

          {/* CTA Button */}
          <Link href="/login">
            <Button
              className="bg-white text-black hover:bg-zinc-200 font-medium transition-all duration-200 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              Get Early Access
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
