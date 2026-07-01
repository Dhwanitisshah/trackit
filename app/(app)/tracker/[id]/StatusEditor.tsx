'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Status } from '@/lib/types';

const STATUSES: Status[] = ['Applied', 'OA/Screen', 'Interview', 'Offer', 'Rejected'];

interface StatusEditorProps {
  applicationId: string;
  currentStatus: Status;
}

export default function StatusEditor({ applicationId, currentStatus }: StatusEditorProps) {
  const [status, setStatus] = useState<Status>(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleChange(newStatus: Status) {
    setStatus(newStatus);
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', applicationId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={e => handleChange(e.target.value as Status)}
        disabled={saving}
        className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      {saving && <span className="text-xs text-gray-400">Saving...</span>}
    </div>
  );
}
