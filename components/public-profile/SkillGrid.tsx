interface SkillGridProps {
  skills: string[];
}

export default function SkillGrid({ skills }: SkillGridProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map(skill => (
        <span
          key={skill}
          className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
