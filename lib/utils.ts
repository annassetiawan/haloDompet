import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Detect if browser supports Web Speech API (Speech Recognition)
 * Returns true for Chrome/Edge (Desktop & Android)
 * Returns false for Safari iOS, Firefox, and other browsers
 * Safe for SSR - returns false on server
 */
export function isSpeechRecognitionSupported(): boolean {
  // Check if running on server (Next.js SSR)
  if (typeof window === 'undefined') {
    return false
  }

  // Check for Web Speech API support
  const hasSpeechRecognition =
    'SpeechRecognition' in window ||
    'webkitSpeechRecognition' in window

  return hasSpeechRecognition
}
