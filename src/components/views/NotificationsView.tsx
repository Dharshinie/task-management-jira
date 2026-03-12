import { Task } from '@/types/task';
import { Bell, CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';

interface NotificationsViewProps {
  tasks: Task[];
}

function isOverdue(dateText: string): boolean {
  if (!dateText) return false;
  const due = new Date(dateText);
  if (Number.isNaN(due.getTime())) return false;
  return due < new Date();
}

export default function NotificationsView({ tasks }: NotificationsViewProps) {
  const overdue = tasks.filter((task) => task.status !== 'done' && isOverdue(task.dueDate));
  const inProgress = tasks.filter((task) => task.status === 'in-progress');
  const completed = tasks.filter((task) => task.status === 'done').slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Required details for task alerts and updates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Overdue Tasks
          </div>
          <p className="text-2xl font-semibold mt-2 text-foreground">{overdue.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock3 className="w-4 h-4 text-primary" />
            In Progress
          </div>
          <p className="text-2xl font-semibold mt-2 text-foreground">{inProgress.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--kanban-done-bar))]" />
            Recently Done
          </div>
          <p className="text-2xl font-semibold mt-2 text-foreground">{completed.length}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Latest Notification Details</h3>
        </div>
        <div className="p-4 space-y-3">
          {tasks.slice(0, 6).map((task) => (
            <div key={task.id} className="p-3 border border-border rounded-md">
              <p className="text-sm font-medium text-foreground">{task.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Status: {task.status} | Priority: {task.priority} | Assignee: {task.assignee} | Due: {task.dueDate || 'N/A'}
              </p>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No notifications available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
