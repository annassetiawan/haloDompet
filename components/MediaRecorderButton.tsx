"use client"

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2, Square } from 'lucide-react'
import { toast } from 'sonner'
import { useAudioLevel } from '@/hooks/useAudioLevel'

interface MediaRecorderButtonProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  onStatusChange?: (status: string) => void
  onAudioLevelChange?: (level: number) => void
}

export function MediaRecorderButton({
  onTranscript,
  onError,
  onStatusChange,
  onAudioLevelChange
}: MediaRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mimeTypeRef = useRef<string>('audio/webm')

  // Track audio level
  const audioLevel = useAudioLevel(stream, isRecording)

  // Pass audio level to parent
  useEffect(() => {
    onAudioLevelChange?.(audioLevel)
  }, [audioLevel, onAudioLevelChange])

  // Check if MediaRecorder is supported
  const isMediaRecorderSupported = () => {
    if (typeof window === 'undefined') return false
    return typeof MediaRecorder !== 'undefined' &&
           typeof navigator !== 'undefined' &&
           navigator.mediaDevices &&
           navigator.mediaDevices.getUserMedia
  }

  // Detect best supported audio format for browser
  const getSupportedMimeType = (): string => {
    console.log('🔍 Detecting MIME type...')

    if (!isMediaRecorderSupported()) {
      console.error('MediaRecorder not supported')
      return ''
    }

    // Check if isTypeSupported exists
    if (typeof MediaRecorder.isTypeSupported !== 'function') {
      console.warn('MediaRecorder.isTypeSupported not available, using default')
      return 'audio/mp4' // Safari iOS default
    }

    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ]

    console.log('Testing formats:', types)

    for (const type of types) {
      console.log(`Testing: ${type}`)
      try {
        const isSupported = MediaRecorder.isTypeSupported(type)
        console.log(`${type}: ${isSupported ? 'YES' : 'NO'}`)

        if (isSupported) {
          console.log('Using MIME type:', type)
          return type
        }
      } catch (error) {
        console.error(`Error testing ${type}:`, error)
      }
    }

    // Fallback to default
    console.warn('No supported MIME type found, using mp4 fallback')
    return 'audio/mp4' // Safari fallback
  }

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording...')

      // Check MediaRecorder support first
      if (!isMediaRecorderSupported()) {
        const errorMsg = 'Browser Anda tidak mendukung perekaman audio. Update iOS ke versi 14.5 atau lebih baru, atau gunakan Chrome.'
        toast.error(errorMsg)
        onError?.(errorMsg)
        return
      }

      // Request microphone permission with simplified constraints for iOS
      console.log('📱 Requesting microphone permission...')

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true  // Simplified for iOS compatibility
      })

      console.log('✅ Microphone permission granted')

      // Store stream for audio level detection
      setStream(mediaStream)

      // SIMPLIFIED: Skip format detection for Safari iOS, just use default
      console.log('🔍 Creating MediaRecorder with default settings...')

      const mimeType = '' // Let browser choose best format
      mimeTypeRef.current = 'audio/mp4' // Assume mp4 for iOS

      // Create MediaRecorder WITHOUT mimeType option (Safari iOS workaround)
      console.log('Creating MediaRecorder without format specification...')

      let mediaRecorder: MediaRecorder
      try {
        // Try without options first (most compatible)
        mediaRecorder = new MediaRecorder(mediaStream)
        console.log('MediaRecorder created with default, state:', mediaRecorder.state)

        // Get actual MIME type from recorder
        if (mediaRecorder.mimeType) {
          mimeTypeRef.current = mediaRecorder.mimeType
          console.log('Recorder MIME type:', mediaRecorder.mimeType)
        }
      } catch (constructorError: any) {
        console.error('Error creating MediaRecorder:', constructorError)
        mediaStream.getTracks().forEach(track => track.stop())
        setStream(null)
        throw constructorError
      }

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        console.log('📦 Data available:', event.data.size, 'bytes')
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log('Total chunks:', audioChunksRef.current.length)
        } else {
          console.warn('Empty data chunk received!')
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        console.log('⏹️ Recording stopped')

        // Use the detected MIME type for blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeTypeRef.current || 'audio/webm'
        })

        console.log('📦 Audio blob created:', audioBlob.size, 'bytes')

        // Stop all tracks to release microphone
        mediaStream.getTracks().forEach(track => track.stop())
        setStream(null)

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
      onStatusChange?.(`Error: ${errorMsg}`)

        // Stop all tracks
        mediaStream.getTracks().forEach(track => track.stop())
        setStream(null)
      }

      // Start recording with timeslice (Safari iOS requires this)
      console.log('▶️ Starting MediaRecorder with timeslice...')
      mediaRecorder.start(1000) // Emit data every 1 second (Safari iOS compatibility)
      console.log('✅ MediaRecorder started, state:', mediaRecorder.state)

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
      let errorDetail = error.message || error.name || 'Unknown error'

      if (error.name === 'NotAllowedError') {
        errorMsg = 'Izinkan akses mikrofon di browser!'
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'Mikrofon tidak ditemukan'
      } else if (error.name === 'NotReadableError') {
        errorMsg = 'Mikrofon sedang digunakan aplikasi lain'
      }

      toast.error(errorMsg)
      onError?.(errorMsg)
      onStatusChange?.(`Error: ${errorMsg}`)
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
      onStatusChange?.(`Error: ${errorMsg}`)
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
