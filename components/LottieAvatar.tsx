"use client"

import Lottie from 'lottie-react'
import avatarIdleAnimation from '@/public/animations/avatar-idle.json'

interface LottieAvatarProps {
  onClick?: () => void
  className?: string
}

export function LottieAvatar({ onClick, className = '' }: LottieAvatarProps) {
  const handleClick = () => {
    console.log('Avatar diklik')
    onClick?.()
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <Lottie
        animationData={avatarIdleAnimation}
        loop={true}
        autoplay={true}
        className="w-40 h-40"
      />
    </div>
  )
}
