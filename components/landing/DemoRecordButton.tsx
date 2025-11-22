"use client"

import { useState, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface DemoRecordButtonProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  onStatusChange?: (status: string) => void
}

export function DemoRecordButton({
  onTranscript,
  onError,
  onStatusChange,
}: DemoRecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      console.log('[DEMO] Starting recording...')
      onStatusChange?.('Meminta akses mikrofon...')

      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Handle stop
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

        // Stop stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }

        await uploadAndTranscribe(audioBlob)
      }

      // Start recording
      mediaRecorder.start(1000)
      setIsRecording(true)
      onStatusChange?.('Merekam... (Klik lagi untuk berhenti)')

      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording()
        }
      }, 10000)

    } catch (error: any) {
      console.error('[DEMO] Recording error:', error)

      let errorMsg = 'Gagal merekam audio'
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Izinkan akses mikrofon untuk mencoba demo'
      }

      toast.error(errorMsg)
      onError?.(errorMsg)
      onStatusChange?.('Siap merekam')
    }
  }

  const stopRecording = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
      onStatusChange?.('Memproses audio...')
    }
  }

  const uploadAndTranscribe = async (audioBlob: Blob) => {
    try {
      if (audioBlob.size === 0) {
        throw new Error('Rekaman kosong. Silakan coba lagi.')
      }

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      // Upload to DEMO STT API (no auth required)
      console.log('[DEMO] Uploading to /api/demo/stt...')
      const response = await fetch('/api/demo/stt', {
        method: 'POST',
        // No credentials needed for demo endpoint
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('[DEMO] Transcription success:', data.text)
        onStatusChange?.(`Terdeteksi: "${data.text}"`)
        onTranscript(data.text)
      } else {
        // Handle rate limit
        if (response.status === 429) {
          throw new Error(data.details || 'Demo terbatas. Silakan login untuk akses penuh!')
        }
        throw new Error(data.error || 'Gagal memproses audio')
      }
    } catch (error) {
      console.error('[DEMO] Upload error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Gagal memproses audio'
      toast.error(errorMsg)
      onError?.(errorMsg)
      onStatusChange?.('Siap merekam')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClick = () => {
    if (isProcessing) return

    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={handleClick}
        disabled={isProcessing}
        whileHover={{ scale: isProcessing ? 1 : 1.05 }}
        whileTap={{ scale: isProcessing ? 1 : 0.95 }}
        className={`
          relative w-32 h-32 rounded-full flex items-center justify-center
          transition-all duration-300
          ${isRecording
            ? 'bg-red-500 shadow-lg shadow-red-500/50'
            : isProcessing
            ? 'bg-violet-400 shadow-lg shadow-violet-500/30'
            : 'bg-gradient-to-br from-violet-600 to-violet-500 hover:shadow-xl hover:shadow-violet-500/40'
          }
          ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isProcessing ? (
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        ) : isRecording ? (
          <Square className="w-12 h-12 text-white fill-current" />
        ) : (
          <Mic className="w-12 h-12 text-white" />
        )}

        {/* Pulse animation when recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-75" />
        )}
      </motion.button>

      <p className="text-sm text-muted-foreground text-center">
        {isProcessing
          ? 'Memproses...'
          : isRecording
          ? 'Klik untuk berhenti'
          : 'Klik untuk merekam'
        }
      </p>
    </div>
  )
}
