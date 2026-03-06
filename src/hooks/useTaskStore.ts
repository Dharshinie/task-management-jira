import { useState, useCallback } from 'react';
import { Task, TaskStatus } from '@/types/task';

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Create pitch deck',
    description: 'Initialize the Git repo and configure CI/CD pipeline for the project.',
    status: 'todo',
    projectId: 'proj-1',
    assignee: 'Alana Song',
    dueDate: '2026-03-10',
    priority: 'highest',
    createdAt: '2026-03-01',
  },
  {
    id: '2',
    title: 'Finish up review and feedback gathering',
    description: 'Create ERD and define table relationships for the core data models.',
    status: 'todo',
    projectId: 'proj-1',
    assignee: 'Alana Song',
    dueDate: '2026-03-12',
    priority: 'medium',
    createdAt: '2026-03-01',
  },
  {
    id: '3',
    title: 'Competitive analysis',
    description: 'Add login, signup, and password reset flows with JWT tokens.',
    status: 'in-progress',
    projectId: 'proj-1',
    assignee: 'Alana Song',
    dueDate: '2026-03-08',
    priority: 'low',
    createdAt: '2026-02-28',
  },
  {
    id: '4',
    title: 'Gather information for website',
    description: 'Build REST API for CRUD operations on tasks and projects.',
    status: 'in-progress',
    projectId: 'proj-1',
    assignee: 'Alana Song',
    dueDate: '2026-03-15',
    priority: 'low',
    createdAt: '2026-03-02',
  },
  {
    id: '5',
    title: 'Source and create images',
    description: 'Source imagery and create graphics for marketing materials.',
    status: 'in-progress',
    projectId: 'proj-1',
    assignee: 'Alana Song',
    dueDate: '2026-03-03',
    priority: 'medium',
    createdAt: '2026-02-25',
  },
  {
    id: '6',
    title: 'Submit creative brief',
    description: 'Finalize and submit the creative brief for approval.',
    status: 'done',
    projectId: 'proj-1',
    assignee: 'Alana Song',
    dueDate: '2026-02-28',
    priority: 'low',
    createdAt: '2026-02-20',
  },
  {
    id: '7',
    title: 'Audit current experience',
    description: 'Perform a comprehensive audit of the current user experience.',
    status: 'done',
    projectId: 'proj-1',
    assignee: 'Alana Song',
    dueDate: '2026-02-25',
    priority: 'low',
    createdAt: '2026-02-18',
  },
];

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  return { tasks, addTask, updateTaskStatus, deleteTask, getTasksByStatus };
}
