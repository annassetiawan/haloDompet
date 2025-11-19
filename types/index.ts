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
  is_onboarded: boolean
}

export interface Wallet {
  id: string
  user_id: string
  name: string
  balance: number
  icon?: string
  color?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  item: string
  amount: number
  category: string
  date: string
  voice_text?: string
  location?: string | null
  payment_method?: string | null
  wallet_id?: string | null // Added for multi-wallet support
  type?: 'expense' | 'income' | 'adjustment' // Default: expense
  notes?: string | null // For adjustment notes
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
  location?: string | null
  payment_method?: string | null
}

export type TransactionMode = 'simple' | 'webhook'
