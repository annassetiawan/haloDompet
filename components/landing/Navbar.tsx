"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wallet } from 'lucide-react'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all duration-300">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
              HaloDompet
            </span>
          </Link>

          {/* CTA Button */}
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Mulai Gratis
          </Link>
        </div>
      </div>
    </nav>
  )
}
