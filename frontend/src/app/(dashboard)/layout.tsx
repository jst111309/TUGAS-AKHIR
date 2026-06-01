'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const cn = (...c: (string | boolean | undefined | null)[]) => c.filter(Boolean).join(' ');

const navItems = [
  { href: '/', label: 'Dashboard', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" /></svg>
  )},
  { href: '/logs', label: 'Monitoring Log', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  )},
  { href: '/alerts', label: 'Alert Keamanan', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
  )},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ user: string } | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('siem_session');
    if (!session) { router.push('/login'); return; }
    setUser(JSON.parse(session));
  }, [router]);

  // Auto refresh timer
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => setLastUpdate(new Date()), 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleLogout = () => {
    localStorage.removeItem('siem_session');
    router.push('/login');
  };

  if (!user) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn(
        'fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
          <img src="/cic-logo.png" alt="CIC Logo" className="h-8 w-auto brightness-0 invert opacity-80" />
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">CIC SecureWatch</h1>
            <p className="text-[10px] text-slate-500 leading-tight">SIEM Monitoring</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                  active
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center text-primary-400 text-sm font-semibold">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.user}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition">
            <svg className="w-5 h-5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-semibold text-neutral-900">
              {navItems.find((n) => n.href === pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setAutoRefresh(!autoRefresh)} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition', autoRefresh ? 'border-green-300 bg-green-50 text-green-700' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50')}>
              <span className={cn('w-2 h-2 rounded-full', autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-neutral-300')} />
              {autoRefresh ? 'Auto Refresh: ON' : 'Auto Refresh: OFF'}
            </button>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              {lastUpdate.toLocaleTimeString('id-ID')}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
