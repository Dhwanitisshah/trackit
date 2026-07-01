import { createClient } from '@/lib/supabase/server';
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from('applications')
    .select('status, created_at')
    .eq('user_id', user!.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">Your internship hunt at a glance</p>
      <div className="mt-6">
        <AnalyticsClient applications={applications ?? []} />
      </div>
    </div>
  );
}
