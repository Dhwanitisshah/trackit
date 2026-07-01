'use client';

import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import type { Notification } from '@/lib/types';

interface NotificationDropdownProps {
  notifications: Notification[];
  onRead: (id: string) => void;
  onMarkAllRead: () => void;
}

function timeAgo(dateStr: string) {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return '';
  }
}

export default function NotificationDropdown({
  notifications,
  onRead,
  onMarkAllRead,
}: NotificationDropdownProps) {
  const router = useRouter();

  async function handleClick(n: Notification) {
    await fetch(`/api/notifications/${n.id}`, { method: 'PATCH' });
    onRead(n.id);
    if (n.link) router.push(n.link);
  }

  return (
    <div className="absolute left-0 top-full mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-xl z-50 dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
        {notifications.length > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400">No new notifications</p>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={clsx(
                'w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                !n.read && 'border-l-4 border-l-indigo-500'
              )}
            >
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{n.message}</p>
              <p className="mt-0.5 text-xs text-gray-400">{timeAgo(n.created_at)}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
