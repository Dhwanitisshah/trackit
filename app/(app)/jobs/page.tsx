import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import RSSJobFeed from '@/components/jobs/RSSJobFeed';

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: skillRows } = await supabase
    .from('profile_skills')
    .select('skill_name')
    .eq('profile_id', user!.id);

  const noSkills = !skillRows || skillRows.length === 0;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Internship listings
      </h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">
        Live listings from Internshala and Freshersworld
      </p>

      {noSkills && (
        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
          <p className="text-sm text-yellow-800">
            Your profile has no skills set. Add skills to get better matches.{' '}
            <Link href="/profile" className="font-semibold underline">
              Update profile →
            </Link>
          </p>
        </div>
      )}

      <div className="mt-6">
        <RSSJobFeed />
      </div>
    </div>
  );
}
