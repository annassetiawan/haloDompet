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
    console.log('🎤 WebSpeech: handleListen called')

    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const errorMsg = "Browser tidak mendukung Web Speech API"
      console.error('❌', errorMsg)
      toast.error(errorMsg)
      onError?.(errorMsg)
      return
    }

    console.log('✅ WebSpeech API detected in browser')

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    console.log('✅ SpeechRecognition instance created')

    recognition.lang = 'id-ID'
    recognition.continuous = true  // Allow continuous recording until manually stopped
    recognition.interimResults = true  // Get interim results for better UX
    recognition.maxAlternatives = 1

    console.log('✅ Recognition configured:', {
      lang: recognition.lang,
      continuous: recognition.continuous,
      interimResults: recognition.interimResults
    })

    recognitionRef.current = recognition

    recognition.onstart = () => {
      console.log('🎙️ Recognition started')
      setIsListening(true)
      finalTranscriptRef.current = ''
      onStatusChange?.("Merekam... (Klik lagi untuk berhenti)")
    }

    recognition.onresult = (event: any) => {
      console.log('📝 Recognition result received:', event)
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        console.log(`Result ${i}: "${transcript}" (isFinal: ${event.results[i].isFinal})`)
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      // Update final transcript
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript
        console.log('✅ Final transcript updated:', finalTranscriptRef.current)
      }

      // Show current status with interim or final text
      const currentText = (finalTranscriptRef.current + interimTranscript).trim()
      if (currentText) {
        console.log('📢 Current text:', currentText)
        onStatusChange?.(`Merekam: "${currentText}"`)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('❌ Recognition error:', event.error, event)
      setIsListening(false)

      let errorMsg = 'Terjadi kesalahan'
      if (event.error === 'no-speech') {
        errorMsg = "Tidak mendengar suara. Coba lagi!"
      } else if (event.error === 'not-allowed') {
        errorMsg = "Izinkan akses mikrofon di browser!"
      } else if (event.error === 'network') {
        errorMsg = "Koneksi internet bermasalah"
      } else if (event.error === 'aborted') {
        errorMsg = "Rekaman dibatalkan"
        console.log('⚠️ Recognition aborted')
      } else {
        errorMsg = `Error: ${event.error}`
      }

      console.error('Error message:', errorMsg)
      toast.error(errorMsg)
      onError?.(errorMsg)
      onStatusChange?.("Siap merekam")
    }

    recognition.onend = () => {
      console.log('⏹️ Recognition ended')
      setIsListening(false)

      // Send final transcript to parent if we have any
      const finalText = finalTranscriptRef.current.trim()
      console.log('Final text to send:', finalText)

      if (finalText) {
        console.log('✅ Sending transcript to parent:', finalText)
        onStatusChange?.(`Terdeteksi: "${finalText}"`)
        onTranscript(finalText)
      } else {
        console.log('⚠️ No speech detected')
        onStatusChange?.("Tidak ada suara terdeteksi")
        toast.info("Tidak ada suara terdeteksi. Coba lagi!")
      }

      // Clear ref
      finalTranscriptRef.current = ''
      recognitionRef.current = null
    }

    // Start listening
    try {
      console.log('▶️ Starting recognition...')
      recognition.start()
      console.log('✅ Recognition.start() called successfully')
    } catch (error) {
      console.error('❌ Error calling recognition.start():', error)
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
