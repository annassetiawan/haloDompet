"use client"

import { useState, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface WebSpeechRecorderProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  onStatusChange?: (status: string) => void
}

export function WebSpeechRecorder({
  onTranscript,
  onError,
  onStatusChange
}: WebSpeechRecorderProps) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef<string>('')
  const shouldBeListeningRef = useRef<boolean>(false)
  const restartCountRef = useRef<number>(0)

  const stopListening = () => {
    shouldBeListeningRef.current = false
    restartCountRef.current = 0
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleListen = async () => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const errorMsg = "Browser tidak mendukung Web Speech API"
      toast.error(errorMsg)
      onError?.(errorMsg)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'id-ID'
    recognition.continuous = false  // Don't use continuous mode to avoid duplicates
    recognition.interimResults = true  // Get interim results for better UX
    recognition.maxAlternatives = 1

    recognitionRef.current = recognition
    shouldBeListeningRef.current = true
    restartCountRef.current = 0

    recognition.onstart = () => {
      setIsListening(true)
      if (restartCountRef.current === 0) {
        finalTranscriptRef.current = ''
      }
      onStatusChange?.("Merekam... (Klik lagi untuk berhenti)")
    }

    recognition.onresult = (event: any) => {
      // Stop auto-restart once we get any result (speech detected)
      shouldBeListeningRef.current = false
      restartCountRef.current = 0

      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      // Update final transcript
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript
      }

      // Show current status with interim or final text
      const currentText = (finalTranscriptRef.current + interimTranscript).trim()
      if (currentText) {
        onStatusChange?.(`Merekam: "${currentText}"`)
      }
    }

    recognition.onerror = (event: any) => {
      // Auto-restart on no-speech error (WebSpeech timeout is too short)
      if (event.error === 'no-speech' && shouldBeListeningRef.current) {
        restartCountRef.current++

        // Prevent infinite restart loop (max 20 times = ~1 minute)
        if (restartCountRef.current > 20) {
          shouldBeListeningRef.current = false
          setIsListening(false)
          toast.error("Tidak mendengar suara. Silakan coba lagi!")
          onStatusChange?.("Siap merekam")
          return
        }

        // Restart recognition immediately
        setTimeout(() => {
          if (shouldBeListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (err) {
              console.error('Error restarting:', err)
            }
          }
        }, 100)
        return
      }

      // Other errors - stop listening
      shouldBeListeningRef.current = false
      setIsListening(false)

      let errorMsg = 'Terjadi kesalahan'
      if (event.error === 'not-allowed') {
        errorMsg = "Izinkan akses mikrofon di browser!"
      } else if (event.error === 'network') {
        errorMsg = "Koneksi internet bermasalah"
      } else if (event.error === 'aborted') {
        return // Don't show error for aborted
      } else if (event.error === 'audio-capture') {
        errorMsg = "Gagal mengakses mikrofon"
      } else {
        errorMsg = `Error: ${event.error}`
      }

      toast.error(errorMsg)
      onError?.(errorMsg)
      onStatusChange?.("Siap merekam")
    }

    recognition.onend = () => {
      // If we should still be listening (auto-restart case), don't process yet
      if (shouldBeListeningRef.current) {
        return
      }

      setIsListening(false)

      // Send final transcript to parent if we have any
      const finalText = finalTranscriptRef.current.trim()

      if (finalText) {
        onStatusChange?.(`Terdeteksi: "${finalText}"`)
        onTranscript(finalText)
      } else {
        onStatusChange?.("Tidak ada suara terdeteksi")
        toast.info("Tidak ada suara terdeteksi. Coba lagi!")
      }

      // Clear ref
      finalTranscriptRef.current = ''
      recognitionRef.current = null
      restartCountRef.current = 0
    }

    // Start listening
    try {
      recognition.start()
    } catch (error) {
      const errorMsg = 'Gagal memulai rekaman'
      toast.error(errorMsg)
      onError?.(errorMsg)
      setIsListening(false)
    }
  }

  return (
    <div className="neomorphic-container">
      <input
        id="record-checkbox"
        type="checkbox"
        checked={isListening}
        onChange={() => {}}
        className="neomorphic-input"
      />
      <label
        className={`neomorphic-button ${isListening ? 'active' : ''}`}
        htmlFor="record-checkbox"
        onClick={(e) => {
          e.preventDefault()
          if (isListening) {
            stopListening()
          } else {
            handleListen()
          }
        }}
      >
        <span className="neomorphic-icon">
          {isListening ? (
            <Mic className="h-12 w-12 md:h-16 md:w-16" />
          ) : (
            <MicOff className="h-12 w-12 md:h-16 md:w-16" />
          )}
        </span>
      </label>
    </div>
  )
}
