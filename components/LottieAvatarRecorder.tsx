"use client"

import { useEffect, useState } from 'react'
import { isSpeechRecognitionSupported, isIOSDevice } from '@/lib/utils'
import { LottieAvatar, LottieAvatarState } from './LottieAvatar'
import { WebSpeechRecorder } from './WebSpeechRecorder'
import { MediaRecorderButton } from './MediaRecorderButton'
import { IOSMediaRecorder } from './iOSMediaRecorder'
import { WebAudioRecorder } from './WebAudioRecorder'

interface LottieAvatarRecorderProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  onStatusChange?: (status: string) => void
  isLoading?: boolean
}

export function LottieAvatarRecorder({
  onTranscript,
  onError,
  onStatusChange,
  isLoading = false,
}: LottieAvatarRecorderProps) {
  const [isClient, setIsClient] = useState(false)
  const [recorderType, setRecorderType] = useState<'webspeech' | 'ios' | 'mediarecorder' | 'webaudio'>('mediarecorder')
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

  // Map status text to avatar state
  const handleInternalStatusChange = (status: string) => {
    onStatusChange?.(status)

    // Update avatar state based on status
    if (status.includes('Merekam') || status.includes('Mendengarkan')) {
      setAvatarState('listening')
    } else if (status.includes('Memproses') || status.includes('Mengirim')) {
      setAvatarState('processing')
    } else if (status.includes('Terdeteksi') || status.includes('Berhasil')) {
      setAvatarState('success')
      // Reset to idle after 2 seconds
      setTimeout(() => setAvatarState('idle'), 2000)
    } else if (status.includes('Gagal') || status.includes('kesalahan') || status.includes('Error')) {
      setAvatarState('error')
      // Reset to idle after 2 seconds
      setTimeout(() => setAvatarState('idle'), 2000)
    } else {
      setAvatarState('idle')
    }
  }

  const handleAvatarClick = () => {
    // Trigger click on the hidden recorder component (client-side only)
    if (typeof document === 'undefined') return

    const hiddenButton = document.querySelector('.hidden-recorder-button label') as HTMLElement
    if (hiddenButton) {
      hiddenButton.click()
    }
  }

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-40 h-40 rounded-full bg-muted animate-pulse" />
        <div className="w-32 h-5 rounded bg-muted animate-pulse" />
      </div>
    )
  }

  // Don't render anything on server
  if (!isClient) {
    return (
      <div className="flex flex-col items-center">
        <div className="h-40 w-40" />
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
