import { createClient } from '@/lib/supabase/server';
import ResumeBuilder from '@/components/resume/ResumeBuilder';
import type { Profile, ResumeContent } from '@/lib/types';

export default async function ResumePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: skillRows }, { data: resume }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('profile_skills').select('skill_name').eq('profile_id', user!.id),
    supabase.from('resumes').select('*').eq('user_id', user!.id).single(),
  ]);

  const skills = skillRows?.map(r => r.skill_name) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Resume builder</h1>
      <p className="mt-1 text-gray-500">Generate a resume tailored to a specific job description</p>
      <div className="mt-6">
        <ResumeBuilder
          profile={profile as Profile}
          skills={skills}
          initialJdText={resume?.jd_text ?? ''}
          initialContent={(resume?.content as ResumeContent) ?? null}
        />
      </div>
    </div>
  );
}
