"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [initialBalance, setInitialBalance] = useState('');
  const [mode, setMode] = useState<'simple' | 'webhook'>('simple');
  const [webhookUrl, setWebhookUrl] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user already completed onboarding
    const { data: profile } = await supabase
      .from('users')
      .select('initial_balance')
      .eq('id', user.id)
      .single();

    // If user already has initial_balance set (> 0), they've completed onboarding
    // Balance = 0, NULL, or undefined means user hasn't completed onboarding yet
    if (profile && profile.initial_balance !== null && profile.initial_balance !== undefined && profile.initial_balance > 0) {
      router.push('/'); // Redirect to dashboard
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Save user settings to Supabase database via API
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initial_balance: parseFloat(initialBalance),
          mode: mode,
          webhook_url: mode === 'webhook' ? webhookUrl : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Onboarding save failed:', {
          status: response.status,
          error: data.error,
          details: data.details,
          userId: data.userId,
        });

        const errorMsg = data.error || 'Failed to save settings';
        const detailsMsg = data.details ? ` (${data.details})` : '';
        toast.error(`Gagal menyimpan: ${errorMsg}${detailsMsg}`, {
          duration: 5000,
        });
        throw new Error(errorMsg);
      }

      console.log('✅ Onboarding saved successfully:', data);

      // Verify data was actually saved by fetching it back
      console.log('🔍 Verifying saved data...');
      const verifyResponse = await fetch('/api/user');
      const verifyData = await verifyResponse.json();

      console.log('Verification result:', verifyData);

      if (verifyResponse.ok && verifyData.user) {
        const savedBalance = verifyData.user.initial_balance;
        console.log('✅ Data verified! Saved balance:', savedBalance);

        if (savedBalance === null || savedBalance === undefined) {
          console.error('❌ CRITICAL: Data not saved! Balance is still null after save');
          toast.error('Data tidak tersimpan! Coba lagi atau hubungi admin.', {
            duration: 10000,
          });
          return; // Don't redirect
        }

        // Also save to localStorage for backward compatibility
        localStorage.setItem('halodompet_initial_balance', initialBalance);
        localStorage.setItem('halodompet_mode', mode);
        if (mode === 'webhook' && webhookUrl) {
          localStorage.setItem('halodompet_webhook_url', webhookUrl);
        }

        // Redirect to main app
        toast.success('Selamat datang di HaloDompet! Trial 30 hari aktif. 🎉');
        setTimeout(() => router.push('/'), 500);
      } else {
        console.error('❌ Failed to verify saved data');
        toast.error('Gagal memverifikasi data. Coba lagi.', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      // Don't show generic error if we already showed a specific one
      if (!error.message.includes('Failed')) {
        toast.error('Gagal menyimpan pengaturan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10">
      <div className="relative z-10 w-full max-w-lg space-y-6 animate-scale-in">
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2">
          <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        {/* Step 1: Initial Balance */}
        {step === 1 && (
          <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl space-y-6">
            <div className="space-y-2 text-center">
              <div className="text-5xl mb-4">💰</div>
              <h2 className="text-2xl font-normal text-foreground">
                Saldo Awal
              </h2>
              <p className="text-sm text-muted-foreground">
                Berapa saldo awal dompet Anda?
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="balance" className="text-sm text-muted-foreground">
                  Jumlah (Rp)
                </label>
                <Input
                  id="balance"
                  type="number"
                  placeholder="1000000"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!initialBalance || parseFloat(initialBalance) < 0}
                className="w-full h-12"
              >
                Lanjutkan
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Mode Selection */}
        {step === 2 && (
          <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl space-y-6">
            <div className="space-y-2 text-center">
              <div className="text-5xl mb-4">⚙️</div>
              <h2 className="text-2xl font-normal text-foreground">
                Pilih Mode
              </h2>
              <p className="text-sm text-muted-foreground">
                Bagaimana Anda ingin menyimpan data?
              </p>
            </div>

            <div className="space-y-3">
              {/* Simple Mode */}
              <Button
                type="button"
                variant={mode === 'simple' ? 'default' : 'outline'}
                onClick={() => setMode('simple')}
                className="w-full h-auto p-4 justify-start"
              >
                <div className="flex items-start gap-3 text-left w-full">
                  <div className="text-2xl shrink-0">📱</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base">Mode Sederhana</h3>
                    <p className="text-xs opacity-80 mt-1 font-normal leading-relaxed break-words">
                      Data tersimpan di database. Cocok untuk penggunaan pribadi.
                    </p>
                  </div>
                </div>
              </Button>

              {/* Webhook Mode */}
              <Button
                type="button"
                variant={mode === 'webhook' ? 'default' : 'outline'}
                onClick={() => setMode('webhook')}
                className="w-full h-auto p-4 justify-start"
              >
                <div className="flex items-start gap-3 text-left w-full">
                  <div className="text-2xl shrink-0">🔗</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base">Mode Webhook</h3>
                    <p className="text-xs opacity-80 mt-1 font-normal leading-relaxed break-words">
                      Kirim data ke n8n atau webhook lainnya.
                    </p>
                  </div>
                </div>
              </Button>

              {/* Webhook URL Input (if webhook mode selected) */}
              {mode === 'webhook' && (
                <div className="space-y-2 pt-2">
                  <label htmlFor="webhook" className="text-sm text-muted-foreground">
                    URL Webhook
                  </label>
                  <Input
                    id="webhook"
                    type="url"
                    placeholder="https://your-n8n-instance.com/webhook/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="h-12"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading || (mode === 'webhook' && !webhookUrl)}
                  className="flex-1 h-12"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Mulai'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
