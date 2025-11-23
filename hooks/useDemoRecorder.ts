"use client"

import { useState, useRef, useCallback } from 'react'

export type DemoRecordingState = 'idle' | 'recording' | 'processing' | 'success' | 'error'

export interface DemoTransactionResult {
  item: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  location: string | null
  payment_method: string | null
  wallet_name: string | null
}

export function useDemoRecorder() {
  const [state, setState] = useState<DemoRecordingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DemoTransactionResult | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const startAudioLevelDetection = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      microphone.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const checkAudioLevel = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)
        const sum = dataArray.reduce((a, b) => a + b, 0)
        const average = sum / dataArray.length
        const normalized = Math.min(average / 128, 1)

        setAudioLevel(normalized)
        animationFrameRef.current = requestAnimationFrame(checkAudioLevel)
      }

      checkAudioLevel()
    } catch (err) {
      console.warn('Audio level detection failed:', err)
    }
  }, [])

  const stopAudioLevelDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current?.state !== 'closed') {
      try {
        audioContextRef.current?.close()
      } catch (e) {
        console.warn('Failed to close AudioContext:', e)
      }
      audioContextRef.current = null
    }
    analyserRef.current = null
    setAudioLevel(0)
  }, [])

  const processAudioWithSTT = async (audioBlob: Blob): Promise<string> => {
    // Get file extension
    const getFileExtension = (mimeType: string): string => {
      if (mimeType.includes('webm')) return 'webm'
      if (mimeType.includes('mp4')) return 'mp4'
      if (mimeType.includes('ogg')) return 'ogg'
      if (mimeType.includes('wav')) return 'wav'
      return 'webm'
    }

    const extension = getFileExtension(audioBlob.type)

    // Prepare form data
    const formData = new FormData()
    formData.append('audio', audioBlob, `recording.${extension}`)

    // Upload to STT API
    const response = await fetch('/api/stt', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Gagal memproses audio')
    }

    return data.text
  }

  const startRecording = useCallback(async () => {
    try {
      setState('recording')
      setError(null)
      setResult(null)

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Start audio level detection
      startAudioLevelDetection(stream)

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stopAudioLevelDetection()

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm'
        })

        // Stop stream
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null

        // Process audio
        setState('processing')

        try {
          // Convert audio to text using STT API
          const text = await processAudioWithSTT(audioBlob)

          // Send text to demo process API
          const response = await fetch('/api/demo/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Gagal memproses transaksi')
          }

          if (data.success && data.data) {
            setResult(data.data)
            setState('success')

            // Reset to idle after 3 seconds
            setTimeout(() => {
              setState('idle')
            }, 3000)
          } else {
            throw new Error('Invalid response format')
          }
        } catch (err: any) {
          console.error('Processing error:', err)
          setError(err.message || 'Terjadi kesalahan')
          setState('error')

          // Reset to idle after 3 seconds
          setTimeout(() => {
            setState('idle')
            setError(null)
          }, 3000)
        }
      }

      mediaRecorder.onerror = () => {
        stopAudioLevelDetection()
        setError('Terjadi kesalahan saat merekam')
        setState('error')
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      mediaRecorder.start(1000)

    } catch (err: any) {
      console.error('Start recording error:', err)
      stopAudioLevelDetection()

      let errorMsg = 'Gagal memulai rekaman'
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Izinkan akses mikrofon!'
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'Mikrofon tidak ditemukan'
      }

      setError(errorMsg)
      setState('error')

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setState('idle')
        setError(null)
      }, 3000)
    }
  }, [startAudioLevelDetection, stopAudioLevelDetection])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setError(null)
    setResult(null)
    setAudioLevel(0)
  }, [])

  return {
    state,
    error,
    result,
    audioLevel,
    startRecording,
    stopRecording,
    reset,
    isRecording: state === 'recording',
    isProcessing: state === 'processing',
  }
}
