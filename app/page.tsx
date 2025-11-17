"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SaldoDisplay } from '@/components/SaldoDisplay';
import { TransactionCard } from '@/components/TransactionCard';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Settings, Loader2, LogOut, History, ArrowRight, BarChart3 } from 'lucide-react';
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
  const [tempWebhookUrl, setTempWebhookUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      // Load webhook URL from localStorage
      const savedUrl = localStorage.getItem('halodompet_webhook_url');
      if (savedUrl) {
        setWebhookUrl(savedUrl);
      }
    }
  };

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await fetch('/api/user');
      const data = await response.json();

      if (response.ok) {
        setUserProfile(data.user);
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

  // Save webhook URL to localStorage
  const saveWebhookUrl = () => {
    localStorage.setItem('halodompet_webhook_url', tempWebhookUrl);
    setWebhookUrl(tempWebhookUrl);
    setIsDialogOpen(false);
    setStatus("Webhook URL tersimpan!");
    setTimeout(() => setStatus("Siap merekam"), 2000);
  };

  // Web Speech API Handler
  const handleListen = async () => {
    // Cek apakah browser support Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setStatus("Browser tidak mendukung Web Speech API. Gunakan Chrome.");
      return;
    }

    // Cek apakah webhook URL sudah diset
    if (!webhookUrl) {
      setStatus("Atur webhook URL terlebih dahulu!");
      setIsDialogOpen(true);
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
        const processResponse = await fetch('/api/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: transcript,
            webhookUrl: webhookUrl, // For webhook mode
          }),
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
    <main className="relative min-h-screen flex flex-col p-4 md:p-24 bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10">
      {/* Decorative Background - Animated (hidden on mobile) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Header - Fade in from top */}
      <div className="relative z-10 w-full max-w-2xl mx-auto flex justify-between items-center animate-slide-down pt-2 md:pt-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-foreground">
            HaloDompet
          </h1>
          <p className="text-xs md:text-sm font-normal text-muted-foreground mt-0.5">
            {user?.email || 'Voice-powered expense tracker'}
          </p>
        </div>

        {/* Dialog Pengaturan */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTempWebhookUrl(webhookUrl)}
              className="relative overflow-hidden group border-2 hover:border-primary/50 transition-all duration-300"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Pengaturan Webhook</DialogTitle>
              <DialogDescription>
                Masukkan URL webhook n8n Anda untuk mengirim data pengeluaran.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="webhook-url"
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  value={tempWebhookUrl}
                  onChange={(e) => setTempWebhookUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveWebhookUrl}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>

      {/* Main Content - Tombol Rekam 3D - Scale in animation */ }
  <div className="relative z-10 flex-grow flex flex-col items-center justify-center gap-6 md:gap-8 animate-scale-in max-w-2xl mx-auto w-full py-8 md:py-0">
    {/* Glow effect ring */}
    <div className={`absolute w-32 h-32 md:w-40 md:h-40 rounded-full transition-all duration-500 ${isListening
      ? 'bg-red-500/20 dark:bg-red-500/30 blur-2xl animate-pulse'
      : isProcessing
        ? 'bg-blue-500/20 dark:bg-blue-500/30 blur-2xl animate-pulse'
        : 'hidden'
      }`} />

    <button
      onClick={handleListen}
      disabled={isListening || isProcessing}
      className={`
            relative h-32 w-32 md:h-40 md:w-40 rounded-full
            font-normal text-lg
            transition-all duration-300 ease-out
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isListening
          ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-[0_8px_30px_rgb(239,68,68,0.5)] hover:shadow-[0_12px_40px_rgb(239,68,68,0.6)]'
          : isProcessing
            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-[0_8px_30px_rgb(59,130,246,0.5)]'
            : 'bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.4)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.1)] dark:hover:shadow-[0_12px_40px_rgb(255,255,255,0.15)] md:animate-button-bounce'
        }
            hover:scale-105 active:scale-95 hover:animate-none
            before:content-[''] before:absolute before:inset-0 before:rounded-full
            before:bg-gradient-to-br before:from-white/20 before:to-transparent
            before:opacity-0 hover:before:opacity-100 before:transition-opacity
            after:content-[''] after:absolute after:inset-[2px] after:rounded-full
            after:bg-gradient-to-br after:from-transparent after:via-transparent after:to-black/10
            group
          `}
    >
      {/* Inner shadow untuk efek depth */}
      <div className="absolute inset-[3px] rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Icon container */}
      <div className="relative z-10 flex items-center justify-center h-full w-full text-white">
        {isListening ? (
          <Mic className="h-12 w-12 md:h-16 md:w-16 animate-pulse drop-shadow-lg" />
        ) : isProcessing ? (
          <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin drop-shadow-lg" />
        ) : (
          <MicOff className="h-12 w-12 md:h-16 md:w-16 drop-shadow-lg group-hover:scale-110 transition-transform" />
        )}
      </div>

      {/* Bottom shadow untuk efek 3D */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 md:w-32 md:h-4 bg-black/20 rounded-full blur-md" />
    </button>
    {/* Main Content Container */}
    <div className="relative z-10 flex-grow max-w-2xl mx-auto w-full space-y-6 py-6 md:py-12">
      {/* Balance Display */}
      <div className="animate-slide-down">
        <SaldoDisplay
          currentBalance={userProfile?.current_balance || 0}
          initialBalance={userProfile?.initial_balance}
          isLoading={isLoadingProfile}
        />
      </div>

      {/* Voice Recording Button */}
      <div className="flex flex-col items-center gap-6 md:gap-8 animate-scale-in">
        <div className="neomorphic-container">
          <input
            id="record-checkbox"
            type="checkbox"
            checked={isListening}
            onChange={() => { }}
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
        <div className="text-center space-y-2 md:space-y-3 max-w-md px-2">
          <div className="px-4 py-2 md:px-6 md:py-3 rounded-2xl bg-card/50 dark:bg-card/80 backdrop-blur-sm shadow-lg">
            <p className="text-sm md:text-lg font-normal text-foreground">
              {status}
            </p>
          </div>

          {!webhookUrl && (
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 dark:border-amber-500/30 rounded-xl px-3 py-1.5 md:px-4 md:py-2">
              <Settings className="h-3 w-3 md:h-3.5 md:w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="text-left">Klik ikon pengaturan untuk setup webhook URL</span>
            </div>
          )}
        </div>

        {/* Footer - Fade in from bottom */}
        <div className="relative z-10 text-center space-y-1.5 md:space-y-2 animate-slide-up px-2 pb-4 md:pb-0 max-w-2xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-muted/30 dark:bg-muted/50 backdrop-blur-sm border border-border/30 dark:border-border/50">
            <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-ping" />
            <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 absolute left-[14px] md:left-[18px]" />
            <p className="text-xs md:text-sm font-normal text-muted-foreground dark:text-muted-foreground/90">Tekan tombol dan ucapkan pengeluaran Anda</p>
          </div>
          <p className="text-[10px] md:text-xs font-normal text-muted-foreground/70 dark:text-muted-foreground/60">
            Contoh: &quot;Beli kopi 25000&quot; atau &quot;Makan siang 50000&quot;
          </p>
        </div>
      </main>
      );
}
