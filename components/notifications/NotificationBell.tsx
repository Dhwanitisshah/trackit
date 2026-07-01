'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import type { Notification } from '@/lib/types';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      // Silently fail — bell is non-critical
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleRead(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  async function handleMarkAllRead() {
    await Promise.all(
      notifications.map(n => fetch(`/api/notifications/${n.id}`, { method: 'PATCH' }))
    );
    setNotifications([]);
    setOpen(false);
  }

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <NotificationDropdown
          notifications={notifications}
          onRead={handleRead}
          onMarkAllRead={handleMarkAllRead}
        />
      )}
    </div>
  );
}
