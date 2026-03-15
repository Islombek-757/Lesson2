'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LayoutDashboard, GraduationCap, LogOut, Sparkles, Users } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const links = [
    { href: '/', label: 'Home', icon: Sparkles },
    { href: '/lessons', label: 'Lessons', icon: BookOpen },
    { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher', label: 'Teacher', icon: GraduationCap },
    { href: '/leaderboard', label: 'Leaderboard', icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-[var(--background)]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white">
              <GraduationCap size={18} />
            </div>
            <span className="gradient-text">School OS</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-500 text-white'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-xs">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-[var(--muted-foreground)]">Level {user.level}</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    router.push('/auth/login');
                  }}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-red-500/20 transition-all"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-all">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
