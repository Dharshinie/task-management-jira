import { Task } from '@/types/task';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

interface SummaryViewProps {
  tasks: Task[];
}

export default function SummaryView({ tasks }: SummaryViewProps) {
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const overdue = tasks.filter((t) => {
    const due = new Date(t.dueDate);
    return due < new Date() && t.status !== 'done';
  }).length;

  const stats = [
    { label: 'To Do', value: todo, icon: ListTodo, color: 'hsl(var(--primary) / 0.65)' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'hsl(var(--primary))' },
    { label: 'Done', value: done, icon: CheckCircle2, color: 'hsl(var(--kanban-done-bar))' },
    { label: 'Completion', value: `${completionRate}%`, icon: TrendingUp, color: 'hsl(var(--primary))' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Project Summary</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <span className="text-2xl font-bold text-foreground">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Overall Progress</h3>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{done} of {total} tasks completed</p>
      </div>

      {/* Recent activity */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Task Breakdown</h3>
        <div className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-10">PM-{task.id.slice(0, 2).toUpperCase()}</span>
                <span className="text-sm text-foreground">{task.title}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                task.status === 'done' ? 'bg-accent text-accent-foreground' :
                task.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                'bg-muted text-muted-foreground'
              }`}>
                {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {overdue > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm font-medium text-destructive">{overdue} overdue task{overdue > 1 ? 's' : ''} need attention</p>
        </div>
      )}
    </div>
  );
}
