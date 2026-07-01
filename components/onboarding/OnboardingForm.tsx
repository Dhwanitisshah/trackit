'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SkillSelector from './SkillSelector';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters'];
const DISCIPLINES = ['CS', 'ECE', 'Mechanical', 'Design', 'Other'];
const LOCATIONS = ['Remote', 'India', 'US', 'Any'];

export default function OnboardingForm() {
  const router = useRouter();
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
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
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

    if (skills.length > 0) {
      await supabase.from('profile_skills').delete().eq('profile_id', user.id);
      await supabase.from('profile_skills').insert(
        skills.map(skill_name => ({ profile_id: user.id, skill_name }))
      );
    }

    router.push('/dashboard');
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

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={() => router.push('/dashboard')}>Skip for now</Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
