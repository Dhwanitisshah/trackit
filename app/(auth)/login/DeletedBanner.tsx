'use client';

import { useSearchParams } from 'next/navigation';

export default function DeletedBanner() {
  const params = useSearchParams();
  if (params.get('deleted') !== 'true') return null;

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      Your account has been deleted.
    </div>
  );
}
