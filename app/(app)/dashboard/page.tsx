import Link from 'next/link';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from('applications')
    .select('status')
    .eq('user_id', user!.id);

  const counts = {
    total: applications?.length ?? 0,
    active: applications?.filter(a => !['Offer', 'Rejected'].includes(a.status)).length ?? 0,
    offers: applications?.filter(a => a.status === 'Offer').length ?? 0,
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Welcome to TrackIt</h1>
      <p className="mt-1 text-gray-500">Track your internship applications in one place.</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Applications', value: counts.total },
          { label: 'Active', value: counts.active },
          { label: 'Offers', value: counts.offers },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-gray-500">Your applications will appear here once you add them.</p>
        <div className="mt-4 flex justify-center">
          <Link href="/tracker/new">
            <Button variant="primary" size="md">+ Add Application</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
