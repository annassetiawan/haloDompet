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
  const hasSubmittedRef = useRef<boolean>(false)

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        // Ignore error if already stopped
      }
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
    recognition.continuous = true  // Allow continuous recording until manually stopped
    recognition.interimResults = true  // Get interim results for better UX
    recognition.maxAlternatives = 1

    recognitionRef.current = recognition

    recognition.onstart = () => {
      setIsListening(true)
      finalTranscriptRef.current = ''
      hasSubmittedRef.current = false
      onStatusChange?.("Merekam... (Klik lagi untuk berhenti)")
    }

    recognition.onresult = (event: any) => {
      // Build transcript from scratch each time to get complete text
      let completeFinalTranscript = ''
      let interimTranscript = ''

      // Go through ALL results, not just from resultIndex
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          completeFinalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      // Update the stored final transcript
      finalTranscriptRef.current = completeFinalTranscript.trim()

      // Show current status with what we have so far
      const displayText = (completeFinalTranscript + interimTranscript).trim()
      if (displayText) {
        onStatusChange?.(`Merekam: "${displayText}"`)
      }
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)

      let errorMsg = 'Terjadi kesalahan'
      if (event.error === 'no-speech') {
        errorMsg = "Tidak mendengar suara. Coba lagi!"
      } else if (event.error === 'not-allowed') {
        errorMsg = "Izinkan akses mikrofon di browser!"
      } else if (event.error === 'network') {
        errorMsg = "Koneksi internet bermasalah"
      } else {
        errorMsg = `Error: ${event.error}`
      }

      toast.error(errorMsg)
      onError?.(errorMsg)
      onStatusChange?.("Siap merekam")
    }

    recognition.onend = () => {
      setIsListening(false)

      // Prevent multiple submissions when onend fires multiple times (Android issue)
      if (hasSubmittedRef.current) {
        return
      }

      // Use the stored final transcript
      const finalText = finalTranscriptRef.current.trim()
      if (finalText) {
        hasSubmittedRef.current = true
        onStatusChange?.(`Terdeteksi: "${finalText}"`)
        onTranscript(finalText)
      } else {
        onStatusChange?.("Tidak ada suara terdeteksi")
        toast.info("Tidak ada suara terdeteksi. Coba lagi!")
      }

      // Clear refs
      finalTranscriptRef.current = ''
      recognitionRef.current = null
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
