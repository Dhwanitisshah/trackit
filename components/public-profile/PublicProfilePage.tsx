import { Globe, ExternalLink } from 'lucide-react';
import SkillGrid from './SkillGrid';
import type { Profile, ResumeContent } from '@/lib/types';

interface PublicProfilePageProps {
  profile: Profile;
  skills: string[];
  resumeContent: ResumeContent | null;
}

export default function PublicProfilePage({ profile, skills, resumeContent }: PublicProfilePageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">{profile.full_name ?? 'Unknown'}</h1>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            {profile.college && <span>{profile.college}</span>}
            {profile.year && <span>{profile.year}</span>}
            {profile.discipline && <span>{profile.discipline}</span>}
            {profile.location && <span>{profile.location}</span>}
          </div>

          <div className="mt-4 flex gap-3">
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
                <ExternalLink className="h-4 w-4" /> GitHub
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
                <ExternalLink className="h-4 w-4" /> LinkedIn
              </a>
            )}
            {profile.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
                <Globe className="h-4 w-4" /> Portfolio
              </a>
            )}
          </div>

          {profile.bio && (
            <p className="mt-4 text-gray-600 leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
            <SkillGrid skills={skills} />
          </section>
        )}

        {/* Projects */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Projects</h2>
          {resumeContent?.projects?.length ? (
            <div className="space-y-4">
              {resumeContent.projects.map((proj, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="font-semibold text-gray-900">{proj.name}</p>
                  <p className="mt-1 text-sm text-gray-600">{proj.description}</p>
                  {proj.tech?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {proj.tech.map(t => (
                        <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No projects added yet</p>
          )}
        </section>

        <footer className="text-center text-xs text-gray-400 pt-4">
          Built with <span className="font-medium text-indigo-500">TrackIt</span>
        </footer>
      </div>
    </div>
  );
}
