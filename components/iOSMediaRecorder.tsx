"use client"

import { useState, useRef } from 'react'
import { Mic, MicOff, Loader2, Square } from 'lucide-react'
import { toast } from 'sonner'
import RecordRTC from 'recordrtc'

interface iOSMediaRecorderProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  onStatusChange?: (status: string) => void
}

/**
 * iOS-optimized audio recorder using RecordRTC
 * Handles Safari iOS MediaRecorder limitations
 */
export function iOSMediaRecorder({
  onTranscript,
  onError,
  onStatusChange
}: iOSMediaRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const recorderRef = useRef<RecordRTC | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      console.log('🎤 [iOS] Starting recording with RecordRTC...')
      onStatusChange?.("Meminta izin mikrofon...")

      // Request microphone with iOS-optimized constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })

      console.log('✅ [iOS] Microphone permission granted')
      streamRef.current = stream

      // Create RecordRTC instance with iOS-optimized settings
      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav', // WAV is most compatible with iOS
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1, // Mono for smaller file size
        desiredSampRate: 16000, // 16kHz is enough for voice
        timeSlice: 1000, // Emit data every second
        ondataavailable: (blob: Blob) => {
          console.log('📦 [iOS] Data chunk:', blob.size, 'bytes')
        },
      })

      recorderRef.current = recorder

      // Start recording
      recorder.startRecording()
      console.log('✅ [iOS] RecordRTC recording started')

      setIsRecording(true)
      onStatusChange?.("Merekam... (Klik lagi untuk berhenti)")
      toast.info('🎤 Merekam... Bicara sekarang!')

      // Auto-stop after 10 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (recorderRef.current) {
          stopRecording()
          toast.info('Rekaman otomatis berhenti setelah 10 detik')
        }
      }, 10000)

    } catch (error: any) {
      console.error('[iOS] Error starting recording:', error)

      let errorMsg = 'Gagal memulai rekaman'

      if (error.name === 'NotAllowedError') {
        errorMsg = 'Izinkan akses mikrofon di Settings Safari!'
        toast.error(errorMsg, { duration: 5000 })
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'Mikrofon tidak ditemukan'
        toast.error(errorMsg)
      } else if (error.name === 'NotReadableError') {
        errorMsg = 'Mikrofon sedang digunakan aplikasi lain'
        toast.error(errorMsg)
      } else {
        toast.error(errorMsg + ': ' + error.message)
      }

      onError?.(errorMsg)
      onStatusChange?.("Siap merekam")
    }
  }

  const stopRecording = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
    }

    if (!recorderRef.current) return

    console.log('⏹️ [iOS] Stopping recording...')
    setIsRecording(false)
    setIsProcessing(true)
    onStatusChange?.("Memproses audio...")

    recorderRef.current.stopRecording(() => {
      console.log('✅ [iOS] Recording stopped')

      if (recorderRef.current) {
        const blob = recorderRef.current.getBlob()
        console.log('📦 [iOS] Final audio blob:', blob.size, 'bytes, type:', blob.type)

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }

        recorderRef.current.destroy()
        recorderRef.current = null

        // Upload and transcribe
        uploadAndTranscribe(blob)
      }
    })
  }

  const uploadAndTranscribe = async (audioBlob: Blob) => {
    try {
      console.log('📤 [iOS] Uploading audio:', {
        size: audioBlob.size,
        type: audioBlob.type,
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
      formData.append('audio', audioBlob, 'recording.wav')

      // Upload to STT API
      onStatusChange?.("Mengirim ke server...")
      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      console.log('✅ [iOS] STT API response:', data)

      if (response.ok && data.success) {
        const transcript = data.text
        toast.success(`Terdeteksi: "${transcript}"`)
        onStatusChange?.(`Terdeteksi: "${transcript}"`)
        onTranscript(transcript)

        // Reset status after 2 seconds
        setTimeout(() => {
          onStatusChange?.("Siap merekam")
        }, 2000)
      } else {
        throw new Error(data.details || data.error || 'Gagal memproses audio')
      }
    } catch (error) {
      console.error('[iOS] Error uploading audio:', error)
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
        id="record-checkbox-ios"
        type="checkbox"
        checked={isRecording}
        onChange={() => {}}
        className="neomorphic-input"
      />
      <label
        className={`neomorphic-button ${isRecording ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}
        htmlFor="record-checkbox-ios"
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
