'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Status } from '@/lib/types';

const STATUS_COLORS: Record<Status, string> = {
  'Applied':   '#3B82F6',
  'OA/Screen': '#8B5CF6',
  'Interview': '#F59E0B',
  'Offer':     '#10B981',
  'Rejected':  '#EF4444',
};

const ALL_STATUSES: Status[] = ['Applied', 'OA/Screen', 'Interview', 'Offer', 'Rejected'];

interface StatusBreakdownProps {
  applications: { status: string }[];
}

export default function StatusBreakdown({ applications }: StatusBreakdownProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">By status</h3>
        <p className="text-sm text-gray-400 text-center py-8">No applications yet</p>
      </div>
    );
  }

  const counts = ALL_STATUSES.map(status => ({
    name: status,
    value: applications.filter(a => a.status === status).length,
    color: STATUS_COLORS[status],
  })).filter(d => d.value > 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">By status</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={counts}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {counts.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [value, name]}
            contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {counts.map(({ name, value, color }) => (
          <div key={name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {name} ({value})
          </div>
        ))}
      </div>
    </div>
  );
}
