import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PublicProfilePage from '@/components/public-profile/PublicProfilePage';
import type { Profile, ResumeContent } from '@/lib/types';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, year, discipline, college')
    .eq('username', username)
    .eq('is_public', true)
    .single();

  if (!profile) return { title: 'Profile not found — TrackIt' };

  return {
    title: `${profile.full_name ?? username} — TrackIt Profile`,
    description: `${profile.full_name ?? username} is a ${profile.year ?? ''} ${profile.discipline ?? ''} student at ${profile.college ?? ''}`.trim(),
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .eq('is_public', true)
    .single();

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700">Profile not found</h1>
          <p className="mt-2 text-sm text-gray-400">
            This profile doesn&apos;t exist or is set to private.
          </p>
        </div>
      </div>
    );
  }

  const [{ data: skillRows }, { data: resume }] = await Promise.all([
    supabase.from('profile_skills').select('skill_name').eq('profile_id', profile.id),
    supabase.from('resumes').select('content').eq('user_id', profile.id).single(),
  ]);

  const skills = skillRows?.map(r => r.skill_name) ?? [];
  const resumeContent = (resume?.content as ResumeContent) ?? null;

  return (
    <PublicProfilePage
      profile={profile as Profile}
      skills={skills}
      resumeContent={resumeContent}
    />
  );
}
