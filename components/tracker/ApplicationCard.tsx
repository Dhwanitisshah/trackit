'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import Badge from '@/components/ui/Badge';
import type { Application } from '@/lib/types';

interface ApplicationCardProps {
  application: Application;
  index: number;
}

export default function ApplicationCard({ application, index }: ApplicationCardProps) {
  const isOverdue =
    application.deadline && new Date(application.deadline) < new Date();

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-lg border bg-white p-3 shadow-sm transition-shadow ${
            snapshot.isDragging ? 'shadow-lg rotate-1' : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{application.company}</p>
              <p className="text-sm text-gray-500 truncate">{application.role}</p>
            </div>
            <Badge status={application.status} />
          </div>

          {application.deadline && (
            <p className={`mt-2 text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
              Due: {new Date(application.deadline).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          )}

          {application.next_action && (
            <p className="mt-1 text-xs text-gray-400 truncate">
              Next: {application.next_action}
            </p>
          )}

          <div className="mt-2 flex justify-end">
            <Link
              href={`/tracker/${application.id}`}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
            >
              View <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </Draggable>
  );
}
