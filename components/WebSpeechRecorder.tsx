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

  const stopListening = () => {
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
    recognition.continuous = true  // Allow continuous recording until manually stopped
    recognition.interimResults = true  // Get interim results for better UX
    recognition.maxAlternatives = 1

    recognitionRef.current = recognition

    recognition.onstart = () => {
      setIsListening(true)
      finalTranscriptRef.current = ''
      onStatusChange?.("Merekam... (Klik lagi untuk berhenti)")
    }

    recognition.onresult = (event: any) => {
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
