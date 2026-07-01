import type { ResumeContent, Profile } from '@/lib/types';

interface ResumePreviewProps {
  content: ResumeContent;
  profile: Profile | null;
}

export default function ResumePreview({ content, profile }: ResumePreviewProps) {
  return (
    <div
      id="resume-preview"
      className="bg-white text-gray-900 font-sans text-sm leading-relaxed p-8 min-h-[900px]"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-3 mb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {profile?.full_name ?? 'Your Name'}
        </h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600">
          {profile?.college && <span>{profile.college}</span>}
          {profile?.location && <span>{profile.location}</span>}
          {profile?.github_url && (
            <a href={profile.github_url} className="underline">{profile.github_url.replace('https://', '')}</a>
          )}
          {profile?.linkedin_url && (
            <a href={profile.linkedin_url} className="underline">{profile.linkedin_url.replace('https://', '')}</a>
          )}
          {profile?.portfolio_url && (
            <a href={profile.portfolio_url} className="underline">{profile.portfolio_url.replace('https://', '')}</a>
          )}
        </div>
      </div>

      {/* Summary */}
      {content.summary && (
        <Section title="Summary">
          <p className="text-sm text-gray-700">{content.summary}</p>
        </Section>
      )}

      {/* Skills */}
      {content.skills?.length > 0 && (
        <Section title="Skills">
          <p className="text-sm text-gray-700">{content.skills.join(', ')}</p>
        </Section>
      )}

      {/* Experience */}
      {content.experience?.length > 0 && (
        <Section title="Experience">
          {content.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <span className="font-semibold">{exp.title}</span>
                <span className="text-xs text-gray-500">{exp.duration}</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{exp.company}</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {exp.bullets.map((b, j) => (
                  <li key={j} className="text-sm text-gray-700">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {content.projects?.length > 0 && (
        <Section title="Projects">
          {content.projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <span className="font-semibold">{proj.name}</span>
              {proj.tech?.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">({proj.tech.join(', ')})</span>
              )}
              <p className="text-sm text-gray-700 mt-0.5">{proj.description}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {content.education?.length > 0 && (
        <Section title="Education">
          {content.education.map((edu, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span><span className="font-semibold">{edu.degree}</span>, {edu.college}</span>
              <span className="text-gray-500">{edu.year}</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-300 pb-0.5 mb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}
