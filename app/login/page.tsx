'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client' // Pastikan file ini ada di project Next.js Anda
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

// --- COMPONENT: LOGIN PAGE ---
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)

      // Pastikan kita berada di client sebelum mengakses window
      if (typeof window === 'undefined') return

      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('🔐 Starting Google OAuth login...')
      console.log('📍 Current origin:', window.location.origin)
      console.log('🔄 Redirect URL:', redirectUrl)

      // --- LOGIKA SUPABASE (Dari Kode 1) ---
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) {
        console.error('❌ Error logging in:', error.message)
        alert('Gagal login. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fungsi navigasi sederhana (sesuaikan dengan router Next.js Anda jika perlu)
  const handleBack = () => {
    // router.push('/') atau window.history.back()
    console.log('Kembali diklik')
  }

  return (
    <div className="min-h-screen w-full flex bg-[#050505] text-white overflow-hidden font-sans">
      {/* --- LEFT PANEL: VISUAL EXPERIENCE (Tampilan Mewah dari Kode 2) --- */}
      <div className="hidden lg:flex w-1/2 relative bg-[#080808] border-r border-white/5 flex-col justify-between p-12 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-violet-600/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite]" />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="font-serif font-bold text-white text-xl">H</span>
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight">
              HaloDompet
            </span>
          </div>
        </div>

        {/* Center Visual: Abstract Floating Cards */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center perspective-1000">
          <div className="relative w-80 h-96">
            {/* Card 1: Expense Alert (Back) */}
            <div className="absolute top-0 right-[-40px] w-64 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transform rotate-12 translate-z-[-20px] opacity-60">
              <div className="h-2 w-12 bg-white/20 rounded-full mb-4" />
              <div className="h-2 w-full bg-white/10 rounded-full mb-2" />
              <div className="h-2 w-2/3 bg-white/10 rounded-full" />
            </div>

            {/* Card 2: Main Dashboard (Front) */}
            <div className="absolute inset-0 bg-[#0F0F0F] rounded-3xl border border-white/10 shadow-2xl p-6 transform -rotate-6 transition-transform hover:-rotate-3 duration-700">
              {/* Mock Chart */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    Total Balance
                  </p>
                  <p className="text-2xl font-serif mt-1">Rp 12.450.000</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Sparkles size={18} className="text-violet-400" />
                </div>
              </div>

              {/* Bar Chart Simulation */}
              <div className="flex items-end justify-between h-32 gap-2 mb-6">
                {[40, 70, 45, 90, 60, 80].map((h, i) => (
                  <div
                    key={i}
                    className="w-full bg-white/5 rounded-t-sm relative group overflow-hidden"
                  >
                    <div
                      style={{ height: `${h}%` }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-violet-600 to-violet-400 opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>

              {/* Notification Pill */}
              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="text-xs font-medium">Income Verified</p>
                  <p className="text-[10px] text-white/40">
                    Just now via Voice AI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10">
          <blockquote className="text-xl font-serif leading-relaxed mb-4 text-white/90">
            "Akhirnya ada aplikasi yang gak bikin males nyatet. Cuma ngomong,
            beres. Serasa punya asisten pribadi."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/20 to-white/5" />
            <div>
              <p className="text-sm font-semibold">Alex W.</p>
              <p className="text-xs text-white/40">Early Adopter</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: LOGIN FORM (Dengan Logic Supabase) --- */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-20 bg-black">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <span className="font-serif font-bold text-white text-sm">H</span>
          </div>
          <span className="font-serif font-bold tracking-tight">
            HaloDompet
          </span>
        </div>

        {/* Back Button */}
        <div className="absolute top-6 right-6 lg:top-12 lg:right-12">
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5"
          >
            <span>Kembali ke Beranda</span>
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform order-first"
            />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-24">
          <div className="w-full max-w-sm">
            <div className="mb-10">
              <h1 className="font-serif text-4xl md:text-5xl mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 py-2 leading-tight">
                Selamat Datang
              </h1>
              <p className="text-white/50 text-lg">
                Mulai atur keuanganmu dengan cara yang lebih manusiawi.
              </p>
            </div>

            <div className="space-y-6">
              {/* BUTTON: Menggunakan handleGoogleLogin (Supabase) */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-14 bg-white text-black hover:bg-gray-100 active:scale-[0.99] rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Menghubungkan...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        className="text-[#4285F4]"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        className="text-[#34A853]"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        className="text-[#FBBC05]"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        className="text-[#EA4335]"
                      />
                    </svg>
                    <span>Lanjutkan dengan Google</span>
                  </>
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black px-4 text-xs text-white/30 uppercase tracking-widest">
                    Keamanan Terjamin
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col items-center text-center gap-2 hover:bg-white/[0.04] transition-colors">
                  <ShieldCheck className="text-white/40 mb-1" size={20} />
                  <p className="text-xs text-white/40 leading-tight">
                    Enkripsi tingkat bank.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col items-center text-center gap-2 hover:bg-white/[0.04] transition-colors">
                  <CheckCircle2 className="text-white/40 mb-1" size={20} />
                  <p className="text-xs text-white/40 leading-tight">
                    Privasi data terjaga.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-12 text-center text-xs text-white/30">
              Dengan melanjutkan, Anda menyetujui{' '}
              <a href="#" className="underline hover:text-white/60">
                Syarat & Ketentuan
              </a>{' '}
              serta{' '}
              <a href="#" className="underline hover:text-white/60">
                Kebijakan Privasi
              </a>{' '}
              kami.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
