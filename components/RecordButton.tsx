"use client"

import { useEffect, useState } from 'react'
import { isSpeechRecognitionSupported, isIOSDevice } from '@/lib/utils'
import { WebSpeechRecorder } from './WebSpeechRecorder'
import { MediaRecorderButton } from './MediaRecorderButton'
import { iOSMediaRecorder } from './iOSMediaRecorder'

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

  // Don't render anything on server
  if (!isClient) {
    return (
      <div className="neomorphic-container">
        <div className="neomorphic-button">
          <span className="neomorphic-icon">
            <div className="h-12 w-12 md:h-16 md:w-16" />
          </span>
        </div>
      </div>
    )
  }

  // Render appropriate recorder based on device/browser
  switch (recorderType) {
    case 'webspeech':
      // Chrome, Edge (Desktop & Android) - Fast, real-time
      return (
        <WebSpeechRecorder
          onTranscript={onTranscript}
          onError={onError}
          onStatusChange={onStatusChange}
        />
      )

    case 'ios':
      // iOS (iPhone/iPad) - RecordRTC for better Safari compatibility
      return (
        <iOSMediaRecorder
          onTranscript={onTranscript}
          onError={onError}
          onStatusChange={onStatusChange}
        />
      )

    case 'mediarecorder':
    default:
      // Firefox, Safari Desktop, others - Standard MediaRecorder
      return (
        <MediaRecorderButton
          onTranscript={onTranscript}
          onError={onError}
          onStatusChange={onStatusChange}
        />
      )
  }
}
