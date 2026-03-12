import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskStatus, TaskPriority, Task, Project } from '@/types/task';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UserProfile } from '@/types/user';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  // allow promise return since the store will write to Firestore
  onAdd: (
    task: Omit<Task, 'id' | 'createdAt' | 'userId'> & { assigneeId?: string }
  ) => void | Promise<void>;
  /**
   * Optional list of users to show in the assignee dropdown. When omitted
   * the dialog fetches all users from Firestore.
   */
  users?: UserProfile[];
  /**
   * Optional project list. If provided a dropdown will let the creator
   * choose which project the task belongs to. Otherwise a static value is
   * used (currently hardcoded to "proj-1").
   */
  projects?: Project[];
}

export default function AddTaskDialog(props: AddTaskDialogProps) {
  const { open, onClose, onAdd, users: propUsers, projects: propProjects } = props;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [users, setUsers] = useState<UserProfile[]>(propUsers || []);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [projectId, setProjectId] = useState<string>(
    propProjects && propProjects.length > 0 ? propProjects[0].id : 'proj-1'
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Omit<Task, 'id' | 'createdAt' | 'userId'> & { assigneeId?: string } = {
      title,
      description,
      status,
      projectId,
      assignee: assignee || 'Unassigned',
      dueDate,
      priority,
      assigneeId,
    };

    onAdd(newTask);

    // Reset form
    setTitle('');
    setDescription('');
    setAssignee('');
    setAssigneeId(undefined);
    setDueDate('');
    setStatus('todo');
    setPriority('medium');
    onClose();
  }

  const inputClass = "mt-1 w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring";

  useEffect(() => {
    // If team members were passed as a prop, always use them
    // whenever they update
    if (propUsers && propUsers.length > 0) {
      setUsers(propUsers);
      return;
    }
    
    // only fetch all users from Firestore if no users
    // were provided and we don't have them yet
    if (users.length === 0 && (!propUsers || propUsers.length === 0)) {
      (async () => {
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          const allUsers = usersSnap.docs.map(
            (d) => ({ ...d.data(), uid: d.id } as UserProfile)
          );
          setUsers(allUsers);
        } catch (err) {
          console.error('Failed to load users for assignee list', err);
        }
      })();
    }
  }, [propUsers, users.length]);

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
            {propProjects && propProjects.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground">Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className={inputClass}
                >
                  {propProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">Assignee</label>
              <select
                value={assigneeId || ''}
                onChange={(e) => {
                  const uid = e.target.value;
                  setAssigneeId(uid || undefined);
                  const user = users.find(u => u.uid === uid);
                  setAssignee(user ? user.email : '');
                }}
                className={inputClass}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.uid} value={u.uid}>{u.email} ({u.role})</option>
                ))}
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
