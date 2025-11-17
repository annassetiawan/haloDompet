export interface User {
  id: string
  email: string
  created_at: string
  initial_balance: number
  current_balance: number
  mode: 'simple' | 'webhook'
  webhook_url?: string
  account_status: 'trial' | 'active' | 'expired' | 'blocked'
  trial_ends_at: string | null
  trial_started_at: string | null
  invited_by: string | null
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
