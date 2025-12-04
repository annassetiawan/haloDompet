'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { isSpeechRecognitionSupported, isIOSDevice } from '@/lib/utils'
import type { LottieAvatarState } from './LottieAvatar'
import { AvatarPlaceholder } from './AvatarPlaceholder'
import { WebSpeechRecorder } from './WebSpeechRecorder'
import { MediaRecorderButton } from './MediaRecorderButton'
import { IOSMediaRecorder } from './iOSMediaRecorder'
import { WebAudioRecorder } from './WebAudioRecorder'

// OPTIMIZED: Lazy load Lottie Avatar (100KB+ library) untuk improve LCP
// Placeholder SVG (< 5KB) ditampilkan first untuk fast LCP
const LottieAvatar = dynamic(
  () => import('./LottieAvatar').then((mod) => ({ default: mod.LottieAvatar })),
  {
    ssr: false,
    loading: () => <AvatarPlaceholder />,
  },
)

interface LottieAvatarRecorderProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  onStatusChange?: (status: string) => void
  isLoading?: boolean
  // TAMBAHAN: Prop untuk menerima sentiment dari parent component
  sentiment?: LottieAvatarState
}

export function LottieAvatarRecorder({
  onTranscript,
  onError,
  onStatusChange,
  isLoading = false,
  sentiment, // Destructure prop baru
}: LottieAvatarRecorderProps) {
  const [isClient, setIsClient] = useState(false)
  const [recorderType, setRecorderType] = useState<
    'webspeech' | 'ios' | 'mediarecorder' | 'webaudio'
  >('mediarecorder')
  const [avatarState, setAvatarState] = useState<LottieAvatarState>('idle')

  useEffect(() => {
    setIsClient(true)

    // Determine best recorder for this device
    if (isSpeechRecognitionSupported()) {
      setRecorderType('webspeech')
      console.log('✅ WebSpeech API enabled for LottieAvatar')
    } else if (isIOSDevice()) {
      setRecorderType('ios')
      console.log('🍎 iOS fallback to IOSMediaRecorder for LottieAvatar')
    } else {
      setRecorderType('mediarecorder')
      console.log('🌐 Fallback to MediaRecorder + Gemini STT for LottieAvatar')
    }
  }, [])

  useEffect(() => {
    if (sentiment) {
      setAvatarState(sentiment)
    } else {
      // TAMBAHAN PENTING:
      // Saat parent menghapus sentiment (setelah 5 detik),
      // kita harus memaksa avatar kembali ke 'idle'.
      setAvatarState('idle')
    }
  }, [sentiment])

  // Map status text to avatar state
  const handleInternalStatusChange = (status: string) => {
    onStatusChange?.(status)

    // Update avatar state based on status
    if (status.includes('Merekam') || status.includes('Mendengarkan')) {
      setAvatarState('listening')
    } else if (status.includes('Memproses') || status.includes('Mengirim')) {
      setAvatarState('processing')
    } else if (status.includes('Terdeteksi') || status.includes('Berhasil')) {
      if (sentiment) {
        setAvatarState(sentiment)
      } else {
        // PERUBAHAN DI SINI:
        // Jika ada sentiment yang dikirim dari parent (hasil AI), gunakan itu.
        // Jika tidak, fallback ke 'success' biasa.
        setAvatarState(sentiment || 'success')
      }

      // Reset to idle after 3 seconds (sedikit diperlama biar animasinya kelihatan)
      setTimeout(() => setAvatarState('idle'), 3000)
    } else if (
      status.includes('Gagal') ||
      status.includes('kesalahan') ||
      status.includes('Error')
    ) {
      setAvatarState('error')
      setTimeout(() => setAvatarState('idle'), 2000)
    } else {
      setAvatarState('idle')
    }
  }

  const handleAvatarClick = () => {
    // Trigger click on the hidden recorder component (client-side only)
    if (typeof document === 'undefined') return

    const hiddenButton = document.querySelector(
      '.hidden-recorder-button label',
    ) as HTMLElement
    if (hiddenButton) {
      hiddenButton.click()
    }
  }

  // Show placeholder while loading or on server
  // OPTIMIZED: Use same placeholder for consistent LCP
  if (isLoading || !isClient) {
    return (
      <div className="relative">
        <AvatarPlaceholder />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Lottie Avatar (Visible) */}
      <LottieAvatar
        state={avatarState}
        onClick={handleAvatarClick}
        disabled={avatarState === 'processing'}
      />

      {/* Hidden Recorder (Logic Only) */}
      <div className="hidden-recorder-button absolute opacity-0 pointer-events-none -z-10">
        {recorderType === 'webspeech' && (
          <WebSpeechRecorder
            onTranscript={onTranscript}
            onError={onError}
            onStatusChange={handleInternalStatusChange}
          />
        )}

        {recorderType === 'ios' && (
          <IOSMediaRecorder
            onTranscript={onTranscript}
            onError={onError}
            onStatusChange={handleInternalStatusChange}
            onAudioLevelChange={() => {}}
          />
        )}

        {recorderType === 'mediarecorder' && (
          <MediaRecorderButton
            onTranscript={onTranscript}
            onError={onError}
            onStatusChange={handleInternalStatusChange}
            onAudioLevelChange={() => {}}
          />
        )}

        {recorderType === 'webaudio' && (
          <WebAudioRecorder
            onTranscript={onTranscript}
            onError={onError}
            onStatusChange={handleInternalStatusChange}
            onAudioLevelChange={() => {}}
          />
        )}
      </div>
    </div>
  )
}
