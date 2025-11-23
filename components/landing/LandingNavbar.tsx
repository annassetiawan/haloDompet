"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b-2 border-zinc-800">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-emerald-400 bg-emerald-400/10 flex items-center justify-center">
              <span className="text-emerald-400 font-black text-lg">H</span>
            </div>
            <span className="text-xl font-black text-white tracking-tighter">
              HaloDompet
            </span>
          </Link>

          {/* Center Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-zinc-500 hover:text-white transition-colors duration-200 font-bold"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-zinc-500 hover:text-white transition-colors duration-200 font-bold"
            >
              How it Works
            </a>
          </div>

          {/* CTA Button */}
          <Link href="/login">
            <Button
              className="bg-emerald-400 text-black hover:bg-emerald-300 font-black transition-all duration-200 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              Get Early Access
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
