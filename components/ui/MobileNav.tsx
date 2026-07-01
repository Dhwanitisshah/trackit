'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Kanban, Briefcase, User } from 'lucide-react';
import clsx from 'clsx';

const mobileLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tracker', label: 'Tracker', icon: Kanban },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800 md:hidden">
      {mobileLinks.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex flex-1 flex-col items-center justify-center py-2.5 text-xs font-medium gap-1 transition-colors',
              active
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
