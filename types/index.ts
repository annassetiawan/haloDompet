export interface User {
  id: string
  email: string
  created_at: string
  initial_balance: number
  current_balance: number
  mode: 'simple' | 'webhook'
  webhook_url?: string
}

export interface Transaction {
  id: string
  user_id: string
  item: string
  amount: number
  category: string
  date: string
  voice_text?: string
  created_at: string
}

export interface VoiceTranscript {
  text: string
}

export interface ExtractedTransaction {
  item: string
  amount: number
  category: string
  date: string
}

export type TransactionMode = 'simple' | 'webhook'
