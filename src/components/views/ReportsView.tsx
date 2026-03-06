import { Task } from '@/types/task';
import { useMemo } from 'react';

interface ReportsViewProps {
  tasks: Task[];
}

export default function ReportsView({ tasks }: ReportsViewProps) {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const done = tasks.filter((t) => t.status === 'done').length;

  const assigneeStats = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    tasks.forEach((t) => {
      if (!map[t.assignee]) map[t.assignee] = { total: 0, done: 0 };
      map[t.assignee].total++;
      if (t.status === 'done') map[t.assignee].done++;
    });
    return Object.entries(map).map(([name, stats]) => ({ name, ...stats }));
  }, [tasks]);

  const barData = [
    { label: 'To Do', value: todo, color: 'hsl(var(--primary) / 0.4)' },
    { label: 'In Progress', value: inProgress, color: 'hsl(var(--primary))' },
    { label: 'Done', value: done, color: 'hsl(var(--kanban-done-bar))' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Reports</h2>

      {/* Status distribution */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Status Distribution</h3>
        <div className="flex gap-1 h-8 rounded overflow-hidden">
          {barData.map((b) => (
            b.value > 0 && (
              <div
                key={b.label}
                className="flex items-center justify-center text-[10px] font-semibold text-primary-foreground transition-all"
                style={{ width: `${(b.value / total) * 100}%`, backgroundColor: b.color }}
              >
                {b.value}
              </div>
            )
          ))}
        </div>
        <div className="flex gap-5">
          {barData.map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: b.color }} />
              <span className="text-xs text-muted-foreground">{b.label} ({b.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team workload */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Team Workload</h3>
        <div className="space-y-3">
          {assigneeStats.map((a) => (
            <div key={a.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">{a.name}</span>
                <span className="text-muted-foreground">{a.done}/{a.total} done</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(a.done / a.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
