'use client';
import { cn } from '@/lib/utils';
import { BarChart2, Settings, Search, User as UserIcon, LogOut, Activity } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Separator from '@radix-ui/react-separator';
import useAuthStore from '@/store/authStore';

const navLinks = [
  { label: 'Screener', href: '/' },
  { label: 'Compare',  href: '/compare' },
  { label: 'Analytics',href: '/analytics' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center border-b border-border bg-background/80 backdrop-blur-md">
      <div className="w-full px-6 flex items-center justify-between">
        {/* Left: Logo Group */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center">
            <BarChart2 size={14} className="text-background" />
          </div>
          <span className="font-semibold text-foreground text-sm tracking-tight">
            FundScope
          </span>
        </div>

        {/* Center: Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ label, href }) => {
            const isActive = pathname === href || (pathname === '/' && href === '#screener'); // simple active logic
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  'text-sm transition-colors duration-150',
                  isActive
                    ? 'text-foreground underline decoration-2 underline-offset-4 decoration-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <Link href="/get-started" className="bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-md hover:bg-foreground/90 active:scale-95 transition-all">
              Get Started
            </Link>
          ) : (
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="flex items-center gap-2 hover:bg-secondary py-1 px-2 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-ring">
                  <div className="w-6 h-6 rounded-full bg-chart-1 flex items-center justify-center text-[10px] font-bold text-background uppercase">
                    {user?.name?.charAt(0) || <UserIcon size={12} />}
                  </div>
                  <span className="text-xs font-medium text-foreground max-w-[80px] truncate">{user?.name}</span>
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="bg-card border border-border rounded-lg shadow-xl w-48 p-1 z-50 animate-fade-in mt-2 mr-2" sideOffset={5}>
                  <div className="px-2 py-2 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <Separator.Root className="h-px bg-border my-1" />
                  <Link href="#screener" className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                    <Activity size={14} />
                    Screener
                  </Link>
                  <button className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors text-left focus:outline-none">
                    <Settings size={14} />
                    Settings
                  </button>
                  <Separator.Root className="h-px bg-border my-1" />
                  <button 
                    onClick={() => { logout(); router.push('/'); }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-chart-5 hover:bg-chart-5/10 rounded-md transition-colors text-left focus:outline-none"
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}

          <div className="w-px h-4 bg-border hidden md:block" />
          <button className="text-muted-foreground hover:text-foreground transition-colors active:scale-95 hidden md:block">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
