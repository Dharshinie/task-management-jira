import { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { toast } from '@/hooks/use-toast';

interface FormViewProps {
  onAdd: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export default function FormView({ onAdd }: FormViewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, description, assignee: assignee || 'Unassigned', dueDate, status, priority, projectId: 'proj-1' });
    setTitle(''); setDescription(''); setAssignee(''); setDueDate(''); setStatus('todo'); setPriority('medium');
    toast({ title: 'Task created', description: `"${title}" has been added.` });
  }

  const inputClass = "w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-semibold text-foreground">Create Task</h2>
      <div className="bg-card border border-border rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Title <span className="text-destructive">*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title" className={inputClass} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task..." rows={4} className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Assignee</label>
              <input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Assign to..." className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={inputClass}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={inputClass}>
                <option value="highest">Highest</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="lowest">Lowest</option>
              </select>
            </div>
          </div>
          <button type="submit" className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity">
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
}
