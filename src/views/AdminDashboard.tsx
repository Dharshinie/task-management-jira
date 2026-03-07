import { Task } from '@/types/task';

interface AdminDashboardProps {
  tasks: Task[];
}

export default function AdminDashboard({ tasks }: AdminDashboardProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const tasksByAssignee = tasks.reduce((acc, task) => {
    acc[task.assignee] = (acc[task.assignee] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Total Tasks</h3>
          <p className="text-3xl font-bold text-primary">{totalTasks}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">In Progress</h3>
          <p className="text-3xl font-bold text-yellow-600">{inProgressTasks}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">To Do</h3>
          <p className="text-3xl font-bold text-blue-600">{todoTasks}</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Tasks by Assignee</h3>
        <div className="space-y-2">
          {Object.entries(tasksByAssignee).map(([assignee, count]) => (
            <div key={assignee} className="flex justify-between">
              <span>{assignee || 'Unassigned'}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}