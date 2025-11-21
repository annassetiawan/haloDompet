"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Ensure we're on the client before accessing window
      if (typeof window === 'undefined') return;

      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('🔐 Starting Google OAuth login...')
      console.log('📍 Current origin:', window.location.origin)
      console.log('🔄 Redirect URL:', redirectUrl)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('❌ Error logging in:', error.message);
        alert('Gagal login. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 animate-scale-in">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-6xl">💰</span>
          </div>
          <h1 className="text-4xl font-normal text-foreground">
            HaloDompet
          </h1>
          <p className="text-sm font-normal text-muted-foreground">
            Voice-powered expense tracking with AI
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-normal text-foreground">
              Selamat Datang
            </h2>
            <p className="text-sm text-muted-foreground">
              Masuk untuk mulai mencatat pengeluaran Anda dengan suara
            </p>
          </div>

          {/* Google Login Button */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 text-base"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Menghubungkan...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Login dengan Google
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Dengan masuk, Anda menyetujui penggunaan data untuk pencatatan pengeluaran pribadi
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl">🎤</div>
            <p className="text-xs text-muted-foreground">Voice Input</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🤖</div>
            <p className="text-xs text-muted-foreground">AI Powered</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">📊</div>
            <p className="text-xs text-muted-foreground">Auto Tracking</p>
          </div>
        </div>
      </div>
    </main>
  );
}
