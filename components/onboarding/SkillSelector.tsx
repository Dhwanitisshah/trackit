'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import clsx from 'clsx';

const PRESET_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js',
  'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Git', 'C++', 'Java',
  'Machine Learning', 'Data Analysis', 'Figma', 'REST APIs', 'GraphQL',
  'AWS', 'Linux',
];

interface SkillSelectorProps {
  selected: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillSelector({ selected, onChange }: SkillSelectorProps) {
  const [customInput, setCustomInput] = useState('');

  function toggle(skill: string) {
    onChange(
      selected.includes(skill)
        ? selected.filter(s => s !== skill)
        : [...selected, skill]
    );
  }

  function addCustom() {
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setCustomInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESET_SKILLS.map(skill => (
          <button
            key={skill}
            type="button"
            onClick={() => toggle(skill)}
            className={clsx(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              selected.includes(skill)
                ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
            )}
          >
            {skill}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom skill..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={addCustom}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(skill => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white"
            >
              {skill}
              <button type="button" onClick={() => toggle(skill)} className="ml-0.5 hover:opacity-75">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
