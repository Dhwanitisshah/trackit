'use client';

import { Droppable } from '@hello-pangea/dnd';
import ApplicationCard from './ApplicationCard';
import type { Application, Status } from '@/lib/types';

interface KanbanColumnProps {
  status: Status;
  applications: Application[];
}

const columnColors: Record<Status, string> = {
  'Applied': 'border-blue-200 bg-blue-50',
  'OA/Screen': 'border-purple-200 bg-purple-50',
  'Interview': 'border-yellow-200 bg-yellow-50',
  'Offer': 'border-green-200 bg-green-50',
  'Rejected': 'border-red-200 bg-red-50',
};

const headerColors: Record<Status, string> = {
  'Applied': 'text-blue-700',
  'OA/Screen': 'text-purple-700',
  'Interview': 'text-yellow-700',
  'Offer': 'text-green-700',
  'Rejected': 'text-red-700',
};

export default function KanbanColumn({ status, applications }: KanbanColumnProps) {
  return (
    <div className={`flex flex-col rounded-xl border-2 ${columnColors[status]} min-w-[240px] w-64`}>
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className={`text-sm font-semibold ${headerColors[status]}`}>{status}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 shadow-sm">
          {applications.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-2 p-2 min-h-[120px] transition-colors rounded-b-xl ${
              snapshot.isDraggingOver ? 'bg-white/60' : ''
            }`}
          >
            {applications.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">No applications here</p>
            ) : (
              applications.map((app, index) => (
                <ApplicationCard key={app.id} application={app} index={index} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
