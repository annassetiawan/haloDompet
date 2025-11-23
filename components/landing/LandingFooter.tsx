"use client"

import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="relative border-t-2 border-zinc-800 bg-black">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-400 bg-emerald-400/10 flex items-center justify-center">
              <span className="text-emerald-400 font-black text-lg">H</span>
            </div>
            <div>
              <div className="text-sm font-black text-white">HaloDompet</div>
              <div className="text-xs text-zinc-600 font-bold">
                © 2025 All rights reserved.
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-zinc-600 hover:text-white transition-colors font-bold"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-zinc-600 hover:text-white transition-colors font-bold"
            >
              Terms
            </Link>
            <a
              href="mailto:support@halodompet.com"
              className="text-zinc-600 hover:text-white transition-colors font-bold"
            >
              Contact
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border-2 border-zinc-800 bg-zinc-950 flex items-center justify-center hover:border-emerald-400 transition-all duration-200"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4 text-zinc-600" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border-2 border-zinc-800 bg-zinc-950 flex items-center justify-center hover:border-blue-400 transition-all duration-200"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4 text-zinc-600" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border-2 border-zinc-800 bg-zinc-950 flex items-center justify-center hover:border-orange-400 transition-all duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4 text-zinc-600" />
            </a>
          </div>
        </div>

        {/* Powered By */}
        <div className="text-center mt-8 pt-8 border-t-2 border-zinc-800">
          <p className="text-xs text-zinc-600 font-bold">
            Powered by{' '}
            <a
              href="https://ai.google.dev/gemini-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Gemini AI
            </a>
            {' '}&{' '}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Supabase
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
