"use client";

import { useState, useEffect } from 'react';
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
import { Mic, MicOff, Settings, Loader2 } from 'lucide-react';

export default function HomePage() {
  // State Management
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Siap merekam");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [tempWebhookUrl, setTempWebhookUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load webhook URL from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('halodompet_webhook_url');
    if (savedUrl) {
      setWebhookUrl(savedUrl);
    }
  }, []);

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
        // Kirim ke backend untuk diproses
        const response = await fetch('/api/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: transcript,
            webhookUrl: webhookUrl,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus(`Berhasil! Data terkirim ke n8n 🎉`);
          setTimeout(() => setStatus("Siap merekam"), 3000);
        } else {
          setStatus(`Error: ${data.error || 'Gagal memproses'}`);
          setTimeout(() => setStatus("Siap merekam"), 3000);
        }
      } catch (error) {
        console.error('Error:', error);
        setStatus("Error mengirim data. Cek koneksi internet.");
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
    <main className="relative flex min-h-screen flex-col items-center justify-between p-6 md:p-24 bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-2xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            HaloDompet
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Voice-powered expense tracker</p>
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
              <Settings className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Pengaturan Webhook</DialogTitle>
              <DialogDescription>
                Masukkan URL webhook n8n Anda. Data JSON akan dikirim ke URL ini setelah diproses.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="https://your-n8n-instance.com/webhook/..."
                value={tempWebhookUrl}
                onChange={(e) => setTempWebhookUrl(e.target.value)}
                className="border-2 focus-visible:border-primary/50"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={saveWebhookUrl}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content - Tombol Rekam 3D */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Glow effect ring */}
        <div className={`absolute w-40 h-40 rounded-full transition-all duration-500 ${
          isListening
            ? 'bg-red-500/20 dark:bg-red-500/30 blur-2xl animate-pulse'
            : isProcessing
            ? 'bg-blue-500/20 dark:bg-blue-500/30 blur-2xl animate-pulse'
            : 'bg-primary/10 dark:bg-primary/20 blur-xl'
        }`} />

        <button
          onClick={handleListen}
          disabled={isListening || isProcessing}
          className={`
            relative h-40 w-40 rounded-full
            font-bold text-lg
            transition-all duration-300 ease-out
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isListening
              ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-[0_8px_30px_rgb(239,68,68,0.5)] hover:shadow-[0_12px_40px_rgb(239,68,68,0.6)]'
              : isProcessing
              ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-[0_8px_30px_rgb(59,130,246,0.5)]'
              : 'bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.4)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.1)] dark:hover:shadow-[0_12px_40px_rgb(255,255,255,0.15)]'
            }
            hover:scale-105 active:scale-95
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
              <Mic className="h-16 w-16 animate-pulse drop-shadow-lg" />
            ) : isProcessing ? (
              <Loader2 className="h-16 w-16 animate-spin drop-shadow-lg" />
            ) : (
              <MicOff className="h-16 w-16 drop-shadow-lg group-hover:scale-110 transition-transform" />
            )}
          </div>

          {/* Bottom shadow untuk efek 3D */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/20 rounded-full blur-md" />
        </button>

        {/* Status Card */}
        <div className="text-center space-y-3 max-w-md">
          <div className="px-6 py-3 rounded-2xl bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 dark:border-border shadow-lg">
            <p className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {status}
            </p>
          </div>

          {!webhookUrl && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 dark:border-amber-500/30 rounded-xl px-4 py-2">
              <Settings className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Klik ikon pengaturan untuk setup webhook URL</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 dark:bg-muted/50 backdrop-blur-sm border border-border/30 dark:border-border/50">
          <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/90">Tekan tombol dan ucapkan pengeluaran Anda</p>
        </div>
        <p className="text-xs text-muted-foreground/70 dark:text-muted-foreground/60">
          Contoh: &quot;Beli kopi 25000&quot; atau &quot;Makan siang 50000&quot;
        </p>
      </div>
    </main>
  );
}
