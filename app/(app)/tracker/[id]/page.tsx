import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Badge from '@/components/ui/Badge';
import StatusEditor from './StatusEditor';
import InterviewPrepPanel from '@/components/prep/InterviewPrepPanel';
import FollowUpPanel from '@/components/tracker/FollowUpPanel';
import SkillMatchPanel from '@/components/tracker/SkillMatchPanel';
import CoverLetterPanel from '@/components/tracker/CoverLetterPanel';
import type { Application, Profile, Status } from '@/lib/types';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: application }, { data: skillRows }, { data: profile }] = await Promise.all([
    supabase.from('applications').select('*').eq('id', id).single(),
    supabase.from('profile_skills').select('skill_name').eq('profile_id', user!.id),
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
  ]);

  if (!application) notFound();

  const app = application as Application;
  const userSkills = skillRows?.map(s => s.skill_name) ?? [];
  const userProfile = profile as Profile | null;
  const fullName = userProfile?.full_name ?? '';

  const jdText = [app.notes, app.jd_url].filter(Boolean).join(' ');

  function fmt(date: string | null) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const fields: { label: string; value: string | null }[] = [
    { label: 'Applied Date', value: fmt(app.applied_date) },
    { label: 'Deadline', value: fmt(app.deadline) },
    { label: 'Next Action', value: app.next_action },
    { label: 'Notes', value: app.notes },
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/tracker" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Application Detail</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{app.company}</h2>
            <p className="text-gray-500">{app.role}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge status={app.status} />
            <StatusEditor applicationId={app.id} currentStatus={app.status as Status} />
          </div>
        </div>

        {app.jd_url && (
          <a
            href={app.jd_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800"
          >
            View Job Description <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <dt className="text-xs font-medium text-gray-500">{label}</dt>
              <dd className="mt-1 text-sm text-gray-900">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      <InterviewPrepPanel application={app} userSkills={userSkills} />
      <FollowUpPanel application={app} userFullName={fullName} />
      <CoverLetterPanel application={app} profile={userProfile} skills={userSkills} />
      <SkillMatchPanel jdText={jdText} userSkills={userSkills} />
    </div>
  );
}
