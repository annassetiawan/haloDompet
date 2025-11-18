"use client"

import { useState } from 'react'
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
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      onStatusChange?.("Mendengarkan... (Ucapkan pengeluaran Anda)")
    }

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      setIsListening(false)
      onStatusChange?.(`Terdeteksi: "${transcript}"`)

      // Pass transcript to parent (parent will handle processing state)
      onTranscript(transcript)
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
      // Don't reset status here - let parent handle it
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
          if (!isListening) {
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
