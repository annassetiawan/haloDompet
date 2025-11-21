"use client"

import { useEffect, useState, useRef } from 'react'
import { isSpeechRecognitionSupported, isIOSDevice, isAndroidDevice } from '@/lib/utils'
import { AnimatedRecordButton, RecordingState } from './AnimatedRecordButton'
import { WebSpeechRecorder } from './WebSpeechRecorder'
import { MediaRecorderButton } from './MediaRecorderButton'
import { IOSMediaRecorder } from './iOSMediaRecorder'
import { WebAudioRecorder } from './WebAudioRecorder'

interface RecordButtonProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  onStatusChange?: (status: string) => void
  isLoading?: boolean
}

export function RecordButton({
  onTranscript,
  onError,
  onStatusChange,
  isLoading = false
}: RecordButtonProps) {
  const [isClient, setIsClient] = useState(false)
  const [recorderType, setRecorderType] = useState<'webspeech' | 'ios' | 'mediarecorder' | 'webaudio'>('mediarecorder')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [audioLevel, setAudioLevel] = useState(0)
  const buttonClickRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)

    // Determine best recorder for this device
    // Use WebSpeech API for all platforms that support it
    if (isSpeechRecognitionSupported()) {
      // iOS, Android, Desktop Chrome/Edge - WebSpeech API
      setRecorderType('webspeech')
      console.log('✅ WebSpeech API enabled')
    } else if (isIOSDevice()) {
      // iOS fallback if Web Speech not available
      setRecorderType('ios')
      console.log('🍎 iOS fallback to IOSMediaRecorder')
    } else {
      // Firefox, Safari Desktop, others - MediaRecorder + Gemini
      setRecorderType('mediarecorder')
      console.log('🌐 Fallback to MediaRecorder + Gemini STT')
    }
  }, [])

  // Map status text to recording state
  const handleInternalStatusChange = (status: string) => {
    onStatusChange?.(status)

    // Update recording state based on status
    if (status.includes('Merekam') || status.includes('Mendengarkan')) {
      setRecordingState('recording')
    } else if (status.includes('Memproses') || status.includes('Mengirim')) {
      setRecordingState('processing')
    } else if (status.includes('Terdeteksi') || status.includes('Berhasil')) {
      setRecordingState('success')
      // Reset to idle after 2 seconds
      setTimeout(() => setRecordingState('idle'), 2000)
    } else if (status.includes('Gagal') || status.includes('kesalahan') || status.includes('Error')) {
      setRecordingState('error')
      // Reset to idle after 2 seconds
      setTimeout(() => setRecordingState('idle'), 2000)
    } else {
      setRecordingState('idle')
    }
  }

  const handleAudioLevelChange = (level: number) => {
    // Only update audio level for recorders that support it (not WebSpeech)
    if (recorderType !== 'webspeech') {
      setAudioLevel(level)
    }
  }

  const handleAnimatedButtonClick = () => {
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
        {/* Skeleton Circle - Same size as AnimatedRecordButton large (160px) */}
        <div className="w-40 h-40 rounded-full bg-muted animate-pulse" />
        {/* Skeleton Text - Label placeholder */}
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
      {/* Animated Button (Visible) */}
      <AnimatedRecordButton
        state={recordingState}
        onClick={handleAnimatedButtonClick}
        audioLevel={recorderType === 'webspeech' ? 0 : audioLevel}
        size="large"
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
            onAudioLevelChange={handleAudioLevelChange}
          />
        )}

        {recorderType === 'mediarecorder' && (
          <MediaRecorderButton
            onTranscript={onTranscript}
            onError={onError}
            onStatusChange={handleInternalStatusChange}
            onAudioLevelChange={handleAudioLevelChange}
          />
        )}

        {recorderType === 'webaudio' && (
          <WebAudioRecorder
            onTranscript={onTranscript}
            onError={onError}
            onStatusChange={handleInternalStatusChange}
            onAudioLevelChange={handleAudioLevelChange}
          />
        )}
      </div>
    </div>
  )
}
