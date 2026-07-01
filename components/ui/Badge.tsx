import clsx from 'clsx';
import type { Status } from '@/lib/types';

interface BadgeProps {
  status: Status;
}

const colorMap: Record<Status, string> = {
  'Applied': 'bg-blue-100 text-blue-700 border-blue-200',
  'OA/Screen': 'bg-purple-100 text-purple-700 border-purple-200',
  'Interview': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Offer': 'bg-green-100 text-green-700 border-green-200',
  'Rejected': 'bg-red-100 text-red-700 border-red-200',
};

export default function Badge({ status }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colorMap[status]
      )}
    >
      {status}
    </span>
  );
}
