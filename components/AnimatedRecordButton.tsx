"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Mic, Loader2, Check, X } from 'lucide-react'

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
  small: { container: 80, icon: 32, outerRing: 100 },
  medium: { container: 120, icon: 48, outerRing: 150 },
  large: { container: 160, icon: 64, outerRing: 200 },
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
    <>
      {/* Custom Keyframe Animations */}
      <style jsx>{`
        @keyframes animeFill {
          0%, 100% {
            fill: rgb(77, 124, 255);
            filter: drop-shadow(0 0 8px rgba(77, 124, 255, 0.6));
          }
          50% {
            fill: rgb(110, 150, 255);
            filter: drop-shadow(0 0 16px rgba(77, 124, 255, 0.9));
          }
        }

        @keyframes animeBorder {
          0%, 100% {
            border-color: rgba(77, 124, 255, 0.281);
            box-shadow:
              inset -2px -2px 0 #5e5e5e,
              inset 2px 2px 0 #1c1c1c,
              0 0 20px rgba(77, 124, 255, 0.3);
          }
          50% {
            border-color: rgba(77, 124, 255, 0.5);
            box-shadow:
              inset -2px -2px 0 #5e5e5e,
              inset 2px 2px 0 #1c1c1c,
              0 0 30px rgba(77, 124, 255, 0.5);
          }
        }

        .recording-active {
          animation: animeBorder 0.8s linear alternate-reverse infinite;
        }

        .recording-icon {
          animation: animeFill 0.8s linear alternate-reverse infinite;
        }
      `}</style>

      <div className={`flex flex-col items-center gap-4 ${className}`}>
        {/* Outer Ring Container */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: sizes.outerRing, height: sizes.outerRing }}
        >
          {/* Outer Ring (Efek Timbul) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(145deg, #262626, #606060)',
              boxShadow: '11px 11px 22px #141414, -11px -11px 22px #525252',
            }}
          />

          {/* Main Button Container */}
          <motion.button
            ref={buttonRef}
            type="button"
            onClick={handleClick}
            disabled={disabled || state === 'processing'}
            className={`
              relative rounded-full flex items-center justify-center
              transition-all duration-300 ease-out
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none
              ${state === 'recording' ? 'recording-active' : ''}
            `}
            style={{
              width: sizes.container,
              height: sizes.container,
              background: 'linear-gradient(145deg, #171717, #444245)',
              boxShadow: state === 'recording'
                ? 'inset -2px -2px 0 #5e5e5e, inset 2px 2px 0 #1c1c1c'
                : 'inset 2px 2px 0 #7d7c7e, inset -2px -2px 0px #1c1c1c',
              border: state === 'recording'
                ? '4px solid rgba(77, 124, 255, 0.281)'
                : '4px solid #090909',
            }}
            variants={prefersReducedMotion ? {} : containerVariants}
            animate={state}
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            aria-label={getLabel()}
            aria-live="polite"
          >
            {/* Icon with conditional animation */}
            <motion.div
              className="relative z-20"
              style={{ width: sizes.icon, height: sizes.icon }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={state}
            >
              {state === 'idle' && (
                <Mic
                  className="w-full h-full"
                  style={{ color: '#9ca3af' }}
                />
              )}
              {state === 'recording' && (
                <Mic
                  className="w-full h-full recording-icon"
                  style={{ color: 'rgb(77, 124, 255)' }}
                />
              )}
              {state === 'processing' && (
                <Loader2
                  className="w-full h-full animate-spin"
                  style={{ color: 'rgb(59, 130, 246)' }}
                />
              )}
              {state === 'success' && (
                <Check
                  className="w-full h-full"
                  style={{ color: 'rgb(34, 197, 94)' }}
                />
              )}
              {state === 'error' && (
                <X
                  className="w-full h-full"
                  style={{ color: 'rgb(239, 68, 68)' }}
                />
              )}
            </motion.div>
          </motion.button>
        </div>

        {/* Status Label */}
        <motion.p
          className="text-sm font-medium text-center text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={state}
        >
          {getLabel()}
        </motion.p>

        {/* Screen reader only live region */}
        <div className="sr-only" role="status" aria-live="assertive">
          {state === 'recording' && 'Sedang merekam'}
          {state === 'processing' && 'Sedang memproses audio'}
          {state === 'success' && 'Rekaman berhasil diproses'}
          {state === 'error' && 'Terjadi kesalahan, silakan coba lagi'}
        </div>
      </div>
    </>
  )
}
