'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Clock, Mail, LogOut } from 'lucide-react'

export default function TrialExpiredPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleContactAdmin = () => {
    // You can update this with your actual contact method
    window.open('mailto:support@halodompet.com?subject=Trial Extension Request', '_blank')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-6 rounded-full bg-amber-500/10 dark:bg-amber-500/20">
            <Clock className="h-16 w-16 text-amber-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Trial Kamu Sudah Habis
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Terima kasih sudah mencoba HaloDompet selama periode trial.
          Akun kamu saat ini tidak dapat mengakses aplikasi.
        </p>

        {/* Info Box */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Untuk melanjutkan akses:
          </h2>

          <div className="space-y-4">
            {/* Option 1: Contact Admin */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 mt-0.5">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground mb-1">
                  Hubungi Admin
                </h3>
                <p className="text-xs text-muted-foreground">
                  Kirim email untuk request perpanjangan trial atau aktivasi akun
                </p>
              </div>
            </div>

            {/* Future: Payment option */}
            {/* <div className="flex items-start gap-3 opacity-50">
              <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20 mt-0.5">
                <CreditCard className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground mb-1">
                  Upgrade ke Pro
                </h3>
                <p className="text-xs text-muted-foreground">
                  Rp 29.000/bulan - Coming soon
                </p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleContactAdmin}
            className="w-full gap-2"
            size="lg"
          >
            <Mail className="h-4 w-4" />
            Hubungi Admin
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full gap-2"
            size="lg"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-muted-foreground mt-8">
          Jika kamu merasa ini adalah kesalahan, silakan hubungi admin.
        </p>
      </div>
    </main>
  )
}
