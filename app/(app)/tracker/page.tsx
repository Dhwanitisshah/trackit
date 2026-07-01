import KanbanBoard from '@/components/tracker/KanbanBoard';

export default function TrackerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
      <p className="mt-1 text-gray-500">Drag cards between columns to update status.</p>
      <div className="mt-6">
        <KanbanBoard />
      </div>
    </div>
  );
}
