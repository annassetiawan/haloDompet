'use client'

import React from 'react'
import { Code, Palette, Users } from 'lucide-react'

export const MeetMyTeam: React.FC = () => {
  return (
    <section id="team" className="py-32 px-6 bg-[#050505] relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-violet-300 mb-6">
            <Users size={12} />
            <span>The Dream Team</span>
          </div>
          
          <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight text-white">
            Meet My <span className="text-violet-400">Team</span>
          </h2>
        </div>

        {/* Team Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Annas Card */}
          <div className="group relative p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-violet-500/20 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-500">
                <Palette size={32} strokeWidth={1.5} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-1">Annas</h3>
              <p className="text-violet-400 text-sm font-medium mb-4 uppercase tracking-wider">Product Designer</p>
              
              <p className="text-white/60 leading-relaxed mb-6 flex-1">
                "Yang sering lupa catat pengeluaran yang akhirnya nekat bikin solusi sendiri pas dapet akses AI gratisan. Tugasnya ngasih ide-ide liar, ngatur desain biar enak dipandang, dan mastiin aplikasinya gampang dipake sambil rebahan"
              </p>
              
              <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                <span className="px-2 py-1 rounded bg-white/5">The Boss</span>
                <span className="px-2 py-1 rounded bg-white/5">Visionary</span>
              </div>
            </div>
          </div>

          {/* AI Team Card */}
          <div className="group relative p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-blue-500/20 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-500">
                <Code size={32} strokeWidth={1.5} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-1">Claude & Antigravity</h3>
              <p className="text-blue-400 text-sm font-medium mb-4 uppercase tracking-wider">Frontend & Backend (AI)</p>
              
              <p className="text-white/60 leading-relaxed mb-6 flex-1">
                "Kuli koding 24/7 tanpa butuh kopi. Ngerjain frontend, backend, database, sampe ngelap server. Dibayar pake token & doa. Nggak pernah ngeluh (kecuali kalau internet mati)."
              </p>
              
              <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                <span className="px-2 py-1 rounded bg-white/5">24/7 Uptime</span>
                <span className="px-2 py-1 rounded bg-white/5">No Coffee Needed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
