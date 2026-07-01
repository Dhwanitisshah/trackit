'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, User, Target, LogOut,
  Kanban, FileText, Settings, BarChart2,
} from 'lucide-react';
import clsx from 'clsx';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from '@/components/notifications/NotificationBell';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface SidebarProps {
  userEmail?: string | null;
}

const topLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tracker',   label: 'Tracker',   icon: Kanban },
  { href: '/jobs',      label: 'Jobs',       icon: Briefcase },
  { href: '/resume',    label: 'Resume',     icon: FileText },
  { href: '/analytics', label: 'Analytics',  icon: BarChart2 },
];

const bottomLinks = [
  { href: '/profile',  label: 'Profile',  icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        className={clsx(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          active
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {label}
      </Link>
    );
  }

  return (
    <aside className="hidden md:flex h-screen w-60 flex-col border-r border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800 flex-shrink-0">
      {/* Logo + bell */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-indigo-600" />
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">TrackIt</span>
        </div>
        <NotificationBell />
      </div>

      {/* Top nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {topLinks.map(link => <NavLink key={link.href} {...link} />)}

        <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

        {bottomLinks.map(link => <NavLink key={link.href} {...link} />)}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          {userEmail && (
            <p className="text-xs text-gray-400 truncate flex-1 mr-2" title={userEmail}>
              {userEmail}
            </p>
          )}
          <ThemeToggle />
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
