import clsx from 'clsx';

interface ResponseRateProps {
  applications: { status: string }[];
}

export default function ResponseRate({ applications }: ResponseRateProps) {
  const total = applications.length;

  if (total === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800 flex flex-col justify-center">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Response rate</h3>
        <p className="mt-2 text-sm text-gray-400">No applications yet</p>
      </div>
    );
  }

  const responses = applications.filter(a =>
    ['OA/Screen', 'Interview', 'Offer'].includes(a.status)
  ).length;
  const rate = Math.round((responses / total) * 100);

  const color =
    rate > 20 ? 'text-green-600' : rate >= 10 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800 flex flex-col justify-center">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Response rate</h3>
      <p className={clsx('mt-3 text-5xl font-bold', color)}>{rate}%</p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {responses} out of {total} application{total !== 1 ? 's' : ''} got a response
      </p>
    </div>
  );
}
