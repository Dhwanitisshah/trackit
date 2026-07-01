'use client';

import { ExternalLink, Plus } from 'lucide-react';
import SkillMatchBadge from './SkillMatchBadge';
import Button from '@/components/ui/Button';
import type { JobListing } from '@/lib/types';

interface JobCardProps {
  listing: JobListing;
  onAddToTracker: (listing: JobListing) => void;
}

export default function JobCard({ listing, onAddToTracker }: JobCardProps) {
  const snippet =
    listing.description.length > 150
      ? listing.description.slice(0, 150) + '...'
      : listing.description;

  const visibleMissing = listing.missingSkills.slice(0, 3);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{listing.title}</p>
          <p className="text-sm text-gray-500">{listing.company} · {listing.location}</p>
        </div>
        <SkillMatchBadge score={listing.matchScore} />
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{snippet}</p>

      <div className="flex flex-wrap gap-1.5">
        {listing.matchedSkills.map(skill => (
          <span key={skill} className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            {skill}
          </span>
        ))}
        {visibleMissing.map(skill => (
          <span key={skill} className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
            {skill}
          </span>
        ))}
        {listing.missingSkills.length > 3 && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            +{listing.missingSkills.length - 3} more missing
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View listing <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddToTracker(listing)}
          className="ml-auto"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add to tracker
        </Button>
      </div>
    </div>
  );
}
