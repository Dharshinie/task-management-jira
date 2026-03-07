import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskStatus, TaskPriority } from '@/types/task';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  // allow promise return since the store will write to Firestore
  onAdd: (task: { title: string; description: string; status: TaskStatus; projectId: string; assignee: string; dueDate: string; priority: TaskPriority }) => void | Promise<void>;
}

export default function AddTaskDialog({ open, onClose, onAdd }: AddTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, description, status, projectId: 'proj-1', assignee: assignee || 'Unassigned', dueDate, priority });
    setTitle(''); setDescription(''); setAssignee(''); setDueDate(''); setStatus('todo'); setPriority('medium');
    onClose();
  }

  const inputClass = "mt-1 w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Task title" required />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Add a description..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Assignee</label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputClass}>
                <option value="">Unassigned</option>
                <option value="Admin">Admin</option>
                <option value="TL">TL</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={inputClass}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
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
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">Create Task</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
