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

      {/* Main Content - Tombol Rekam */}
      <div className="flex flex-col items-center gap-8">
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
        <p>Tekan tombol mikrofon dan ucapkan pengeluaran Anda</p>
        <p className="text-xs mt-1">Contoh: &quot;Beli kopi 25000&quot; atau &quot;Makan siang 50000&quot;</p>
      </div>
    </main>
  );
}
