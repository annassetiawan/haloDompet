'use client'

import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
// OPTIMIZED: Only import idle animation upfront for faster LCP
import avatarIdleAnimation from '@/public/animations/avatar-idle.json'

// Lazy imports untuk animasi lain - akan di-load saat dibutuhkan
let avatarListeningAnimation: any
let avatarProcessingAnimation: any
let avatarSuccessAnimation: any
let avatarErrorAnimation: any
let avatarShockedAnimation: any
let avatarScanningAnimation: any
let avatarConcernedAnimation: any
let avatarAnalyzingAnimation: any // New analyzing state

// Dynamic import saat runtime
if (typeof window !== 'undefined') {
  import('@/public/animations/avatar-listening.json')
    .then((m) => (avatarListeningAnimation = m.default))
    .catch(() => {})
  import('@/public/animations/avatar-processing.json')
    .then((m) => (avatarProcessingAnimation = m.default))
    .catch(() => {})
  import('@/public/animations/avatar-success.json')
    .then((m) => (avatarSuccessAnimation = m.default))
    .catch(() => {})
  import('@/public/animations/avatar-error.json')
    .then((m) => (avatarErrorAnimation = m.default))
    .catch(() => {})
  import('@/public/animations/avatar-shocked.json')
    .then((m) => (avatarShockedAnimation = m.default))
    .catch(() => {})
  import('@/public/animations/avatar-scanning.json')
    .then((m) => (avatarScanningAnimation = m.default))
    .catch(() => {})
  import('@/public/animations/avatar-concerned.json')
    .then((m) => (avatarConcernedAnimation = m.default))
    .catch(() => {})
  // Placeholder: analyzing uses scanning animation
  import('@/public/animations/avatar-scanning.json')
    .then((m) => (avatarAnalyzingAnimation = m.default))
    .catch(() => {})
}

export type LottieAvatarState =
  // Basic states
  | 'idle'
  | 'listening'
  | 'processing'
  | 'success'
  | 'error'
  // Image scanning state
  | 'scanning' // Sedang scan/analyze gambar struk
  | 'analyzing' // Deep analysis steps
  // Sentiment-based states for EXPENSE
  | 'proud' // Pengeluaran hemat/cerdas (warteg, transport umum)
  | 'concerned' // Pengeluaran boros tier sedang (30k-100k lifestyle)
  | 'shocked' // Pengeluaran sangat boros (>200k lifestyle)
  | 'disappointed' // Pengeluaran berulang yang buruk
  // Sentiment-based states for INCOME
  | 'excited' // Gaji/income besar
  | 'celebrating' // Bonus/windfall/THR
  | 'motivated' // Side hustle/freelance income

interface LottieAvatarProps {
  state?: LottieAvatarState
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function LottieAvatar({
  state = 'idle',
  onClick,
  className = '',
  disabled = false,
}: LottieAvatarProps) {
  // OPTIMIZED: State for lazy-loaded animations
  const [animationData, setAnimationData] = useState<any>(avatarIdleAnimation)
  const [isLoading, setIsLoading] = useState(false)

  // OPTIMIZED: Lazy load animations only when needed
  useEffect(() => {
    const loadAnimation = async () => {
      setIsLoading(true)
      try {
        switch (state) {
          case 'idle':
            setAnimationData(avatarIdleAnimation)
            break
          case 'listening':
            const listening = await import(
              '@/public/animations/avatar-listening.json'
            )
            setAnimationData(listening.default)
            break
          case 'processing':
            const processing = await import(
              '@/public/animations/avatar-processing.json'
            )
            setAnimationData(processing.default)
            break
          case 'success':
            const success = await import(
              '@/public/animations/avatar-success.json'
            )
            setAnimationData(success.default)
            break
          case 'scanning':
            const scanning = await import(
              '@/public/animations/avatar-scanning.json'
            )
            setAnimationData(scanning.default)
            break
          case 'analyzing':
            // Placeholder: use scanning animation for analyzing
            const analyzing = await import(
              '@/public/animations/avatar-scanning.json'
            )
            setAnimationData(analyzing.default)
            break
          case 'proud':
            const proud = await import(
              '@/public/animations/avatar-success.json'
            )
            setAnimationData(proud.default)
            break
          case 'excited':
            const excited = await import(
              '@/public/animations/avatar-success.json'
            )
            setAnimationData(excited.default)
            break
          case 'celebrating':
            const celebrating = await import(
              '@/public/animations/avatar-success.json'
            )
            setAnimationData(celebrating.default)
            break
          case 'motivated':
            const motivated = await import(
              '@/public/animations/avatar-success.json'
            )
            setAnimationData(motivated.default)
            break
          case 'error':
            const error = await import('@/public/animations/avatar-error.json')
            setAnimationData(error.default)
            break
          case 'shocked':
            const shocked = await import(
              '@/public/animations/avatar-shocked.json'
            )
            setAnimationData(shocked.default)
            break
          case 'disappointed':
            const disappointed = await import(
              '@/public/animations/avatar-concerned.json'
            )
            setAnimationData(disappointed.default)
            break
          case 'concerned':
            const concerned = await import(
              '@/public/animations/avatar-concerned.json'
            )
            setAnimationData(concerned.default)
            break
          default:
            setAnimationData(avatarIdleAnimation)
        }
      } catch (err) {
        console.error('Error loading animation:', err)
        setAnimationData(avatarIdleAnimation)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnimation()
  }, [state])

  const handleClick = () => {
    if (!disabled) {
      console.log('Avatar clicked, state:', state)
      onClick?.()
    }
  }

  const getAnimationData = () => {
    switch (state) {
      // Basic states
      case 'idle':
        return avatarIdleAnimation
      case 'listening':
        return avatarListeningAnimation || avatarIdleAnimation
      case 'processing':
        return avatarProcessingAnimation || avatarIdleAnimation
      case 'success':
        return avatarSuccessAnimation || avatarIdleAnimation
      case 'error':
        return avatarErrorAnimation || avatarIdleAnimation

      // Image scanning state
      case 'scanning':
        // TODO: Ganti dengan avatar-scanning.json saat sudah ada
        return avatarScanningAnimation || avatarProcessingAnimation || avatarIdleAnimation
      
      case 'analyzing':
        // TODO: Ganti dengan avatar-analyzing.json saat sudah ada
        return avatarAnalyzingAnimation || avatarScanningAnimation || avatarProcessingAnimation || avatarIdleAnimation

      // Sentiment-based states for EXPENSE
      case 'proud':
        // TODO: Ganti dengan avatar-proud.json saat sudah ada
        return avatarSuccessAnimation || avatarIdleAnimation // Placeholder: gunakan success (positif)
      case 'concerned':
        // TODO: Ganti dengan avatar-concerned.json saat sudah ada
        return avatarProcessingAnimation || avatarIdleAnimation // Placeholder: gunakan processing (ragu-ragu)
      case 'shocked':
        // TODO: Ganti dengan avatar-shocked.json saat sudah ada
        return avatarShockedAnimation || avatarIdleAnimation // Placeholder: gunakan error (negatif kuat)
      case 'disappointed':
        // TODO: Ganti dengan avatar-disappointed.json saat sudah ada
        return avatarErrorAnimation || avatarIdleAnimation // Placeholder: gunakan error (negatif)

      // Sentiment-based states for INCOME
      case 'excited':
        // TODO: Ganti dengan avatar-excited.json saat sudah ada
        return avatarSuccessAnimation || avatarIdleAnimation // Placeholder: gunakan success (positif kuat)
      case 'celebrating':
        // TODO: Ganti dengan avatar-celebrating.json saat sudah ada
        return avatarSuccessAnimation || avatarIdleAnimation // Placeholder: gunakan success (positif kuat)
      case 'motivated':
        // TODO: Ganti dengan avatar-motivated.json saat sudah ada
        return avatarSuccessAnimation || avatarIdleAnimation // Placeholder: gunakan success (positif)

      default:
        return avatarIdleAnimation
    }
  }

  // // State-based styling
  // const getStateClasses = () => {
  //   switch (state) {
  //     case 'listening':
  //       return 'animate-pulse ring-4 ring-blue-500/50'
  //     case 'processing':
  //       return 'animate-bounce'
  //     case 'success':
  //       return 'scale-110 ring-4 ring-green-500/50'
  //     case 'error':
  //       return 'animate-shake ring-4 ring-red-500/50'
  //     default:
  //       return ''
  //   }
  // }

  return (
    <div
      onClick={handleClick}
      className={`
        cursor-pointer transition-all duration-300
        w-40 h-40 flex items-center justify-center
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}

        ${className}
      `}
    >
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        className="w-full h-full"
        style={{ width: '160px', height: '160px' }}
      />
      {/* Label State untuk debugging/development
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-center text-gray-500 mt-2 absolute -bottom-6">
          State: {state}
        </div>
      )} */}
    </div>
  )
}
