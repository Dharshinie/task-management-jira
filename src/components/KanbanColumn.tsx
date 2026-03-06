import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/task';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
}

const columnColors: Record<TaskStatus, string> = {
  'todo': 'bg-kanban-todo',
  'in-progress': 'bg-kanban-progress',
  'done': 'bg-kanban-done',
};

const badgeColors: Record<TaskStatus, string> = {
  'todo': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-accent text-accent-foreground',
  'done': 'bg-kanban-done text-foreground',
};

export default function KanbanColumn({ id, title, tasks, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-[280px] max-w-[380px]">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${badgeColors[id]}`}>
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`rounded-xl p-2 min-h-[calc(100vh-180px)] transition-colors ${columnColors[id]} ${
          isOver ? 'ring-2 ring-primary/30' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
