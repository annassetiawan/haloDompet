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
import { Mic, MicOff, Settings, Loader2, Keyboard, Send } from 'lucide-react';

export default function HomePage() {
  // State Management
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Siap merekam");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [tempWebhookUrl, setTempWebhookUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Detect iOS device
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
    if (isIOSDevice) {
      setStatus("Ketik pengeluaran Anda");
      setShowManualInput(true);
    }
  }, []);

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
    setTimeout(() => {
      setStatus(isIOS ? "Ketik pengeluaran Anda" : "Siap merekam");
    }, 2000);
  };

  // Process text (used by both voice and manual input)
  const processText = async (text: string) => {
    if (!webhookUrl) {
      setStatus("Atur webhook URL terlebih dahulu!");
      setIsDialogOpen(true);
      return;
    }

    setIsProcessing(true);
    setStatus(`Memproses: "${text}"`);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          webhookUrl: webhookUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`Berhasil! Data terkirim ke n8n 🎉`);
        setManualInput(""); // Clear input
        setTimeout(() => {
          setStatus(isIOS ? "Ketik pengeluaran Anda" : "Siap merekam");
        }, 3000);
      } else {
        setStatus(`Error: ${data.error || 'Gagal memproses'}`);
        setTimeout(() => {
          setStatus(isIOS ? "Ketik pengeluaran Anda" : "Siap merekam");
        }, 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus("Error mengirim data. Cek koneksi internet.");
      setTimeout(() => {
        setStatus(isIOS ? "Ketik pengeluaran Anda" : "Siap merekam");
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual text submit handler
  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualInput.trim()) {
      setStatus("Ketik pengeluaran terlebih dahulu!");
      return;
    }
    processText(manualInput.trim());
  };

  // Web Speech API Handler (for non-iOS devices)
  const handleListen = async () => {
    // Cek apakah browser support Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setStatus("Browser tidak mendukung Web Speech API.");
      setShowManualInput(true);
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
      setIsListening(false);
      await processText(transcript);
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
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center">
        <h1 className="text-2xl font-bold">HaloDompet</h1>

        {/* Dialog Pengaturan */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTempWebhookUrl(webhookUrl)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
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
              />
            </div>
            <DialogFooter>
              <Button onClick={saveWebhookUrl}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        {/* iOS Warning Banner */}
        {isIOS && (
          <div className="w-full bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-700 dark:text-yellow-300">
            <p className="font-medium">ℹ️ iPhone terdeteksi</p>
            <p className="mt-1 text-xs">Voice recording tidak didukung di iOS. Gunakan input teks di bawah.</p>
          </div>
        )}

        {/* Voice Button (for non-iOS) or Manual Input Toggle */}
        {!showManualInput ? (
          <>
            <Button
              onClick={handleListen}
              disabled={isListening || isProcessing}
              size="lg"
              className="h-32 w-32 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              {isListening ? (
                <Mic className="h-12 w-12 animate-pulse" />
              ) : isProcessing ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : (
                <MicOff className="h-12 w-12" />
              )}
            </Button>

            {/* Toggle to manual input */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManualInput(true)}
              className="text-muted-foreground"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Ketik manual
            </Button>
          </>
        ) : (
          <>
            {/* Manual Text Input Form */}
            <form onSubmit={handleManualSubmit} className="w-full space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Contoh: Beli kopi 25000"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  disabled={isProcessing}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={isProcessing || !manualInput.trim()}
                  size="icon"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>

            {/* Toggle back to voice (only for non-iOS) */}
            {!isIOS && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManualInput(false)}
                className="text-muted-foreground"
              >
                <Mic className="h-4 w-4 mr-2" />
                Rekam suara
              </Button>
            )}
          </>
        )}

        {/* Status */}
        <div className="text-center">
          <p className="text-lg font-medium">
            {status}
          </p>
          {!webhookUrl && (
            <p className="text-sm text-muted-foreground mt-2">
              Klik ikon <Settings className="inline h-3 w-3" /> untuk mengatur webhook URL
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        {showManualInput ? (
          <>
            <p>Ketik pengeluaran Anda lalu tekan kirim</p>
            <p className="text-xs mt-1">Contoh: &quot;Beli kopi 25000&quot; atau &quot;Makan siang 50000&quot;</p>
          </>
        ) : (
          <>
            <p>Tekan tombol mikrofon dan ucapkan pengeluaran Anda</p>
            <p className="text-xs mt-1">Contoh: &quot;Beli kopi 25000&quot; atau &quot;Makan siang 50000&quot;</p>
          </>
        )}
      </div>
    </main>
  );
}
