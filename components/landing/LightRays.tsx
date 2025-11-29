'use client'

import React from 'react'

interface LightRaysProps {
  className?: string
  color?: string
  opacity?: number
}

export function LightRays({
  className = '',
  color = 'violet',
  opacity = 0.15
}: LightRaysProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Light rays emanating from top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] animate-light-rays"
        style={{
          background: `conic-gradient(
            from 180deg at 50% 0%,
            transparent 0deg,
            ${getColorValue(color, opacity)} 10deg,
            transparent 20deg,
            transparent 40deg,
            ${getColorValue(color, opacity * 0.7)} 50deg,
            transparent 60deg,
            transparent 80deg,
            ${getColorValue(color, opacity)} 90deg,
            transparent 100deg,
            transparent 120deg,
            ${getColorValue(color, opacity * 0.8)} 130deg,
            transparent 140deg,
            transparent 160deg,
            ${getColorValue(color, opacity * 0.6)} 170deg,
            transparent 180deg,
            transparent 200deg,
            ${getColorValue(color, opacity)} 210deg,
            transparent 220deg,
            transparent 240deg,
            ${getColorValue(color, opacity * 0.7)} 250deg,
            transparent 260deg,
            transparent 280deg,
            ${getColorValue(color, opacity * 0.9)} 290deg,
            transparent 300deg,
            transparent 320deg,
            ${getColorValue(color, opacity * 0.5)} 330deg,
            transparent 340deg,
            transparent 360deg
          )`,
          mixBlendMode: 'screen',
          filter: 'blur(60px)',
        }}
      />

      {/* Additional layer for depth */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[180%] h-[180%] animate-light-rays-slow"
        style={{
          background: `conic-gradient(
            from 0deg at 50% 0%,
            transparent 0deg,
            ${getColorValue(color, opacity * 0.4)} 15deg,
            transparent 30deg,
            transparent 60deg,
            ${getColorValue(color, opacity * 0.6)} 75deg,
            transparent 90deg,
            transparent 120deg,
            ${getColorValue(color, opacity * 0.5)} 135deg,
            transparent 150deg,
            transparent 180deg,
            ${getColorValue(color, opacity * 0.4)} 195deg,
            transparent 210deg,
            transparent 240deg,
            ${getColorValue(color, opacity * 0.7)} 255deg,
            transparent 270deg,
            transparent 300deg,
            ${getColorValue(color, opacity * 0.3)} 315deg,
            transparent 330deg,
            transparent 360deg
          )`,
          mixBlendMode: 'screen',
          filter: 'blur(80px)',
        }}
      />

      <style jsx>{`
        @keyframes light-rays {
          0% {
            transform: translateX(-50%) rotate(0deg);
          }
          100% {
            transform: translateX(-50%) rotate(360deg);
          }
        }

        @keyframes light-rays-slow {
          0% {
            transform: translateX(-50%) rotate(0deg);
          }
          100% {
            transform: translateX(-50%) rotate(-360deg);
          }
        }

        .animate-light-rays {
          animation: light-rays 60s linear infinite;
        }

        .animate-light-rays-slow {
          animation: light-rays-slow 90s linear infinite;
        }
      `}</style>
    </div>
  )
}

function getColorValue(color: string, opacity: number): string {
  const colors: Record<string, string> = {
    violet: `rgba(139, 92, 246, ${opacity})`, // violet-500
    pink: `rgba(236, 72, 153, ${opacity})`, // pink-500
    orange: `rgba(249, 115, 22, ${opacity})`, // orange-500
    blue: `rgba(59, 130, 246, ${opacity})`, // blue-500
    purple: `rgba(168, 85, 247, ${opacity})`, // purple-500
  }

  return colors[color] || colors.violet
}
