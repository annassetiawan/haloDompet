import { useState, useCallback, useRef } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface UseAIAdvisorOptions {
  onError?: (error: string) => void
  onStreamStart?: () => void
  onStreamEnd?: () => void
}

interface AIContext {
  totalTransactions: number
  totalSpent: number
  topCategory?: string
}

export function useAIAdvisor(options: UseAIAdvisorOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [context, setContext] = useState<AIContext | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    // Clear previous error
    setError(null)

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    const assistantMessageId = `assistant-${Date.now()}`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setIsLoading(true)
    options.onStreamStart?.()

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      // Build conversation history (exclude the new messages)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          conversationHistory,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Request failed')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()

            if (data === '[DONE]') {
              // Stream complete
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              )
              continue
            }

            try {
              const parsed = JSON.parse(data)

              if (parsed.error) {
                throw new Error(parsed.error)
              }

              if (parsed.text) {
                accumulatedContent += parsed.text

                // Update message content progressively
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                )
              }

              if (parsed.context) {
                setContext(parsed.context)
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete chunks
              console.debug('Parse error (might be partial chunk):', parseError)
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, remove the empty assistant message
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
        return
      }

      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
      options.onError?.(errorMessage)

      // Update assistant message with error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `⚠️ ${errorMessage}`,
                isStreaming: false,
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
      options.onStreamEnd?.()
    }
  }, [messages, isLoading, options])

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    setContext(null)
  }, [])

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMessage) {
      // Remove last assistant message if it was an error
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1]
        if (lastMsg?.role === 'assistant' && lastMsg.content.startsWith('⚠️')) {
          return prev.slice(0, -1)
        }
        return prev
      })
      sendMessage(lastUserMessage.content)
    }
  }, [messages, sendMessage])

  return {
    messages,
    isLoading,
    error,
    context,
    sendMessage,
    cancelRequest,
    clearMessages,
    retryLastMessage,
  }
}
