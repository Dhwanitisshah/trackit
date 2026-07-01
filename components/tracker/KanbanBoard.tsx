'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import KanbanColumn from './KanbanColumn';
import AddApplicationModal from './AddApplicationModal';
import Button from '@/components/ui/Button';
import type { Application, Status } from '@/lib/types';

const COLUMNS: Status[] = ['Applied', 'OA/Screen', 'Interview', 'Offer', 'Rejected'];

export default function KanbanBoard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    setApplications((data as Application[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId as Status;

    setApplications(prev =>
      prev.map(app => app.id === draggableId ? { ...app, status: newStatus } : app)
    );

    const supabase = createClient();
    await supabase
      .from('applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', draggableId);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading applications...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add Application
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              applications={applications.filter(a => a.status === status)}
            />
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <AddApplicationModal
          onClose={() => setShowModal(false)}
          onAdded={fetchApplications}
        />
      )}
    </>
  );
}
