"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
          ? 'bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-zinc-800/40'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-white">
            HaloDompet
          </Link>

          <Link
            href="/login"
            className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium rounded-lg transition-all duration-300 ease-out"
          >
            Coba Sekarang
          </Link>
        </div>
      </div>
    </nav>
  )
}
