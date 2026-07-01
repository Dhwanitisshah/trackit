'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SkillSelector from '@/components/onboarding/SkillSelector';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters'];
const DISCIPLINES = ['CS', 'ECE', 'Mechanical', 'Design', 'Other'];
const LOCATIONS = ['Remote', 'India', 'US', 'Any'];

export default function PersonaForm() {
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [location, setLocation] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: skillRows }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('profile_skills').select('skill_name').eq('profile_id', user.id),
      ]);

      if (profile) {
        setFullName(profile.full_name ?? '');
        setCollege(profile.college ?? '');
        setYear(profile.year ?? '');
        setDiscipline(profile.discipline ?? '');
        setLocation(profile.location ?? '');
        setGithubUrl(profile.github_url ?? '');
        setLinkedinUrl(profile.linkedin_url ?? '');
        setPortfolioUrl(profile.portfolio_url ?? '');
      }

      setSkills(skillRows?.map(r => r.skill_name) ?? []);
      setFetching(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName || null,
      college: college || null,
      year: year || null,
      discipline: discipline || null,
      location: location || null,
      github_url: githubUrl || null,
      linkedin_url: linkedinUrl || null,
      portfolio_url: portfolioUrl || null,
      updated_at: new Date().toISOString(),
    });

    if (upsertError) { setError(upsertError.message); setLoading(false); return; }

    await supabase.from('profile_skills').delete().eq('profile_id', user.id);
    if (skills.length > 0) {
      await supabase.from('profile_skills').insert(
        skills.map(skill_name => ({ profile_id: user.id, skill_name }))
      );
    }

    setSaved(true);
    setLoading(false);
  }

  if (fetching) {
    return <div className="py-10 text-center text-gray-400">Loading profile...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full Name" placeholder="Dhwanit Shah" value={fullName} onChange={e => setFullName(e.target.value)} />
        <Input label="College" placeholder="IIT Bombay" value={college} onChange={e => setCollege(e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Year', value: year, setter: setYear, options: YEARS },
          { label: 'Discipline', value: discipline, setter: setDiscipline, options: DISCIPLINES },
          { label: 'Location Preference', value: location, setter: setLocation, options: LOCATIONS },
        ].map(({ label, value, setter, options }) => (
          <div key={label}>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            <select
              value={value}
              onChange={e => setter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select...</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input label="GitHub URL" placeholder="https://github.com/..." value={githubUrl} onChange={e => setGithubUrl(e.target.value)} />
        <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/..." value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
        <Input label="Portfolio URL" placeholder="https://..." value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Skills</label>
        <SkillSelector selected={skills} onChange={setSkills} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Profile saved successfully.</p>}

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
