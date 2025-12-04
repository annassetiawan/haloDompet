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

export interface Category {
  id: string
  user_id: string | null // NULL means global default category
  name: string
  type: 'income' | 'expense'
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category: string
  limit_amount: number
  created_at: string
  updated_at: string
}

export interface BudgetSummary {
  category: string
  limit_amount: number
  spent_amount: number
  percentage_used: number
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

// Landing Page Types
export interface NavLinkProps {
  href: string
  children: React.ReactNode
}

export interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  className?: string
}

// types/index.ts (Saran penambahan)

export interface AIProcessResult {
  transaction: ExtractedTransaction
  sentiment:
    | 'proud'
    | 'concerned'
    | 'shocked'
    | 'disappointed'
    | 'excited'
    | 'celebrating'
    | 'motivated'
  message: string
}
