"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/BottomNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, Sparkles, Loader2, TrendingUp, PiggyBank, Target, Lightbulb, X } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import { useAIAdvisor } from '@/hooks/useAIAdvisor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const SUGGESTED_QUESTIONS = [
  {
    icon: TrendingUp,
    question: "Pengeluaran bulan ini berapa? Bandingkan dengan bulan lalu",
    color: "text-blue-500"
  },
  {
    icon: PiggyBank,
    question: "Kategori apa yang paling boros 3 bulan terakhir?",
    color: "text-green-500"
  },
  {
    icon: Target,
    question: "Kasih saran cara ngurangin pengeluaran yang paling efektif",
    color: "text-purple-500"
  },
  {
    icon: Lightbulb,
    question: "Ada pola pengeluaran mencurigakan atau tidak biasa?",
    color: "text-amber-500"
  },
]

export default function AdvisorPage() {
  const [user, setUser] = useState<User | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    clearMessages,
  } = useAIAdvisor({
    onError: (err) => {
      console.error('AI Error:', err)
      toast.error(err, { duration: 6000 })
    },
  })

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
    }
    setIsLoadingUser(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage
    if (!textToSend.trim() || isLoading) return

    setInputMessage('')
    await sendMessage(textToSend)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question)
    handleSendMessage(question)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
          {messages.length === 0 && (
            <div className="flex justify-start animate-slide-up">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 mr-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-muted-foreground">Dompie</span>
                </div>
                <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    👋 Halo! Aku Dompie, asisten keuangan pribadimu. Aku siap membantu menganalisis pola pengeluaran dan memberikan saran untuk keuangan yang lebih sehat. Ada yang mau kamu tanyakan?
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
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
                    <span className="text-xs font-medium text-muted-foreground">Dompie</span>
                  </div>
                )}
                {message.role === 'assistant' ? (
                  <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1" />
                    )}
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                )}
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

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions - Show when no messages yet */}
        {messages.length === 0 && !isLoading && (
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
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tanyakan sesuatu tentang keuangan Anda..."
                className="flex-1"
                disabled={isLoading}
              />
              {isLoading ? (
                <Button
                  onClick={cancelRequest}
                  size="icon"
                  variant="destructive"
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim()}
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Hapus percakapan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </main>
  )
}
