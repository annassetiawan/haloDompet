"use client"

import { useEffect, useState, useRef } from 'react'
import { isSpeechRecognitionSupported, isIOSDevice, isAndroidDevice } from '@/lib/utils'
import { AnimatedRecordButton, RecordingState } from './AnimatedRecordButton'
import { WebSpeechRecorder } from './WebSpeechRecorder'
import { MediaRecorderButton } from './MediaRecorderButton'
import { IOSMediaRecorder } from './iOSMediaRecorder'

interface RecordButtonProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  onStatusChange?: (status: string) => void
}

export function RecordButton({
  onTranscript,
  onError,
  onStatusChange
}: RecordButtonProps) {
  const [isClient, setIsClient] = useState(false)
  const [recorderType, setRecorderType] = useState<'webspeech' | 'ios' | 'mediarecorder'>('mediarecorder')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [audioLevel, setAudioLevel] = useState(0)
  const buttonClickRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)

    // Determine best recorder for this device
    // Priority: iOS first, then Android, then desktop
    if (isIOSDevice()) {
      // iOS (iPhone/iPad) - Use IOSMediaRecorder (RecordRTC + Gemini)
      setRecorderType('ios')
      console.log('🍎 iOS device detected, using IOSMediaRecorder')
    } else if (isAndroidDevice()) {
      // Android - Use MediaRecorder + Gemini STT
      setRecorderType('mediarecorder')
      console.log('🤖 Android device detected, using MediaRecorder + Gemini STT')
    } else if (isSpeechRecognitionSupported()) {
      // Desktop Chrome, Edge - Web Speech API for instant results
      setRecorderType('webspeech')
      console.log('💻 Desktop with Web Speech API detected')
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
    setAudioLevel(level)
  }

  const handleAnimatedButtonClick = () => {
    // Trigger click on the hidden recorder component
    const hiddenButton = document.querySelector('.hidden-recorder-button label') as HTMLElement
    if (hiddenButton) {
      hiddenButton.click()
    }
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
        audioLevel={audioLevel}
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
      </div>
    </div>
  )
}
