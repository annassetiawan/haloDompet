"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Ear, Brain, DollarSign, AlertCircle } from 'lucide-react'

export type AvatarState = 'idle' | 'listening' | 'processing' | 'success' | 'error'

interface FinancialAvatarProps {
  state: AvatarState
  onClick: () => void
  disabled?: boolean
  className?: string
  roastMessage?: string | null
  onRoastDismiss?: () => void
}

// Emoji expressions per state
const AVATAR_EXPRESSIONS = {
  idle: '😎',       // Cool/Siap
  listening: '👂',  // Mendengar
  processing: '🤔', // Mikir
  success: '🤑',    // Success (default)
  error: '😵',      // Pusing
}

export function FinancialAvatar({
  state,
  onClick,
  disabled = false,
  className = '',
  roastMessage = null,
  onRoastDismiss,
}: FinancialAvatarProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const [showRoast, setShowRoast] = useState(false)

  // Track client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Show roast bubble when roastMessage changes
  useEffect(() => {
    if (roastMessage) {
      setShowRoast(true)

      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setShowRoast(false)
        onRoastDismiss?.()
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [roastMessage, onRoastDismiss])

  // Trigger confetti on success
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (state === 'success' && !prefersReducedMotion && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect()
      const x = (rect.left + rect.width / 2) / window.innerWidth
      const y = (rect.top + rect.height / 2) / window.innerHeight

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { x, y },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b'],
      })
    }
  }, [state, prefersReducedMotion])

  // Haptic feedback on tap (mobile)
  const handleClick = () => {
    if (!disabled) {
      if (isMounted && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50)
      }
      onClick()
    }
  }

  // Animation variants for avatar container - typed as any to avoid framer-motion type issues
  const avatarVariants: any = {
    idle: {
      scale: 1,
      rotate: 0,
    },
    listening: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    processing: {
      scale: 1,
      rotate: [0, -5, 5, -5, 5, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    success: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.5 }
    },
    error: {
      scale: 1,
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    },
  }

  // Pulse ring animation for listening state - typed as any to avoid framer-motion type issues
  const pulseVariants: any = {
    listening: {
      scale: [1, 1.4],
      opacity: [0.6, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  }

  const getStateColor = () => {
    switch (state) {
      case 'idle': return 'from-gradient-primary-start to-gradient-primary-end'
      case 'listening': return 'from-blue-400 to-blue-600'
      case 'processing': return 'from-purple-400 to-purple-600'
      case 'success': return 'from-green-400 to-green-600'
      case 'error': return 'from-red-400 to-red-600'
    }
  }

  const getLabel = () => {
    switch (state) {
      case 'idle': return 'Tap untuk bicara'
      case 'listening': return 'Sedang mendengar...'
      case 'processing': return 'Lagi mikir nih...'
      case 'success': return 'Sip!'
      case 'error': return 'Waduh, coba lagi'
    }
  }

  const getCurrentEmoji = () => {
    // Use success emoji by default, can be customized based on transaction type later
    return state === 'success' ? AVATAR_EXPRESSIONS.success : AVATAR_EXPRESSIONS[state]
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Roast Bubble - Style konsisten dengan bubble chat sebelumnya */}
      <AnimatePresence>
        {showRoast && roastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="relative mb-2 w-full max-w-[320px]"
          >
            {/* Bubble Container */}
            <div className="relative px-4 py-3 rounded-2xl shadow-sm border transition-all duration-300 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-800 border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-100">
              {/* Label Bubble */}
              <span className="absolute -top-2.5 left-4 bg-white dark:bg-gray-800 text-[9px] font-bold px-1.5 py-px rounded-full shadow-sm border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Dompie
              </span>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowRoast(false)
                  onRoastDismiss?.()
                }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-xs font-bold hover:scale-110 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-md"
                aria-label="Tutup pesan"
              >
                ×
              </button>

              {/* Roast Message */}
              <p className="text-center font-medium leading-snug text-sm pt-1">
                {roastMessage}
              </p>

              {/* Bubble Tail - Pointing Down */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-800 border-indigo-100 dark:border-indigo-900/50"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Container */}
      <div className="relative">
        {/* Pulse Rings - Only show when listening */}
        {state === 'listening' && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-500/30"
              variants={pulseVariants}
              animate="listening"
              style={{ width: '100%', height: '100%' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-500/30"
              variants={pulseVariants}
              animate="listening"
              style={{
                width: '100%',
                height: '100%',
                animationDelay: '0.5s'
              }}
            />
          </>
        )}

        {/* Main Avatar Button */}
        <motion.button
          ref={avatarRef}
          type="button"
          onClick={handleClick}
          disabled={disabled || state === 'processing'}
          className={`
            relative rounded-full flex items-center justify-center
            transition-all duration-300 ease-out
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-4 focus:ring-primary/20
            bg-gradient-to-br ${getStateColor()}
            shadow-2xl
            w-40 h-40
            border-4 border-white dark:border-gray-800
          `}
          variants={prefersReducedMotion ? {} : avatarVariants}
          animate={state}
          whileHover={disabled ? {} : { scale: 1.05 }}
          whileTap={disabled ? {} : { scale: 0.95 }}
          aria-label={getLabel()}
          aria-live="polite"
        >
          {/* Emoji Expression */}
          <motion.div
            className="text-7xl select-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            key={state}
          >
            {getCurrentEmoji()}
          </motion.div>

          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 dark:bg-white/10" />
        </motion.button>
      </div>

      {/* Status Label */}
      <motion.p
        className="text-sm font-semibold text-center text-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        key={state}
      >
        {getLabel()}
      </motion.p>

      {/* Screen reader only live region */}
      <div className="sr-only" role="status" aria-live="assertive">
        {state === 'listening' && 'Sedang mendengarkan suara Anda'}
        {state === 'processing' && 'Sedang memproses transaksi'}
        {state === 'success' && 'Transaksi berhasil diproses'}
        {state === 'error' && 'Terjadi kesalahan, silakan coba lagi'}
      </div>
    </div>
  )
}
