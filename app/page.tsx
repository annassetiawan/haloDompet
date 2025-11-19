"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { WalletCarousel } from '@/components/WalletCarousel';
import { WalletSelector } from '@/components/WalletSelector';
import { AddWalletDialog } from '@/components/AddWalletDialog';
import { EditWalletDialog } from '@/components/EditWalletDialog';
import { ManualTransactionDialog } from '@/components/ManualTransactionDialog';
import { TransactionCard } from '@/components/TransactionCard';
import { TrialWarningBanner } from '@/components/trial-warning-banner';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { TransactionListSkeleton } from '@/components/TransactionSkeleton';
import { RecordButton } from '@/components/RecordButton';
import { BottomNav } from '@/components/BottomNav';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Settings, Loader2, LogOut, History, ArrowRight, BarChart3, Menu, Sparkles, CheckCircle2, XCircle, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';
import type { User as UserProfile, Transaction, Wallet } from '@/types';
import { isTrialExpired } from '@/lib/trial';

export default function HomePage() {
  // State Management
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState("Siap merekam");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);

  // Review dialog state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState("");

  // Wallet management state
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isEditWalletOpen, setIsEditWalletOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  // Manual transaction dialog state
  const [isManualTransactionOpen, setIsManualTransactionOpen] = useState(false);

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
      loadWallets();
      loadRecentTransactions();
    }
  };

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await fetch('/api/user');
      const data = await response.json();

      if (response.ok) {
        // Check if user hasn't completed onboarding
        // Use is_onboarded flag instead of checking balance
        // This prevents users from being redirected to onboarding after resetting their data
        if (!data.user.is_onboarded) {
          router.push("/onboarding");
          return;
        }

        // Check if trial has expired
        if (isTrialExpired(data.user)) {
          router.push("/trial-expired");
          return;
        }
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

  const loadWallets = async () => {
    try {
      setIsLoadingWallets(true);
      const response = await fetch('/api/wallet');
      const data = await response.json();

      if (response.ok) {
        setWallets(data.wallets);
        setTotalBalance(data.totalBalance);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setIsLoadingWallets(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const response = await fetch('/api/transaction?limit=5');
      const data = await response.json();

      if (response.ok) {
        setRecentTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Handle transcript from recorder
  const handleTranscript = async (transcript: string) => {
    // Show processing state briefly
    setIsProcessing(true);
    setStatus("Memproses hasil rekaman...");

    // Small delay to show processing state
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsProcessing(false);

    // Open review dialog with transcript
    setEditedTranscript(transcript);
    setIsReviewOpen(true);
    setStatus("Siap merekam");
  };

  // Handle status change from recorder
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  // Handle confirm from review dialog
  const handleConfirmTranscript = async () => {
    setIsReviewOpen(false);
    await processTranscript(editedTranscript, selectedWalletId);
  };

  // Handle cancel from review dialog
  const handleCancelTranscript = () => {
    setIsReviewOpen(false);
    setEditedTranscript("");
    setSelectedWalletId(null);
    setStatus("Siap merekam");
  };

  // Handle wallet management
  const handleAddWallet = () => {
    setIsAddWalletOpen(true);
  };

  const handleEditWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsEditWalletOpen(true);
  };

  const handleWalletSuccess = () => {
    loadWallets();
  };

  // Process transcript (called after user confirms in dialog)
  const processTranscript = async (transcript: string, walletId: string | null = null) => {
    setIsProcessing(true);
    setStatus(`Memproses: "${transcript}"`);

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
          location: processData.data.location || null,
          payment_method: processData.data.payment_method || null,
          wallet_id: walletId, // Use selected wallet or default
        }),
      });

      const transactionData = await transactionResponse.json();

      if (!transactionResponse.ok) {
        throw new Error(transactionData.error || 'Gagal menyimpan transaksi');
      }

      // Reload profile, wallets, and transactions after successful save
      loadUserProfile();
      loadWallets();
      loadRecentTransactions();

      // Show success state with confetti
      setStatus("Berhasil! Transaksi tersimpan");

      // Show success toast
      toast.success(`${processData.data.item} - Rp ${processData.data.amount.toLocaleString('id-ID')} tercatat!`);

      // Wait a bit to show success state, then reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus("Siap merekam");
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal memproses';
      toast.error(errorMessage);
      setStatus("Gagal memproses");

      // Reset after showing error
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus("Siap merekam");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Desktop Only */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Menu items */}
            <div className="flex items-center gap-1">
              <Link href="/advisor">
                <Button variant="ghost" size="icon" className="h-9 w-9" title="AI Advisor">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" size="icon" className="h-9 w-9" title="Riwayat">
                  <History className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="ghost" size="icon" className="h-9 w-9" title="Laporan">
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="h-9 w-9" title="Pengaturan">
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

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />

      {/* Main Content */}
      <main className="md:pt-16 pb-20 md:pb-0">
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

          {/* Trial Warning Banner */}
          <TrialWarningBanner profile={userProfile} />

          {/* Wallet Carousel - Multi-Wallet Display */}
          <WalletCarousel
            wallets={wallets}
            totalBalance={totalBalance}
            isLoading={isLoadingWallets}
            onAddWallet={handleAddWallet}
            onEditWallet={handleEditWallet}
          />

          {/* Voice Recording Section */}
          <div className="flex flex-col items-center gap-6 py-8">
            <RecordButton
              onTranscript={handleTranscript}
              onStatusChange={handleStatusChange}
            />

            {/* Manual Transaction Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsManualTransactionOpen(true)}
              className="gap-2 border-2 border-dashed hover:border-solid hover:bg-primary/10"
            >
              <PlusCircle className="h-5 w-5" />
              Input Manual
            </Button>

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
                Contoh: &quot;Beli kopi 25000 di fore dengan gopay&quot;
              </p>
            </div>
          </div>

          {/* Recent Transactions */}
          {(isLoadingTransactions || recentTransactions.length > 0) && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-normal text-foreground">
                  Transaksi Terakhir
                </h2>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Lihat Semua
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {isLoadingTransactions ? (
                <TransactionListSkeleton count={3} />
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onClick={() => router.push('/history')}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {recentTransactions.length === 0 && !isLoadingTransactions && !isLoadingProfile && (
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

      {/* Review Transcript Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Hasil Rekaman</DialogTitle>
            <DialogDescription>
              Periksa dan edit hasil rekaman suara Anda sebelum menyimpan transaksi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="transcript-edit" className="text-sm font-medium text-foreground">
                Teks yang terdeteksi:
              </label>
              <Input
                id="transcript-edit"
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                placeholder="Contoh: Beli kopi 25000"
                className="w-full"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Anda dapat mengedit teks di atas jika ada kesalahan deteksi.
              </p>
            </div>

            {/* Wallet Selector */}
            <WalletSelector
              wallets={wallets}
              selectedWalletId={selectedWalletId}
              onSelectWallet={setSelectedWalletId}
              isLoading={isLoadingWallets}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelTranscript}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Batal
            </Button>
            <Button
              onClick={handleConfirmTranscript}
              disabled={!editedTranscript.trim()}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Proses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Wallet Dialog */}
      <AddWalletDialog
        open={isAddWalletOpen}
        onOpenChange={setIsAddWalletOpen}
        onSuccess={handleWalletSuccess}
      />

      {/* Edit Wallet Dialog */}
      <EditWalletDialog
        open={isEditWalletOpen}
        onOpenChange={setIsEditWalletOpen}
        wallet={selectedWallet}
        onSuccess={handleWalletSuccess}
      />

      {/* Manual Transaction Dialog */}
      <ManualTransactionDialog
        open={isManualTransactionOpen}
        onOpenChange={setIsManualTransactionOpen}
        wallets={wallets}
        isLoadingWallets={isLoadingWallets}
        onSuccess={() => {
          // Reload wallets and transactions after successful manual transaction
          loadWallets();
          loadRecentTransactions();
        }}
      />
    </div>
  );
}
