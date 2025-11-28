'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, UserPlus, UserX, Clock, Shield, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { getStatusColor, getStatusLabel, formatTrialEndDate, getDaysLeft } from '@/lib/trial'
import type { User } from '@/types'

// Minimal user data for admin panel (no sensitive balance info)
type AdminUserView = Pick<User, 'id' | 'email' | 'account_status' | 'trial_ends_at' | 'trial_started_at' | 'created_at'>

export default function AdminPanel() {
  const [users, setUsers] = useState<AdminUserView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [processingUserId, setProcessingUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Check if user is admin via debug endpoint
    try {
      const response = await fetch('/api/admin/check')
      const debug = await response.json()

      console.log('Admin check response:', debug)

      if (!debug.is_admin) {
        const errorMsg = debug.table_exists
          ? `Akses ditolak. User ID: ${user.id} bukan admin.\n\nJalankan SQL ini di Supabase:\n\nINSERT INTO public.admin_users (user_id, email) VALUES ('${user.id}', '${user.email}');\n\nLalu refresh halaman.`
          : 'Tabel admin_users belum ada. Jalankan migration di TRIAL_SETUP.md terlebih dahulu.'

        setDebugInfo(errorMsg)
        toast.error('Akses ditolak')
        setTimeout(() => router.push('/'), 3000)
        return
      }

      setIsAdmin(true)
      loadUsers()
    } catch (error) {
      console.error('Error checking admin:', error)
      toast.error('Gagal cek akses admin')
      setTimeout(() => router.push('/'), 3000)
    }
  }

  const loadUsers = async () => {
    try {
      setIsLoading(true)

      // Fetch users from admin API endpoint (bypasses RLS)
      const response = await fetch('/api/admin/users')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch users')
      }

      setUsers(result.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Gagal memuat daftar user')
    } finally {
      setIsLoading(false)
    }
  }

  const extendTrial = async (userId: string, days: number = 30) => {
    try {
      setProcessingUserId(userId)
      const response = await fetch('/api/admin/extend-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, days }),
      })

      if (!response.ok) throw new Error('Failed to extend trial')

      toast.success(`Trial diperpanjang ${days} hari`)
      loadUsers()
    } catch (error) {
      console.error('Error extending trial:', error)
      toast.error('Gagal memperpanjang trial')
    } finally {
      setProcessingUserId(null)
    }
  }

  const activateUser = async (userId: string) => {
    try {
      setProcessingUserId(userId)
      const response = await fetch('/api/admin/activate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) throw new Error('Failed to activate user')

      toast.success('User diaktifkan (unlimited access)')
      loadUsers()
    } catch (error) {
      console.error('Error activating user:', error)
      toast.error('Gagal mengaktifkan user')
    } finally {
      setProcessingUserId(null)
    }
  }

  const blockUser = async (userId: string) => {
    try {
      setProcessingUserId(userId)
      const response = await fetch('/api/admin/block-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) throw new Error('Failed to block user')

      toast.success('User diblokir')
      loadUsers()
    } catch (error) {
      console.error('Error blocking user:', error)
      toast.error('Gagal memblokir user')
    } finally {
      setProcessingUserId(null)
    }
  }

  if (!isAdmin && !isLoading) {
    if (debugInfo) {
      return (
        <main className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-card border border-border rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
            <pre className="text-left bg-muted p-4 rounded-lg text-xs overflow-auto whitespace-pre-wrap mb-6">
              {debugInfo}
            </pre>
            <Button onClick={() => router.push('/')} variant="outline">
              Kembali ke Dashboard
            </Button>
          </div>
        </main>
      )
    }
    return null
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="h-7 w-7 text-primary" />
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage user access and trial periods
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-muted-foreground">Belum ada user</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Trial Ends</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const daysLeft = user.trial_ends_at ? getDaysLeft(user.trial_ends_at) : 0
                    const isProcessing = processingUserId === user.id

                    return (
                      <tr key={user.id} className="border-b border-border last:border-0">
                        <td className="p-4">
                          <p className="text-sm font-medium text-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(user.account_status)}`}>
                            {getStatusLabel(user.account_status)}
                          </span>
                        </td>
                        <td className="p-4">
                          {user.account_status === 'trial' ? (
                            <div>
                              <p className="text-sm text-foreground">
                                {formatTrialEndDate(user.trial_ends_at)}
                              </p>
                              <p className={`text-xs ${daysLeft <= 7 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Expired'}
                              </p>
                            </div>
                          ) : user.account_status === 'active' ? (
                            <p className="text-sm text-green-500">Unlimited</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">-</p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => extendTrial(user.id)}
                              disabled={isProcessing}
                              className="gap-1"
                            >
                              {isProcessing && processingUserId === user.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              Extend
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => activateUser(user.id)}
                              disabled={isProcessing || user.account_status === 'active'}
                              className="gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Activate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => blockUser(user.id)}
                              disabled={isProcessing || user.account_status === 'blocked'}
                              className="gap-1 text-red-500 hover:text-red-600"
                            >
                              <UserX className="h-3 w-3" />
                              Block
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {users.map((user) => {
                const daysLeft = user.trial_ends_at ? getDaysLeft(user.trial_ends_at) : 0
                const isProcessing = processingUserId === user.id

                return (
                  <div key={user.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(user.account_status)}`}>
                        {getStatusLabel(user.account_status)}
                      </span>
                    </div>

                    <div className="text-xs">
                      <p className="text-muted-foreground">Trial Ends</p>
                      <p className="text-foreground font-medium">
                        {user.account_status === 'trial' && user.trial_ends_at
                          ? `${daysLeft} hari lagi`
                          : user.account_status === 'active'
                          ? 'Unlimited'
                          : '-'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => extendTrial(user.id)}
                        disabled={isProcessing}
                        className="flex-1 gap-1"
                      >
                        {isProcessing && processingUserId === user.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        Extend
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => activateUser(user.id)}
                        disabled={isProcessing || user.account_status === 'active'}
                        className="flex-1 gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => blockUser(user.id)}
                        disabled={isProcessing || user.account_status === 'blocked'}
                        className="flex-1 gap-1 text-red-500"
                      >
                        <UserX className="h-3 w-3" />
                        Block
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
