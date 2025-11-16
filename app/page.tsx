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
    <main className="relative min-h-screen flex flex-col p-4 md:p-24 bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10">
      {/* Decorative Background - Animated (hidden on mobile) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Header - Fade in from top */}
      <div className="relative z-10 w-full max-w-2xl mx-auto flex justify-between items-center animate-slide-down pt-2 md:pt-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-normal text-foreground">
            HaloDompet
          </h1>
          <p className="text-xs md:text-sm font-normal text-muted-foreground mt-0.5">Voice-powered expense tracker</p>
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

      {/* Main Content - Tombol Rekam 3D - Scale in animation */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center gap-6 md:gap-8 animate-scale-in max-w-2xl mx-auto w-full py-8 md:py-0">
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
