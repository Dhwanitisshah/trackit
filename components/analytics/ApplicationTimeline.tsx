'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface ApplicationTimelineProps {
  applications: { created_at: string }[];
}

export default function ApplicationTimeline({ applications }: ApplicationTimelineProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Applications over time</h3>
        <p className="text-sm text-gray-400 text-center py-8">
          Start tracking applications to see your timeline
        </p>
      </div>
    );
  }

  // Build last 8 weeks of data
  const weeks: { label: string; count: number; start: Date }[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const label = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const count = applications.filter(a => {
      const d = new Date(a.created_at);
      return d >= start && d < end;
    }).length;

    weeks.push({ label, count, start });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Applications over time</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={weeks} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
            formatter={(v) => [v, 'Applications']}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: '#6366f1' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
