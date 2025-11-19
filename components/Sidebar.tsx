"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, BarChart3, Sparkles, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/history', icon: History, label: 'Riwayat' },
    { href: '/reports', icon: BarChart3, label: 'Laporan' },
    { href: '/advisor', icon: Sparkles, label: 'Advisor' },
    { href: '/settings', icon: Settings, label: 'Setting' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card p-4 hidden md:flex flex-col z-50">
      {/* Logo Section */}
      <div className="mb-8 px-3">
        <h1 className="text-2xl font-bold tracking-tight">HaloDompet</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Voice-powered expense tracker
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="pt-4 border-t">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </aside>
  );
}
