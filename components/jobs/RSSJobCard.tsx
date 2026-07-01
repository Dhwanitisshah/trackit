'use client';

import { ExternalLink, Plus, Clock } from 'lucide-react';
import SkillMatchBadge from './SkillMatchBadge';
import Button from '@/components/ui/Button';
import type { RSSJobListing } from '@/lib/types';
import clsx from 'clsx';

interface RSSJobCardProps {
  listing: RSSJobListing;
  onAddToTracker: (listing: RSSJobListing) => void;
}

const sourceStyles = {
  internshala: 'bg-green-100 text-green-700 border-green-200',
  freshersworld: 'bg-blue-100 text-blue-700 border-blue-200',
};

const sourceLabels = {
  internshala: 'Internshala',
  freshersworld: 'Freshersworld',
};

export default function RSSJobCard({ listing, onAddToTracker }: RSSJobCardProps) {
  const snippet =
    listing.description.length > 180
      ? listing.description.slice(0, 180) + '...'
      : listing.description;

  const visibleMatched = listing.matchedSkills.slice(0, 4);
  const visibleMissing = listing.missingSkills.slice(0, 3);
  const noMatch = listing.matchScore === 0 && listing.matchedSkills.length === 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
            {listing.title}
          </p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <span
              className={clsx(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                sourceStyles[listing.source]
              )}
            >
              {sourceLabels[listing.source]}
            </span>
            {listing.company && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{listing.company}</span>
            )}
          </div>
        </div>
        <SkillMatchBadge score={listing.matchScore} />
      </div>

      {snippet && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{snippet}</p>
      )}

      {listing.pubDate && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          {listing.pubDate}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {visibleMatched.map(skill => (
          <span key={skill} className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            {skill}
          </span>
        ))}
        {visibleMissing.map(skill => (
          <span key={skill} className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
            {skill}
          </span>
        ))}
      </div>

      {noMatch && listing.matchedSkills.length === 0 && (
        <p className="text-xs text-gray-400 italic">
          Skills not detected in listing — may still be relevant
        </p>
      )}

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
