"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/BottomNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, Sparkles, Loader2, TrendingUp, PiggyBank, Target, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  {
    icon: TrendingUp,
    question: "Bagaimana pola pengeluaran saya bulan ini?",
    color: "text-blue-500"
  },
  {
    icon: PiggyBank,
    question: "Di kategori mana saya paling boros?",
    color: "text-green-500"
  },
  {
    icon: Target,
    question: "Berikan tips untuk menghemat pengeluaran",
    color: "text-purple-500"
  },
  {
    icon: Lightbulb,
    question: "Ada anomali dalam pengeluaran saya?",
    color: "text-amber-500"
  },
]

export default function AdvisorPage() {
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: '👋 Halo! Saya HaloDompet AI, asisten keuangan pribadi Anda. Saya siap membantu menganalisis pola pengeluaran dan memberikan saran untuk keuangan yang lebih sehat. Ada yang ingin Anda tanyakan?',
        timestamp: new Date(),
      }])
    }
    setIsLoadingUser(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage
    if (!textToSend.trim() || isLoading) return

    // Add user message to UI
    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Send to API
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Add AI response to UI
        const aiMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        // Show detailed error message from API
        const errorMessage = data.details || data.error || 'Gagal mengirim pesan'
        console.error('API Error:', data)
        toast.error(errorMessage, {
          duration: 6000, // Show longer for detailed messages
        })
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Only show generic error if we haven't shown a specific one
      if (error instanceof Error && !error.message.includes('Failed to get response')) {
        toast.error('Gagal mengirim pesan. Silakan coba lagi.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question)
    sendMessage(question)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="relative min-h-screen flex flex-col pb-20 md:pb-0 bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-screen md:h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm animate-slide-down">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h1 className="text-lg font-normal text-foreground">
                AI Financial Advisor
              </h1>
              <p className="text-xs text-muted-foreground">
                Powered by Gemini AI
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 mr-4'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-medium text-muted-foreground">HaloDompet AI</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-slide-up">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                  <span className="text-sm text-muted-foreground">AI sedang berpikir...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions - Show when no messages yet */}
        {messages.length <= 1 && !isLoading && (
          <div className="p-4 space-y-2 border-t border-border/50 bg-background/80 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground mb-3">Pertanyaan yang sering ditanyakan:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((item, index) => {
                const Icon = item.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleSuggestedQuestion(item.question)}
                    className="h-auto py-3 px-4 justify-start text-left"
                  >
                    <Icon className={`h-4 w-4 mr-2 flex-shrink-0 ${item.color}`} />
                    <span className="text-xs">{item.question}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tanyakan sesuatu tentang keuangan Anda..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </main>
  )
}
