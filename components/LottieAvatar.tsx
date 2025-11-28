'use client'

import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
// OPTIMIZED: Only import idle animation upfront for faster LCP
import avatarIdleAnimation from '@/public/animations/avatar-idle.json'

export type LottieAvatarState =
  // Basic states
  | 'idle'
  | 'listening'
  | 'processing'
  | 'success'
  | 'error'
  // Sentiment-based states for EXPENSE
  | 'proud'        // Pengeluaran hemat/cerdas (warteg, transport umum)
  | 'concerned'    // Pengeluaran boros tier sedang (30k-100k lifestyle)
  | 'shocked'      // Pengeluaran sangat boros (>200k lifestyle)
  | 'disappointed' // Pengeluaran berulang yang buruk
  // Sentiment-based states for INCOME
  | 'excited'      // Gaji/income besar
  | 'celebrating'  // Bonus/windfall/THR
  | 'motivated'    // Side hustle/freelance income

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
            const listening = await import('@/public/animations/avatar-listening.json')
            setAnimationData(listening.default)
            break
          case 'processing':
            const processing = await import('@/public/animations/avatar-processing.json')
            setAnimationData(processing.default)
            break
          case 'success':
          case 'proud':
          case 'excited':
          case 'celebrating':
          case 'motivated':
            const success = await import('@/public/animations/avatar-success.json')
            setAnimationData(success.default)
            break
          case 'error':
          case 'shocked':
          case 'disappointed':
            const error = await import('@/public/animations/avatar-error.json')
            setAnimationData(error.default)
            break
          case 'concerned':
            const concerned = await import('@/public/animations/avatar-processing.json')
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
