'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLinkProps } from '@/types'

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => (
  <a
    href={href}
    className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-300"
  >
    {children}
  </a>
)

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={`
          flex items-center justify-between px-6 py-3 rounded-full
          transition-all duration-300
          ${scrolled ? 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20' : 'bg-transparent'}
        `}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <span className="font-serif font-bold text-white text-lg">H</span>
            </div>
            <span className="font-serif font-semibold text-lg tracking-tight text-white">
              HaloDompet
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Mengapa Kami</NavLink>
            <NavLink href="#demo">Coba Demo</NavLink>
            <NavLink href="#about">Cerita Kita</NavLink>
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <a
              href="https://halodompet.vercel.app/login"
              className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-violet-600 hover:text-white transition-colors duration-300"
            >
              Mulai Gratis
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 p-4 md:hidden">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
            <a
              href="#features"
              className="text-lg text-white/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fitur
            </a>
            <a
              href="#demo"
              className="text-lg text-white/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demo
            </a>
            <a
              href="#download"
              className="bg-violet-600 text-white text-center py-3 rounded-xl font-bold"
            >
              Download App
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
