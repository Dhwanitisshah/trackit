import clsx from 'clsx';

interface SkillMatchBadgeProps {
  score: number;
}

export default function SkillMatchBadge({ score }: SkillMatchBadgeProps) {
  const { label, className } =
    score <= 40
      ? { label: 'Low match', className: 'bg-red-100 text-red-700 border-red-200' }
      : score <= 70
      ? { label: 'Good fit', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
      : { label: 'Strong match', className: 'bg-green-100 text-green-700 border-green-200' };

  return (
    <span className={clsx('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', className)}>
      {label} · {score}%
    </span>
  );
}
