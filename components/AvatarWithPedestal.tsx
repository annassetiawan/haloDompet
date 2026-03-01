'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'

interface AvatarWithPedestalProps {
  children: ReactNode
  className?: string
}

export function AvatarWithPedestal({
  children,
  className = '',
}: AvatarWithPedestalProps) {
  return (
    <div
      className={`relative isolate flex items-center justify-center w-[208px] h-[214px] sm:w-[224px] sm:h-[226px] ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 bottom-[1.7rem] z-[5] h-4 w-20 -translate-x-1/2 rounded-full bg-black/18 blur-sm"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -bottom-20 z-0 w-[110%] -translate-x-1/2"
      >
        <Image
          src="/pedestal.png"
          alt=""
          width={960}
          height={400}
          className="h-auto w-full object-contain select-none"
          draggable={false}
          priority={false}
          sizes="(max-width: 640px) 260px, 300px"
        />
      </div>

      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
