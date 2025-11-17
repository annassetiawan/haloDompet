"use client"

import { useEffect, useRef, useState } from 'react'

/**
 * Hook to detect audio level from microphone stream
 * Returns normalized audio level (0-1)
 */
export function useAudioLevel(stream: MediaStream | null, isActive: boolean) {
  const [audioLevel, setAudioLevel] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!stream || !isActive) {
      // Clean up
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      setAudioLevel(0)
      return
    }

    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    const microphone = audioContext.createMediaStreamSource(stream)

    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8
    microphone.connect(analyser)

    audioContextRef.current = audioContext
    analyserRef.current = analyser

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    // Analyze audio level continuously
    const checkAudioLevel = () => {
      if (!analyserRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)

      // Calculate average volume
      const sum = dataArray.reduce((a, b) => a + b, 0)
      const average = sum / dataArray.length

      // Normalize to 0-1 range
      const normalized = Math.min(average / 128, 1)

      setAudioLevel(normalized)

      animationFrameRef.current = requestAnimationFrame(checkAudioLevel)
    }

    checkAudioLevel()

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [stream, isActive])

  return audioLevel
}
