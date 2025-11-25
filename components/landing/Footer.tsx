'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-zinc-800/40">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="text-xl font-semibold text-white mb-2">
              HaloDompet
            </div>
            <p className="text-sm text-zinc-500">
              Dibuat dengan ☕ di Semarang
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm">
            <Link
              href="/login"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Masuk
            </Link>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-zinc-800/40 text-center">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} HaloDompet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
