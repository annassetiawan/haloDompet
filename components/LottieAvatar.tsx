'use client'

import Lottie from 'lottie-react'
import avatarIdleAnimation from '@/public/animations/avatar-idle.json'

export type LottieAvatarState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'success'
  | 'error'

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

  // Untuk sekarang semua state menggunakan animasi yang sama
  // Nanti user bisa ganti dengan file berbeda per state:
  // - avatar-idle.json
  // - avatar-listening.json
  // - avatar-processing.json
  // - avatar-success.json
  // - avatar-error.json
  const getAnimationData = () => {
    // Placeholder: gunakan animasi yang sama untuk semua state
    // TODO: Ganti dengan animasi berbeda per state
    return avatarIdleAnimation
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
