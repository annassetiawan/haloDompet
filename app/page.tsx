"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SaldoDisplay } from '@/components/SaldoDisplay';
import { TransactionCard } from '@/components/TransactionCard';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Settings, Loader2, LogOut, History, ArrowRight, BarChart3, Menu } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { User as UserProfile, Transaction } from '@/types';

export default function HomePage() {
  // State Management
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Siap merekam");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Check authentication on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
      loadUserProfile();
      loadRecentTransactions();
    }
  };

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await fetch('/api/user');
      const data = await response.json();

      if (response.ok) {
        setUserProfile(data.user);
        // Load webhook URL jika mode webhook
        if (data.user.mode === 'webhook' && data.user.webhook_url) {
          setWebhookUrl(data.user.webhook_url);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const response = await fetch('/api/transaction?limit=5');
      const data = await response.json();

      if (response.ok) {
        setRecentTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Web Speech API Handler
  const handleListen = async () => {
    // Cek apakah browser support Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setStatus("Browser tidak mendukung Web Speech API. Gunakan Chrome.");
      return;
    }

    // Cek apakah webhook URL sudah diset (hanya untuk mode webhook)
    if (userProfile?.mode === 'webhook' && !webhookUrl) {
      setStatus("Atur webhook URL di halaman Settings!");
      router.push('/settings');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'id-ID'; // Bahasa Indonesia
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Mendengarkan... (Ucapkan pengeluaran Anda)");
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setStatus(`Mendengar: "${transcript}"`);
      setIsListening(false);
      setIsProcessing(true);

      try {
        // Step 1: Extract JSON from voice using Gemini
        const processPayload: { text: string; webhookUrl?: string } = {
          text: transcript,
        };

        // Only include webhookUrl for webhook mode
        if (userProfile?.mode === 'webhook' && webhookUrl) {
          processPayload.webhookUrl = webhookUrl;
        }

        const processResponse = await fetch('/api/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(processPayload),
        });

        const processData = await processResponse.json();

        if (!processResponse.ok) {
          throw new Error(processData.error || 'Gagal memproses suara');
        }

        // Step 2: Save to database
        const transactionResponse = await fetch('/api/transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item: processData.data.item,
            amount: processData.data.amount,
            category: processData.data.category,
            date: processData.data.date,
            voice_text: transcript,
          }),
        });

        const transactionData = await transactionResponse.json();

        if (!transactionResponse.ok) {
          throw new Error(transactionData.error || 'Gagal menyimpan transaksi');
        }

        // Reload profile and transactions after successful save
        loadUserProfile();
        loadRecentTransactions();

        setStatus(`Berhasil! ${processData.data.item} - Rp ${processData.data.amount.toLocaleString('id-ID')} 🎉`);
        setTimeout(() => setStatus("Siap merekam"), 3000);
      } catch (error) {
        console.error('Error:', error);
        setStatus(`Error: ${error instanceof Error ? error.message : 'Gagal memproses'}`);
        setTimeout(() => setStatus("Siap merekam"), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setIsProcessing(false);

      if (event.error === 'no-speech') {
        setStatus("Tidak mendengar suara. Coba lagi!");
      } else if (event.error === 'not-allowed') {
        setStatus("Izinkan akses mikrofon di browser!");
      } else {
        setStatus(`Error: ${event.error}`);
      }

      setTimeout(() => setStatus("Siap merekam"), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Mulai mendengarkan
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Fixed */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Menu items */}
            <div className="flex items-center gap-1">
              <Link href="/history">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <History className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Right side - Dark mode & Logout */}
            <div className="flex items-center gap-1">
              <DarkModeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Header Section */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              HaloDompet
            </h1>
            <p className="text-sm text-muted-foreground">
              {user?.email || 'Voice-powered expense tracker'}
            </p>
          </div>

          {/* Balance Card */}
          <SaldoDisplay
            currentBalance={userProfile?.current_balance || 0}
            initialBalance={userProfile?.initial_balance}
            isLoading={isLoadingProfile}
          />

          {/* Voice Recording Section */}
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="neomorphic-container">
              <input
                id="record-checkbox"
                type="checkbox"
                checked={isListening}
                onChange={() => {}}
                className="neomorphic-input"
              />
              <label
                className={`neomorphic-button ${isListening ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}
                htmlFor="record-checkbox"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isListening && !isProcessing) {
                    handleListen();
                  }
                }}
              >
                <span className="neomorphic-icon">
                  {isListening ? (
                    <Mic className="h-12 w-12 md:h-16 md:w-16" />
                  ) : isProcessing ? (
                    <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin" />
                  ) : (
                    <MicOff className="h-12 w-12 md:h-16 md:w-16" />
                  )}
                </span>
              </label>
            </div>

            {/* Status Card */}
            <div className="w-full max-w-md space-y-3">
              <div className="px-6 py-3 rounded-2xl bg-card border border-border shadow-sm">
                <p className="text-sm text-center font-medium text-foreground">
                  {status}
                </p>
              </div>

              {userProfile?.mode === 'webhook' && !webhookUrl && (
                <Link href="/settings">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 rounded-xl px-4 py-2 cursor-pointer hover:bg-amber-500/20 transition-colors">
                    <Settings className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Klik untuk setup webhook URL di Settings</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Instruction */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-medium text-muted-foreground">
                  Tekan tombol dan ucapkan pengeluaran Anda
                </p>
              </div>
              <p className="text-xs text-muted-foreground/70">
                Contoh: &quot;Beli kopi 25000&quot; atau &quot;Makan siang 50000&quot;
              </p>
            </div>
          </div>

          {/* Recent Transactions */}
          {recentTransactions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Transaksi Terakhir
                </h2>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="gap-1 h-8">
                    Lihat Semua
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => router.push('/history')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {recentTransactions.length === 0 && !isLoadingProfile && (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  Belum ada transaksi
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mulai rekam pengeluaran Anda dengan menekan tombol di atas
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
