import { useMemo } from 'react';
import { Task } from '@/types/task';
import { CheckCircle2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface TimelineViewProps {
  tasks: Task[];
}

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAY_WIDTH = 12;

function getStatusColor(status: string) {
  if (status === 'done') return 'hsl(var(--kanban-done-bar))';
  if (status === 'in-progress') return 'hsl(var(--primary))';
  return 'hsl(var(--primary) / 0.65)';
}

export default function TimelineView({ tasks }: TimelineViewProps) {
  const { months, startDate, totalDays } = useMemo(() => {
    const dates = tasks.flatMap((t) => {
      const d = new Date(t.createdAt);
      const due = new Date(t.dueDate);
      return [d, due];
    });
    if (dates.length === 0) {
      const now = new Date();
      return { months: [], startDate: now, totalDays: 90 };
    }

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Extend range by 2 weeks on each side
    const start = new Date(minDate);
    start.setDate(1); // Start of month
    const end = new Date(maxDate);
    end.setMonth(end.getMonth() + 2);
    end.setDate(0); // End of next month

    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Build month markers
    const months: { name: string; offsetDays: number; days: number }[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const offsetDays = Math.floor((cursor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      months.push({ name: MONTH_NAMES[month], offsetDays, days: daysInMonth });
      cursor.setMonth(cursor.getMonth() + 1);
      cursor.setDate(1);
    }

    return { months, startDate: start, totalDays };
  }, [tasks]);

  const todayOffset = useMemo(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [startDate]);

  const totalWidth = totalDays * DAY_WIDTH;

  const taskRows = useMemo(() => {
    return tasks.map((task) => {
      const created = new Date(task.createdAt);
      const due = new Date(task.dueDate);
      const startOffset = Math.floor((created.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const duration = Math.max(Math.floor((due.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)), 3);
      return { task, startOffset, duration };
    });
  }, [tasks, startDate]);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">Timeline</h2>
        <span className="text-sm text-muted-foreground font-medium">Today</span>
      </div>

      <ScrollArea className="w-full">
        <div className="flex">
          {/* Left label column */}
          <div className="min-w-[280px] border-r border-border bg-card z-10 sticky left-0">
            {/* Month header spacer */}
            <div className="h-10 border-b border-border" />
            {/* Task labels */}
            {taskRows.map(({ task }) => (
              <div
                key={task.id}
                className="h-11 flex items-center gap-3 px-4 border-b border-border hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs font-mono text-muted-foreground shrink-0 w-12">
                  PM-{task.id.slice(0, 2).toUpperCase()}
                </span>
                {task.status === 'done' && (
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--kanban-done-bar))' }} />
                )}
                <span className="text-sm text-foreground truncate">{task.title}</span>
              </div>
            ))}
          </div>

          {/* Timeline chart area */}
          <div className="relative" style={{ width: totalWidth, minWidth: totalWidth }}>
            {/* Month headers */}
            <div className="h-10 border-b border-border flex relative">
              {months.map((m, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full flex items-center justify-center text-xs font-semibold text-muted-foreground border-l border-border"
                  style={{
                    left: m.offsetDays * DAY_WIDTH,
                    width: m.days * DAY_WIDTH,
                  }}
                >
                  {m.name}
                </div>
              ))}
            </div>

            {/* Grid lines */}
            {months.map((m, i) => (
              <div
                key={i}
                className="absolute top-10 bottom-0 border-l border-border"
                style={{ left: m.offsetDays * DAY_WIDTH }}
              />
            ))}

            {/* Today line */}
            {todayOffset >= 0 && todayOffset <= totalDays && (
              <div
                className="absolute top-0 bottom-0 w-0.5 z-10"
                style={{ left: todayOffset * DAY_WIDTH, backgroundColor: 'hsl(var(--timeline-today))' }}
              />
            )}

            {/* Task bars */}
            {taskRows.map(({ task, startOffset, duration }, index) => (
              <div
                key={task.id}
                className="h-11 relative border-b border-border"
              >
                <div
                  className="absolute top-2 h-7 rounded-sm transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    left: startOffset * DAY_WIDTH,
                    width: duration * DAY_WIDTH,
                    backgroundColor: getStatusColor(task.status),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
