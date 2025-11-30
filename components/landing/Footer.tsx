'use client'

import React from 'react'
import { Twitter, Instagram, Github } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black pt-20 pb-10 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-20 gap-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl mb-6">HaloDompet</h2>
            <p className="text-white/50 max-w-sm">
              Dibuat karena founder-nya capek nyatet pengeluaran di Excel dan sering lupa password e-banking.
            </p>
          </div>

          <div className="flex gap-12">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white/90">Product</h4>
              <a href="#" className="text-white/50 hover:text-violet-400 transition-colors">Download</a>
              <a href="#" className="text-white/50 hover:text-violet-400 transition-colors">Changelog</a>
              <a href="#" className="text-white/50 hover:text-violet-400 transition-colors">Roadmap</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white/90">Legal</h4>
              <a href="#" className="text-white/50 hover:text-violet-400 transition-colors">Privacy</a>
              <a href="#" className="text-white/50 hover:text-violet-400 transition-colors">Terms</a>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/30 text-sm">
            © 2025 HaloDompet Financial Technologies.
          </p>

          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Github size={20} /></a>
          </div>
        </div>

        {/* Big Text Background */}
        <div className="mt-20 select-none pointer-events-none opacity-5">
           <h1 className="text-[12vw] leading-none font-bold text-center tracking-tighter">HALODOMPET</h1>
        </div>
      </div>
    </footer>
  )
}
