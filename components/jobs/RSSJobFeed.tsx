'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import RSSJobCard from './RSSJobCard';
import Button from '@/components/ui/Button';
import type { RSSJobListing, Profile } from '@/lib/types';

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse space-y-3">
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-1/3 bg-gray-100 rounded" />
      <div className="h-16 bg-gray-100 rounded" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

export default function RSSJobFeed() {
  const [listings, setListings] = useState<RSSJobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toast, setToast] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setProfileLoaded(true); return; }

      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('profile_skills').select('skill_name').eq('profile_id', user.id),
      ]);

      setProfile(p as Profile);
      setSkills(s?.map(r => r.skill_name) ?? []);
      setProfileLoaded(true);
    }
    loadProfile();
  }, []);

  const fetchListings = useCallback(async () => {
    if (!profileLoaded) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        skills: skills.join(','),
        role: profile?.discipline ?? 'software intern',
        _t: Date.now().toString(),
      });
      const res = await fetch(`/api/rss?${params}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load listings');
      setListings(data.listings ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load listings right now. Try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [profileLoaded, skills, profile?.discipline]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  async function handleAddToTracker(listing: RSSJobListing) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('applications').insert({
      user_id: user.id,
      company: listing.company || listing.source,
      role: listing.title,
      status: 'Applied',
    });

    setToast('Added to tracker!');
    setTimeout(() => setToast(''), 2500);
  }

  function minutesAgo(date: Date) {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 minute ago';
    return `${mins} minutes ago`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {lastUpdated && (
          <p className="text-xs text-gray-400">Last updated: {minutesAgo(lastUpdated)}</p>
        )}
        <Button variant="secondary" size="sm" onClick={fetchListings} disabled={loading} className="ml-auto">
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh listings
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {!loading && error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && listings.length === 0 && (
        <p className="text-center py-10 text-sm text-gray-500">
          No listings found. Try updating your profile skills.
        </p>
      )}

      {!loading && !error && listings.map(listing => (
        <RSSJobCard key={listing.id} listing={listing} onAddToTracker={handleAddToTracker} />
      ))}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
