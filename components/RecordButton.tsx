"use client"

import { useEffect, useState } from 'react'
import { isSpeechRecognitionSupported } from '@/lib/utils'
import { WebSpeechRecorder } from './WebSpeechRecorder'
import { MediaRecorderButton } from './MediaRecorderButton'

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
  const [useSpeechAPI, setUseSpeechAPI] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setUseSpeechAPI(isSpeechRecognitionSupported())
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

  // Render appropriate recorder based on browser support
  if (useSpeechAPI) {
    // Chrome, Edge (Desktop & Android) - Fast, real-time
    return (
      <WebSpeechRecorder
        onTranscript={onTranscript}
        onError={onError}
        onStatusChange={onStatusChange}
      />
    )
  } else {
    // Safari iOS, Firefox, others - Upload + STT
    return (
      <MediaRecorderButton
        onTranscript={onTranscript}
        onError={onError}
        onStatusChange={onStatusChange}
      />
    )
  }
}
