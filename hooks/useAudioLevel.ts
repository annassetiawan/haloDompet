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
        animationFrameRef.current = null
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close()
        } catch (e) {
          console.warn('Failed to close AudioContext:', e)
        }
        audioContextRef.current = null
      }
      setAudioLevel(0)
      return
    }

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8

      // Connect microphone to analyser (read-only, doesn't modify stream)
      microphone.connect(analyser)

      // IMPORTANT: Don't connect analyser to destination (speakers)
      // This is read-only mode to prevent feedback

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
    } catch (error) {
      console.error('Error setting up audio level detection:', error)
      // Silently fail - audio level is nice-to-have, not critical
      setAudioLevel(0)
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close()
        } catch (e) {
          console.warn('Failed to close AudioContext in cleanup:', e)
        }
        audioContextRef.current = null
      }
      analyserRef.current = null
    }
  }, [stream, isActive])

  return audioLevel
}
