"use client"

import { motion } from 'framer-motion'

interface VoiceLevelBarsProps {
  level: number // 0-1 normalized
  barCount?: number
  className?: string
  color?: string
}

export function VoiceLevelBars({
  level,
  barCount = 5,
  className = '',
  color = '#ef4444' // red-500
}: VoiceLevelBarsProps) {
  // Generate bar heights based on level and position
  // Center bars are taller, creating a wave pattern
  const getBarHeight = (index: number) => {
    const center = (barCount - 1) / 2
    const distance = Math.abs(index - center)
    const baseHeight = 20 + (level * 60) // 20-80% height based on level
    const positionMultiplier = 1 - (distance / center) * 0.3 // Center bars 30% taller
    return Math.max(baseHeight * positionMultiplier, 20) // Minimum 20%
  }

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {Array.from({ length: barCount }).map((_, index) => (
        <motion.div
          key={index}
          className="w-1.5 rounded-full"
          style={{
            backgroundColor: color,
            height: '40px',
          }}
          animate={{
            scaleY: getBarHeight(index) / 100,
          }}
          transition={{
            duration: 0.1,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
