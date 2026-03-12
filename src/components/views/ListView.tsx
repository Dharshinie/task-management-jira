import { useState, useRef, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { Trash2, ArrowUpDown, Filter, ChevronUp, ChevronDown, Minus, Plus, CheckSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ListViewProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  openFiltersOnLoad?: boolean;
}

type SortKey = 'title' | 'status' | 'assignee' | 'dueDate' | 'priority';

const priorityOrder: Record<TaskPriority, number> = {
  highest: 0, high: 1, medium: 2, low: 3, lowest: 4,
};

const statusLabel: Record<TaskStatus, string> = {
  'todo': 'TO DO',
  'in-progress': 'IN PROGRESS',
  'done': 'DONE',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function PriorityIcon({ priority }: { priority: TaskPriority }) {
  switch (priority) {
    case 'highest':
      return <span className="flex items-center gap-1 text-destructive"><ChevronUp className="w-4 h-4" /><ChevronUp className="w-4 h-4 -ml-3" /> Highest</span>;
    case 'high':
      return <span className="flex items-center gap-1 text-destructive"><ChevronUp className="w-4 h-4" /> High</span>;
    case 'medium':
      return <span className="flex items-center gap-1 text-[hsl(var(--timeline-today))]"><Minus className="w-4 h-4" /> Medium</span>;
    case 'low':
      return <span className="flex items-center gap-1 text-primary"><ChevronDown className="w-4 h-4" /> Low</span>;
    case 'lowest':
      return <span className="flex items-center gap-1 text-primary"><ChevronDown className="w-4 h-4" /><ChevronDown className="w-4 h-4 -ml-3" /> Lowest</span>;
  }
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const base = "text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide";
  switch (status) {
    case 'todo':
      return <span className={`${base} bg-muted text-muted-foreground`}>{statusLabel[status]}</span>;
    case 'in-progress':
      return <span className={`${base} bg-accent text-primary`}>{statusLabel[status]}</span>;
    case 'done':
      return <span className={`${base} bg-[hsl(var(--kanban-done))] text-[hsl(var(--kanban-done-bar))]`}>{statusLabel[status]}</span>;
  }
}

export default function ListView({ tasks, onDeleteTask, onUpdateStatus, openFiltersOnLoad = false }: ListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (openFiltersOnLoad) {
      setFilterOpen(true);
    }
  }, [openFiltersOnLoad]);

  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignee)));

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && t.assignee !== assigneeFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === 'priority') return (priorityOrder[a.priority] - priorityOrder[b.priority]) * dir;
    return (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '') * dir;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  const activeFilters = [statusFilter, priorityFilter, assigneeFilter].filter(f => f !== 'all').length;

  const headers: { key: SortKey; label: string; icon?: React.ReactNode }[] = [
    { key: 'title', label: 'Summary' },
    { key: 'status', label: 'Status' },
    { key: 'assignee', label: 'Assignee' },
    { key: 'dueDate', label: 'Due date' },
    { key: 'priority', label: 'Priority' },
  ];

  const selectClass = "w-full text-xs px-2 py-1.5 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">List</h2>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground border border-border rounded-sm hover:bg-muted transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilters > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilters}</span>
            )}
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50 p-4 space-y-3">
              <div className="text-sm font-semibold text-foreground mb-2">Filter tasks</div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TaskStatus | 'all')} className={selectClass}>
                  <option value="all">All statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'all')} className={selectClass}>
                  <option value="all">All priorities</option>
                  <option value="highest">Highest</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="lowest">Lowest</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Assignee</label>
                <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className={selectClass}>
                  <option value="all">All assignees</option>
                  {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <button
                onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setAssigneeFilter('all'); }}
                className="text-xs text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-10">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-20">
                <span className="flex items-center gap-1"># Key</span>
              </th>
              {headers.map(h => (
                <th key={h.key} className="text-left px-4 py-3">
                  <button onClick={() => toggleSort(h.key)} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {h.label}
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((task, i) => (
              <tr key={task.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <CheckSquare className="w-4 h-4 text-primary" />
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">TASK-{task.id.length > 4 ? task.id.slice(0, 2).toUpperCase() : task.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{task.title}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[10px] font-medium bg-accent text-accent-foreground">
                        {getInitials(task.assignee)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{task.assignee}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{task.dueDate}</td>
                <td className="px-4 py-3">
                  <PriorityIcon priority={task.priority} />
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => onDeleteTask(task.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">No tasks match filters</div>
        )}
      </div>

      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pl-1">
        <Plus className="w-4 h-4" />
        Add item
      </button>
    </div>
  );
}
