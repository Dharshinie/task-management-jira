import { useMemo, useState } from 'react';
import { Task } from '@/types/task';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      const d = t.dueDate; // YYYY-MM-DD
      if (!map[d]) map[d] = [];
      map[d].push(t);
    });
    return map;
  }, [tasks]);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Calendar</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-semibold text-foreground min-w-[140px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAY_NAMES.map((d) => (
            <div key={d} className="px-2 py-2 text-xs font-semibold text-muted-foreground text-center">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
            const dayTasks = day ? (tasksByDate[dateStr] || []) : [];

            return (
              <div
                key={i}
                className={`min-h-[100px] border-b border-r border-border p-1.5 ${
                  day ? 'bg-card' : 'bg-muted/30'
                }`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground'
                    }`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayTasks.slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${
                            t.status === 'done'
                              ? 'bg-accent text-accent-foreground'
                              : t.status === 'in-progress'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[10px] text-muted-foreground pl-1">+{dayTasks.length - 3} more</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
