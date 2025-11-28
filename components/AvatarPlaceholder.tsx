// Server Component - No 'use client' directive
// This renders immediately on the server for fast LCP

interface AvatarPlaceholderProps {
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function AvatarPlaceholder({
  onClick,
  className = '',
  disabled = false,
}: AvatarPlaceholderProps) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        avatar-container cursor-pointer transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
      role="button"
      aria-label="Voice recorder button"
      tabIndex={disabled ? -1 : 0}
    >
      <img
        src="/avatar-placeholder.svg"
        alt="Voice Recorder Avatar"
        width={160}
        height={160}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  )
}
