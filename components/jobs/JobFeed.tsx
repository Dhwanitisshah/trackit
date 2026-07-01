'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import JobCard from './JobCard';
import Button from '@/components/ui/Button';
import type { JobListing, Profile } from '@/lib/types';

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse space-y-3">
      <div className="h-4 w-48 bg-gray-200 rounded" />
      <div className="h-3 w-32 bg-gray-100 rounded" />
      <div className="h-12 bg-gray-100 rounded" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

interface JobFeedProps {
  profile: Profile | null;
  skills: string[];
}

export default function JobFeed({ profile, skills }: JobFeedProps) {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        skills: skills.join(','),
        role: ['software engineer', profile?.discipline, 'intern']
          .filter(Boolean)
          .join(' '),
        // timestamp busts browser HTTP cache so Refresh always hits the server
        _t: Date.now().toString(),
      });
      const res = await fetch(`/api/jobs?${params}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch jobs');
      setListings(data.listings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load jobs. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [skills, profile?.discipline]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function handleAddToTracker(listing: JobListing) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('applications').insert({
      user_id: user.id,
      company: listing.company,
      role: listing.title,
      status: 'Applied',
    });

    setToast('Added to tracker!');
    setTimeout(() => setToast(''), 2500);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={fetchJobs} disabled={loading}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {!loading && error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && listings.length === 0 && (
        <p className="text-center py-10 text-sm text-gray-500">
          No matches found. Update your profile skills.
        </p>
      )}

      {!loading && !error && listings.map(listing => (
        <JobCard key={listing.id} listing={listing} onAddToTracker={handleAddToTracker} />
      ))}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
