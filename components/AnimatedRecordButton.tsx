"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Mic, Loader2, Check, X, Square } from 'lucide-react'
import { VoiceLevelBars } from './VoiceLevelBars'

export type RecordingState = 'idle' | 'recording' | 'processing' | 'success' | 'error'

interface AnimatedRecordButtonProps {
  state: RecordingState
  onClick: () => void
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  className?: string
  audioLevel?: number // 0-1 normalized audio level
}

const sizeMap = {
  small: { container: 80, icon: 32 },
  medium: { container: 120, icon: 48 },
  large: { container: 160, icon: 64 },
}

export function AnimatedRecordButton({
  state,
  onClick,
  size = 'large',
  disabled = false,
  className = '',
  audioLevel = 0,
}: AnimatedRecordButtonProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const sizes = sizeMap[size]

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Trigger confetti on success
  useEffect(() => {
    if (state === 'success' && !prefersReducedMotion && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const x = (rect.left + rect.width / 2) / window.innerWidth
      const y = (rect.top + rect.height / 2) / window.innerHeight

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      })
    }
  }, [state, prefersReducedMotion])

  // Haptic feedback on tap (mobile)
  const handleClick = () => {
    if (!disabled) {
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      onClick()
    }
  }

  // Animation variants
  const containerVariants = {
    idle: { scale: 1 },
    recording: { scale: 1 },
    processing: { scale: 0.95 },
    success: { scale: 1.1 },
    error: {
      scale: 1,
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    },
  }

  const getStateColor = () => {
    switch (state) {
      case 'idle': return 'bg-primary/10 hover:bg-primary/20'
      case 'recording': return 'bg-transparent'
      case 'processing': return 'bg-blue-500/10'
      case 'success': return 'bg-green-500/10'
      case 'error': return 'bg-red-500/10'
    }
  }

  const getIcon = () => {
    switch (state) {
      case 'idle': return <Mic className="w-full h-full text-primary" />
      case 'recording': return <Mic className="w-full h-full text-red-500 animate-pulse" />
      case 'processing': return <Loader2 className="w-full h-full text-blue-500 animate-spin" />
      case 'success': return <Check className="w-full h-full text-green-500" />
      case 'error': return <X className="w-full h-full text-red-500" />
    }
  }

  const getLabel = () => {
    switch (state) {
      case 'idle': return 'Tekan untuk merekam'
      case 'recording': return 'Tekan untuk berhenti'
      case 'processing': return 'Memproses...'
      case 'success': return 'Berhasil!'
      case 'error': return 'Coba lagi'
    }
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        disabled={disabled || state === 'processing'}
        className={`
          relative rounded-full flex items-center justify-center
          transition-all duration-300 ease-out
          ${getStateColor()}
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-4 focus:ring-primary/30
          active:scale-95
        `}
        style={{ width: sizes.container, height: sizes.container }}
        variants={prefersReducedMotion ? {} : containerVariants}
        animate={state}
        whileHover={disabled ? {} : { scale: 1.05 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        aria-label={getLabel()}
        aria-live="polite"
      >
        {/* Foreground Icon */}
        <motion.div
          className="relative z-20"
          style={{ width: sizes.icon, height: sizes.icon }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={state}
        >
          {getIcon()}
        </motion.div>

        {/* Recording pulse ring */}
        {state === 'recording' && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-red-500"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.button>

      {/* Status Label */}
      <motion.p
        className="text-sm font-medium text-center text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={state}
      >
        {getLabel()}
      </motion.p>

      {/* Voice Level Indicator */}
      <AnimatePresence mode="wait">
        {state === 'recording' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <VoiceLevelBars level={audioLevel} barCount={5} color="#ef4444" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen reader only live region */}
      <div className="sr-only" role="status" aria-live="assertive">
        {state === 'recording' && 'Sedang merekam'}
        {state === 'processing' && 'Sedang memproses audio'}
        {state === 'success' && 'Rekaman berhasil diproses'}
        {state === 'error' && 'Terjadi kesalahan, silakan coba lagi'}
      </div>
    </div>
  )
}
