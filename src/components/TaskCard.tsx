import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { Calendar, Paperclip, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card rounded-lg border border-border p-3.5 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow group ${
        isDragging ? 'opacity-50 shadow-lg rotate-2' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-foreground leading-snug pr-2">{task.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {task.attachmentURL && <Paperclip className="w-3 h-3 text-muted-foreground" />}
        </div>

        <Avatar className="w-6 h-6">
          <AvatarFallback className="text-[10px] font-medium bg-accent text-accent-foreground">
            {getInitials(task.assignee)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
