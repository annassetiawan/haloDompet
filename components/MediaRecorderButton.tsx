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
  const mimeTypeRef = useRef<string>('audio/webm')

  // Detect best supported audio format for browser
  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Using MIME type:', type)
        return type
      }
    }

    // Fallback to default
    console.warn('No supported MIME type found, using default')
    return ''
  }

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })

      // Get supported MIME type
      const mimeType = getSupportedMimeType()
      mimeTypeRef.current = mimeType

      // Create MediaRecorder instance with supported format
      const options = mimeType ? { mimeType } : {}
      const mediaRecorder = new MediaRecorder(stream, options)

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
        // Use the detected MIME type for blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeTypeRef.current || 'audio/webm'
        })

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
      // Get file extension based on MIME type
      const getFileExtension = (mimeType: string): string => {
        if (mimeType.includes('webm')) return 'webm'
        if (mimeType.includes('mp4')) return 'mp4'
        if (mimeType.includes('ogg')) return 'ogg'
        if (mimeType.includes('wav')) return 'wav'
        return 'webm' // fallback
      }

      const extension = getFileExtension(mimeTypeRef.current)

      // Debug logging
      console.log('Audio blob info:', {
        size: audioBlob.size,
        type: audioBlob.type,
        mimeType: mimeTypeRef.current,
        extension: extension
      })

      // Validate blob
      if (audioBlob.size === 0) {
        throw new Error('Rekaman kosong. Silakan coba lagi.')
      }

      if (audioBlob.size > 10 * 1024 * 1024) {
        throw new Error('Rekaman terlalu besar (max 10MB)')
      }

      // Prepare form data
      const formData = new FormData()
      formData.append('audio', audioBlob, `recording.${extension}`)

      // Upload to STT API
      console.log('Uploading to /api/stt...')
      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      console.log('STT API response:', data)

      if (response.ok && data.success) {
        const transcript = data.text
        onStatusChange?.(`Terdeteksi: "${transcript}"`)
        onTranscript(transcript)
        onStatusChange?.("Siap merekam")
      } else {
        throw new Error(data.details || data.error || 'Gagal memproses audio')
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
