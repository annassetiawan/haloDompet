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
        throw new Error(data.error || 'Failed to save settings');
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
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Gagal menyimpan pengaturan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10">
      <div className="relative z-10 w-full max-w-md space-y-6 animate-scale-in">
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
                <div className="flex items-start gap-3 text-left">
                  <div className="text-2xl">📱</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-base">Mode Sederhana</h3>
                    <p className="text-xs opacity-80 mt-1 font-normal">
                      Data tersimpan di browser. Cocok untuk penggunaan pribadi.
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
                <div className="flex items-start gap-3 text-left">
                  <div className="text-2xl">🔗</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-base">Mode Webhook</h3>
                    <p className="text-xs opacity-80 mt-1 font-normal">
                      Kirim data ke n8n atau layanan lainnya. Untuk advanced.
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
