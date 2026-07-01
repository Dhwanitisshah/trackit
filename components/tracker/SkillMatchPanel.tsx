'use client';

import { Check, X, Zap } from 'lucide-react';

interface SkillMatchPanelProps {
  jdText: string;
  userSkills: string[];
}

export default function SkillMatchPanel({ jdText, userSkills }: SkillMatchPanelProps) {
  if (!jdText.trim()) {
    return (
      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900">Skill match</h2>
        </div>
        <p className="text-sm text-gray-500">Add a JD link or notes to see skill match.</p>
      </div>
    );
  }

  const lower = jdText.toLowerCase();

  const matched = userSkills.filter(skill =>
    lower.includes(skill.toLowerCase().replace(/\./g, '').replace(/\+/g, 'plus'))
    || lower.includes(skill.toLowerCase())
  );
  const unmatched = userSkills.filter(s => !matched.includes(s));
  const score =
    userSkills.length > 0 ? Math.round((matched.length / userSkills.length) * 100) : 0;

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-indigo-500" />
        <h2 className="text-lg font-semibold text-gray-900">Skill match</h2>
        <span className="ml-auto text-sm font-semibold text-gray-700">{score}%</span>
      </div>

      <div className="mb-4 h-2.5 w-full rounded-full bg-gray-200">
        <div
          className={`h-2.5 rounded-full transition-all ${
            score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-400' : 'bg-red-400'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {userSkills.length === 0 ? (
        <p className="text-sm text-gray-500">No skills in your profile yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {matched.map(skill => (
            <div key={skill} className="flex items-center gap-1.5 text-sm">
              <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">{skill}</span>
            </div>
          ))}
          {unmatched.map(skill => (
            <div key={skill} className="flex items-center gap-1.5 text-sm">
              <X className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
              <span className="text-gray-400">{skill}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
