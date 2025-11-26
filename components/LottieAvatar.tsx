'use client'

import Lottie from 'lottie-react'
import avatarIdleAnimation from '@/public/animations/avatar-idle.json'
import avatarListeningAnimation from '@/public/animations/avatar-listening.json'
import avatarProcessingAnimation from '@/public/animations/avatar-processing.json'
import avatarSuccessAnimation from '@/public/animations/avatar-success.json'
import avatarErrorAnimation from '@/public/animations/avatar-error.json'

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
        return avatarListeningAnimation
      case 'processing':
        return avatarProcessingAnimation
      case 'success':
        return avatarSuccessAnimation
      case 'error':
        return avatarErrorAnimation

      // Sentiment-based states for EXPENSE
      case 'proud':
        // TODO: Ganti dengan avatar-proud.json saat sudah ada
        return avatarSuccessAnimation // Placeholder: gunakan success (positif)
      case 'concerned':
        // TODO: Ganti dengan avatar-concerned.json saat sudah ada
        return avatarProcessingAnimation // Placeholder: gunakan processing (ragu-ragu)
      case 'shocked':
        // TODO: Ganti dengan avatar-shocked.json saat sudah ada
        return avatarErrorAnimation // Placeholder: gunakan error (negatif kuat)
      case 'disappointed':
        // TODO: Ganti dengan avatar-disappointed.json saat sudah ada
        return avatarErrorAnimation // Placeholder: gunakan error (negatif)

      // Sentiment-based states for INCOME
      case 'excited':
        // TODO: Ganti dengan avatar-excited.json saat sudah ada
        return avatarSuccessAnimation // Placeholder: gunakan success (positif kuat)
      case 'celebrating':
        // TODO: Ganti dengan avatar-celebrating.json saat sudah ada
        return avatarSuccessAnimation // Placeholder: gunakan success (positif kuat)
      case 'motivated':
        // TODO: Ganti dengan avatar-motivated.json saat sudah ada
        return avatarSuccessAnimation // Placeholder: gunakan success (positif)

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
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}

        ${className}
      `}
    >
      <Lottie
        animationData={getAnimationData()}
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
