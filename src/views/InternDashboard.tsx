import { Task } from '@/types/task';

interface InternDashboardProps {
  tasks: Task[];
}

export default function InternDashboard({ tasks }: InternDashboardProps) {
  const internTasks = tasks.filter(t => t.assignee === 'Intern');
  const completedTasks = internTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = internTasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = internTasks.filter(t => t.status === 'todo').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Intern Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">My Tasks</h3>
          <p className="text-3xl font-bold text-primary">{internTasks.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">{inProgressTasks + todoTasks}</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">My Tasks</h3>
        <div className="space-y-2">
          {internTasks.map(task => (
            <div key={task.id} className="flex justify-between items-center p-2 border rounded">
              <div>
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-sm text-muted-foreground">{task.status}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                task.status === 'done' ? 'bg-green-100 text-green-800' :
                task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}