"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Ear, Brain, DollarSign, AlertCircle } from 'lucide-react'

export type AvatarState = 'idle' | 'listening' | 'processing' | 'success' | 'error'

interface FinancialAvatarProps {
  state: AvatarState
  onClick: () => void
  disabled?: boolean
  className?: string
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
}: FinancialAvatarProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const avatarRef = useRef<HTMLButtonElement>(null)

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
