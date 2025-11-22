"use client"

import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="relative border-t border-zinc-800/50 bg-[#080808]">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white">HaloDompet</div>
              <div className="text-xs text-zinc-500">
                © 2025 All rights reserved.
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Terms
            </Link>
            <a
              href="mailto:support@halodompet.com"
              className="text-zinc-400 hover:text-white transition-colors"
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
              className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-zinc-700 hover:bg-zinc-800 transition-all duration-200"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4 text-zinc-400" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-zinc-700 hover:bg-zinc-800 transition-all duration-200"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4 text-zinc-400" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-zinc-700 hover:bg-zinc-800 transition-all duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4 text-zinc-400" />
            </a>
          </div>
        </div>

        {/* Powered By */}
        <div className="text-center mt-8 pt-8 border-t border-zinc-800/50">
          <p className="text-xs text-zinc-600">
            Powered by{' '}
            <a
              href="https://ai.google.dev/gemini-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-400 transition-colors"
            >
              Gemini AI
            </a>
            {' '}&{' '}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-400 transition-colors"
            >
              Supabase
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
