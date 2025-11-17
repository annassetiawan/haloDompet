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

/**
 * Detect if device is iOS (iPhone/iPad)
 * Safe for SSR - returns false on server
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  // Check user agent
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(userAgent)

  // Also check for iOS using platform
  const isPlatformIOS = /iphone|ipad|ipod/.test(navigator.platform.toLowerCase())

  // Check for iOS 13+ on iPad (reports as "MacIntel")
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

  return isIOS || isPlatformIOS || isIPadOS
}

/**
 * Detect if browser is Safari
 * Safe for SSR - returns false on server
 */
export function isSafariBrowser(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)

  return isSafari
}
