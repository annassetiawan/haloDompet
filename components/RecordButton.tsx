"use client"

import { useEffect, useState, useRef } from 'react'
import { isSpeechRecognitionSupported, isIOSDevice } from '@/lib/utils'
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
    if (isSpeechRecognitionSupported()) {
      // Chrome, Edge (Desktop & Android) - Fast, real-time Web Speech API
      setRecorderType('webspeech')
    } else if (isIOSDevice()) {
      // iOS (iPhone/iPad) - Use RecordRTC for better compatibility
      setRecorderType('ios')
      console.log('🍎 iOS device detected, using RecordRTC recorder')
    } else {
      // Firefox, Safari Desktop, others - Standard MediaRecorder
      setRecorderType('mediarecorder')
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
