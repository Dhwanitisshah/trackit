'use client';

import StatusBreakdown from '@/components/analytics/StatusBreakdown';
import ApplicationTimeline from '@/components/analytics/ApplicationTimeline';
import ResponseRate from '@/components/analytics/ResponseRate';

interface AnalyticsClientProps {
  applications: { status: string; created_at: string }[];
}

const STAT_CARDS = (apps: { status: string }[]) => [
  { label: 'Total applied', value: apps.length },
  {
    label: 'Active',
    value: apps.filter(a => ['Applied', 'OA/Screen', 'Interview'].includes(a.status)).length,
  },
  { label: 'Offers received', value: apps.filter(a => a.status === 'Offer').length },
  { label: 'Rejected', value: apps.filter(a => a.status === 'Rejected').length },
];

export default function AnalyticsClient({ applications }: AnalyticsClientProps) {
  const stats = STAT_CARDS(applications);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <StatusBreakdown applications={applications} />
        </div>
        <div>
          <ResponseRate applications={applications} />
        </div>
      </div>

      {/* Timeline — full width */}
      <ApplicationTimeline applications={applications} />
    </div>
  );
}
