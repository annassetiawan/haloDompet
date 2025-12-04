"use client"

import { useState, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { isIOSDevice } from '@/lib/utils'

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
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef<string>('')
  const shouldBeListeningRef = useRef<boolean>(false)
  const restartCountRef = useRef<number>(0)
  const isIOSRef = useRef<boolean>(false)

  const stopListening = () => {
    shouldBeListeningRef.current = false
    restartCountRef.current = 0
    isIOSRef.current = false
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      setIsProcessing(false)
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

    const isIOS = isIOSDevice()
    isIOSRef.current = isIOS

    recognition.lang = 'id-ID'
    // iOS needs continuous=true to capture full transcript
    // Android/Desktop needs continuous=false to prevent duplicates
    recognition.continuous = isIOS ? true : false
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
      // For Android/Desktop: stop auto-restart once we get result (prevents duplicates)
      // For iOS: keep auto-restart running (continuous mode needs it)
      if (!isIOSRef.current) {
        shouldBeListeningRef.current = false
        restartCountRef.current = 0
      }

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
      setIsProcessing(false)

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
      onStatusChange?.(`Error: ${errorMsg}`)
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
        // Show processing state with artificial delay for better UX consistency
        setIsProcessing(true)
        onStatusChange?.("Memproses...")

        // Delay 700ms to show processing state (similar to MediaRecorder UX)
        setTimeout(() => {
          onStatusChange?.(`Terdeteksi: "${finalText}"`)
          onTranscript(finalText)
          setIsProcessing(false)

          // Clear ref
          finalTranscriptRef.current = ''
          recognitionRef.current = null
          restartCountRef.current = 0
        }, 700)
      } else {
        onStatusChange?.("Tidak ada suara terdeteksi")
        toast.info("Tidak ada suara terdeteksi. Coba lagi!")

        // Clear ref
        finalTranscriptRef.current = ''
        recognitionRef.current = null
        restartCountRef.current = 0
      }
    }

    // Start listening
    try {
      recognition.start()
    } catch (error) {
      const errorMsg = 'Gagal memulai rekaman'
      toast.error(errorMsg)
      onError?.(errorMsg)
      setIsListening(false)
      onStatusChange?.(`Error: ${errorMsg}`)
      setIsProcessing(false)
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
        className={`neomorphic-button ${isListening ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}
        htmlFor="record-checkbox"
        onClick={(e) => {
          e.preventDefault()
          if (isProcessing) {
            return // Do nothing while processing
          }
          if (isListening) {
            stopListening()
          } else {
            handleListen()
          }
        }}
      >
        <span className="neomorphic-icon">
          {isProcessing ? (
            <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin" />
          ) : isListening ? (
            <Mic className="h-12 w-12 md:h-16 md:w-16" />
          ) : (
            <MicOff className="h-12 w-12 md:h-16 md:w-16" />
          )}
        </span>
      </label>
    </div>
  )
}
