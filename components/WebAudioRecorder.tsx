"use client"

import { useState, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface WebAudioRecorderProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  onStatusChange?: (status: string) => void
  onAudioLevelChange?: (level: number) => void
}

export function WebAudioRecorder({
  onTranscript,
  onError,
  onStatusChange,
  onAudioLevelChange
}: WebAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioChunksRef = useRef<Float32Array[]>([])
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Convert Float32Array to WAV format
  const exportWAV = (audioData: Float32Array[], sampleRate: number): Blob => {
    // Calculate total length
    const totalLength = audioData.reduce((acc, chunk) => acc + chunk.length, 0)

    // Interleave channels (mono in this case)
    const interleaved = new Float32Array(totalLength)
    let offset = 0
    for (const chunk of audioData) {
      interleaved.set(chunk, offset)
      offset += chunk.length
    }

    // Convert to 16-bit PCM
    const buffer = new ArrayBuffer(44 + interleaved.length * 2)
    const view = new DataView(buffer)

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + interleaved.length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // Subchunk1Size
    view.setUint16(20, 1, true) // AudioFormat (PCM)
    view.setUint16(22, 1, true) // NumChannels (Mono)
    view.setUint32(24, sampleRate, true) // SampleRate
    view.setUint32(28, sampleRate * 2, true) // ByteRate
    view.setUint16(32, 2, true) // BlockAlign
    view.setUint16(34, 16, true) // BitsPerSample
    writeString(36, 'data')
    view.setUint32(40, interleaved.length * 2, true)

    // Write PCM samples
    let pcmOffset = 44
    for (let i = 0; i < interleaved.length; i++) {
      const s = Math.max(-1, Math.min(1, interleaved[i]))
      view.setInt16(pcmOffset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
      pcmOffset += 2
    }

    return new Blob([buffer], { type: 'audio/wav' })
  }

  // Monitor audio level
  const monitorAudioLevel = () => {
    if (!analyserRef.current || !isRecording) return

    const analyser = analyserRef.current
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const checkLevel = () => {
      if (!isRecording) return

      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      const level = average / 255 // Normalize to 0-1

      onAudioLevelChange?.(level)
      animationFrameRef.current = requestAnimationFrame(checkLevel)
    }

    checkLevel()
  }

  const startRecording = async () => {
    try {
      console.log('🎤 Starting Web Audio API recording...')
      onStatusChange?.("Memulai rekaman...")

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      mediaStreamRef.current = stream
      console.log('✅ Microphone access granted')

      // Create AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext
      console.log('AudioContext sample rate:', audioContext.sampleRate)

      // Create audio nodes
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser

      // Create ScriptProcessor for recording
      const bufferSize = 4096
      const scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1)
      scriptProcessorRef.current = scriptProcessor

      // Reset audio chunks
      audioChunksRef.current = []

      // Process audio data
      scriptProcessor.onaudioprocess = (event) => {
        if (!isRecording) return

        const inputData = event.inputBuffer.getChannelData(0)
        const chunk = new Float32Array(inputData)
        audioChunksRef.current.push(chunk)

        console.log('Captured chunk:', chunk.length, 'samples')
      }

      // Connect nodes: source -> analyser -> scriptProcessor -> destination
      source.connect(analyser)
      analyser.connect(scriptProcessor)
      scriptProcessor.connect(audioContext.destination)

      console.log('✅ Audio pipeline connected')

      setIsRecording(true)
      onStatusChange?.("Merekam... (Klik lagi untuk berhenti)")

      // Start monitoring audio level
      monitorAudioLevel()

      // Auto-stop after 10 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (isRecording) {
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

  const stopRecording = async () => {
    console.log('⏹️ Stopping recording...')
    setIsRecording(false)
    setIsProcessing(true)
    onStatusChange?.("Memproses audio...")

    // Clear timeout
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
    }

    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Stop audio nodes
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect()
      scriptProcessorRef.current = null
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    // Close audio context
    const audioContext = audioContextRef.current
    if (audioContext) {
      const sampleRate = audioContext.sampleRate

      try {
        await audioContext.close()
      } catch (err) {
        console.warn('Error closing AudioContext:', err)
      }

      audioContextRef.current = null

      // Process recorded audio
      if (audioChunksRef.current.length > 0) {
        console.log('Processing', audioChunksRef.current.length, 'chunks')
        const audioBlob = exportWAV(audioChunksRef.current, sampleRate)
        console.log('WAV blob created:', audioBlob.size, 'bytes')

        await uploadAndTranscribe(audioBlob)
      } else {
        console.warn('No audio data recorded')
        toast.info('Tidak ada suara terdeteksi. Coba lagi!')
        onStatusChange?.("Siap merekam")
        setIsProcessing(false)
      }
    }
  }

  const uploadAndTranscribe = async (audioBlob: Blob) => {
    try {
      console.log('Uploading audio for transcription...')

      if (audioBlob.size === 0) {
        throw new Error('Rekaman kosong. Silakan coba lagi.')
      }

      if (audioBlob.size > 10 * 1024 * 1024) {
        throw new Error('Rekaman terlalu besar (max 10MB)')
      }

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

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
    if (isProcessing) return

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
            <Mic className="h-12 w-12 md:h-16 md:w-16" />
          )}
        </span>
      </label>
    </div>
  )
}
