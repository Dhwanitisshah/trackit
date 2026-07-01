'use client';

import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import ResumePreview from './ResumePreview';
import ExportButton from './ExportButton';
import type { Profile, ResumeContent } from '@/lib/types';

interface ResumeBuilderProps {
  profile: Profile | null;
  skills: string[];
  initialJdText?: string;
  initialContent?: ResumeContent | null;
}

const emptyContent = (): ResumeContent => ({
  summary: '',
  skills: [],
  experience: [],
  education: [{ degree: '', college: '', year: '' }],
  projects: [{ name: '', description: '', tech: [] }],
});

export default function ResumeBuilder({ profile, skills, initialJdText = '', initialContent }: ResumeBuilderProps) {
  const [jdText, setJdText] = useState(initialJdText);
  const [content, setContent] = useState<ResumeContent>(initialContent ?? emptyContent());
  const [generated, setGenerated] = useState(!!initialContent);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  async function generate() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, skills, jd_text: jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContent(data.content);
      setGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate resume, please try again');
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('resumes').upsert(
        { user_id: user.id, jd_text: jdText, content, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateProject(i: number, field: string, value: string | string[]) {
    const projects = [...content.projects];
    projects[i] = { ...projects[i], [field]: value };
    setContent({ ...content, projects });
  }

  function addProjectTech(i: number, tech: string) {
    const trimmed = tech.trim();
    if (!trimmed) return;
    const projects = [...content.projects];
    projects[i] = { ...projects[i], tech: [...(projects[i].tech ?? []), trimmed] };
    setContent({ ...content, projects });
  }

  function removeProjectTech(pi: number, ti: number) {
    const projects = [...content.projects];
    projects[pi].tech = projects[pi].tech.filter((_, idx) => idx !== ti);
    setContent({ ...content, projects });
  }

  function addSkillTag(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || content.skills.includes(trimmed)) return;
    setContent({ ...content, skills: [...content.skills, trimmed] });
    setSkillInput('');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT — Editor */}
      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Paste the job description</label>
          <textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            rows={8}
            placeholder="Paste the full job description here..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <Button variant="primary" size="md" onClick={generate} disabled={loading || !jdText.trim()}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating your resume...</>
          ) : 'Generate resume'}
        </Button>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="ghost" size="sm" onClick={generate}>Try again</Button>
          </div>
        )}

        {generated && (
          <div className="space-y-5 border-t border-gray-200 pt-5">
            {/* Summary */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Summary</label>
              <textarea
                value={content.summary}
                onChange={e => setContent({ ...content, summary: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Skills</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {content.skills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs text-indigo-700">
                    {s}
                    <button type="button" onClick={() => setContent({ ...content, skills: content.skills.filter((_, idx) => idx !== i) })}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkillTag(skillInput); } }}
                  placeholder="Add skill..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="button" onClick={() => addSkillTag(skillInput)} className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50">
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Projects */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Projects</label>
              {content.projects.map((proj, i) => (
                <div key={i} className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                  <input
                    value={proj.name}
                    onChange={e => updateProject(i, 'name', e.target.value)}
                    placeholder="Project name"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    value={proj.description}
                    onChange={e => updateProject(i, 'description', e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                  <div className="flex flex-wrap gap-1">
                    {proj.tech?.map((t, ti) => (
                      <span key={ti} className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                        {t}
                        <button type="button" onClick={() => removeProjectTech(i, ti)}><X className="h-2.5 w-2.5" /></button>
                      </span>
                    ))}
                    <input
                      placeholder="Add tech..."
                      className="rounded border border-gray-300 px-2 py-0.5 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addProjectTech(i, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setContent({ ...content, projects: [...content.projects, { name: '', description: '', tech: [] }] })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add project
              </Button>
            </div>

            {/* Education */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Education</label>
              {content.education.map((edu, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                  {(['degree', 'college', 'year'] as const).map(field => (
                    <input
                      key={field}
                      value={edu[field]}
                      onChange={e => {
                        const ed = [...content.education];
                        ed[i] = { ...ed[i], [field]: e.target.value };
                        setContent({ ...content, education: ed });
                      }}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="primary" onClick={saveChanges} disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
              {saved && <span className="text-sm text-green-600">Saved!</span>}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT — Preview */}
      <div className="space-y-3">
        <div className="flex justify-end">
          <ExportButton />
        </div>
        <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <ResumePreview content={content} profile={profile} />
        </div>
      </div>
    </div>
  );
}
