'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Status } from '@/lib/types';

const STATUSES: Status[] = ['Applied', 'OA/Screen', 'Interview', 'Offer', 'Rejected'];

export default function NewApplicationPage() {
  const router = useRouter();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<Status>('Applied');
  const [appliedDate, setAppliedDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [jdUrl, setJdUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    const { error: insertError } = await supabase.from('applications').insert({
      user_id: user.id,
      company, role, status,
      applied_date: appliedDate || null,
      deadline: deadline || null,
      jd_url: jdUrl || null,
      notes: notes || null,
      next_action: nextAction || null,
    });

    if (insertError) { setError(insertError.message); setLoading(false); return; }
    router.push('/tracker');
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push('/tracker')}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add Application</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Company" placeholder="Google" value={company} onChange={e => setCompany(e.target.value)} required />
            <Input label="Role" placeholder="SWE Intern" value={role} onChange={e => setRole(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as Status)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Applied Date" type="date" value={appliedDate} onChange={e => setAppliedDate(e.target.value)} />
            <Input label="Deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>

          <Input label="Job Description URL" placeholder="https://..." value={jdUrl} onChange={e => setJdUrl(e.target.value)} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Referral contact, requirements..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <Input label="Next Action" placeholder="Follow up on Thursday" value={nextAction} onChange={e => setNextAction(e.target.value)} />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => router.push('/tracker')}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Add Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
