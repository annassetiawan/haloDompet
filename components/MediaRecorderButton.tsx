"use client"

import { useState, useRef } from 'react'
import { Mic, MicOff, Loader2, Square } from 'lucide-react'
import { toast } from 'sonner'

interface MediaRecorderButtonProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  onStatusChange?: (status: string) => void
}

export function MediaRecorderButton({
  onTranscript,
  onError,
  onStatusChange
}: MediaRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())

        // Upload and transcribe
        await uploadAndTranscribe(audioBlob)
      }

      // Handle errors
      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error)
        const errorMsg = 'Terjadi kesalahan saat merekam'
        toast.error(errorMsg)
        onError?.(errorMsg)
        setIsRecording(false)
        onStatusChange?.("Siap merekam")

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      onStatusChange?.("Merekam... (Klik lagi untuk berhenti)")

      // Auto-stop after 10 seconds (safety timeout)
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording()
          toast.info('Rekaman otomatis berhenti setelah 10 detik')
        }
      }, 10000)

    } catch (error: any) {
      console.error('Error starting recording:', error)

      let errorMsg = 'Gagal memulai rekaman'
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Izinkan akses mikrofon di browser!'
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'Mikrofon tidak ditemukan'
      } else if (error.name === 'NotReadableError') {
        errorMsg = 'Mikrofon sedang digunakan aplikasi lain'
      }

      toast.error(errorMsg)
      onError?.(errorMsg)
      onStatusChange?.("Siap merekam")
    }
  }

  const stopRecording = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
      onStatusChange?.("Memproses audio...")
    }
  }

  const uploadAndTranscribe = async (audioBlob: Blob) => {
    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      // Upload to STT API
      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const transcript = data.text
        onStatusChange?.(`Terdeteksi: "${transcript}"`)
        onTranscript(transcript)
        onStatusChange?.("Siap merekam")
      } else {
        throw new Error(data.error || 'Gagal memproses audio')
      }
    } catch (error) {
      console.error('Error uploading audio:', error)
      const errorMsg = error instanceof Error ? error.message : 'Gagal memproses audio'
      toast.error(errorMsg)
      onError?.(errorMsg)
      onStatusChange?.("Siap merekam")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClick = () => {
    if (isProcessing) {
      return // Do nothing while processing
    }

    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="neomorphic-container">
      <input
        id="record-checkbox"
        type="checkbox"
        checked={isRecording}
        onChange={() => {}}
        className="neomorphic-input"
      />
      <label
        className={`neomorphic-button ${isRecording ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}
        htmlFor="record-checkbox"
        onClick={(e) => {
          e.preventDefault()
          handleClick()
        }}
      >
        <span className="neomorphic-icon">
          {isProcessing ? (
            <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin" />
          ) : isRecording ? (
            <Square className="h-12 w-12 md:h-16 md:w-16 fill-current" />
          ) : (
            <MicOff className="h-12 w-12 md:h-16 md:w-16" />
          )}
        </span>
      </label>
    </div>
  )
}
