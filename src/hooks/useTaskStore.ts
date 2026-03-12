import { useState, useCallback, useEffect } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { db } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
} from 'firebase/firestore';

// keep sample list for offline fallback; Firestore data will overwrite when available
const SAMPLE_TASKS: Omit<Task, 'id'>[] = [
  {
    title: 'Create pitch deck',
    description: 'Initialize the Git repo and configure CI/CD pipeline for the project.',
    status: 'todo',
    projectId: 'proj-1',
    assignee: 'Admin',
    dueDate: '2026-03-10',
    priority: 'highest',
    createdAt: '2026-03-01',
    userId: '',
  },
  {
    title: 'Finish up review and feedback gathering',
    description: 'Create ERD and define table relationships for the core data models.',
    status: 'todo',
    projectId: 'proj-1',
    assignee: 'TL',
    dueDate: '2026-03-12',
    priority: 'medium',
    createdAt: '2026-03-01',
    userId: '',
  },
  {
    title: 'Competitive analysis',
    description: 'Add login, signup, and password reset flows with JWT tokens.',
    status: 'in-progress',
    projectId: 'proj-1',
    assignee: 'Intern',
    dueDate: '2026-03-08',
    priority: 'low',
    createdAt: '2026-02-28',
    userId: '',
  },
  {
    title: 'Gather information for website',
    description: 'Build REST API for CRUD operations on tasks and projects.',
    status: 'in-progress',
    projectId: 'proj-1',
    assignee: 'Admin',
    dueDate: '2026-03-15',
    priority: 'low',
    createdAt: '2026-03-02',
    userId: '',
  },
  {
    title: 'Source and create images',
    description: 'Source imagery and create graphics for marketing materials.',
    status: 'in-progress',
    projectId: 'proj-1',
    assignee: 'TL',
    dueDate: '2026-03-03',
    priority: 'medium',
    createdAt: '2026-02-25',
    userId: '',
  },
  {
    title: 'Submit creative brief',
    description: 'Finalize and submit the creative brief for approval.',
    status: 'done',
    projectId: 'proj-1',
    assignee: 'Intern',
    dueDate: '2026-02-28',
    priority: 'low',
    createdAt: '2026-02-20',
    userId: '',
  },
  {
    title: 'Audit current experience',
    description: 'Perform a comprehensive audit of the current user experience.',
    status: 'done',
    projectId: 'proj-1',
    assignee: 'Admin',
    dueDate: '2026-02-25',
    priority: 'low',
    createdAt: '2026-02-18',
    userId: '',
  },
];

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  // subscribe to Firestore collection and keep local state in sync
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    try {
      const col = collection(db, 'tasks');
      // admins should see everything, others only the tasks where they are
      // set as the assignee (userId field).
      let q;
      // `user` object doesn't contain profile role so we need to read from
      // firestore once (could come from context in the future). we'll do a
      // simple lookup here synchronized with the user state.
      if (userProfile?.role === 'admin') {
        q = query(col, orderBy('createdAt', 'asc'));
      } else {
        q = query(col, where('userId', '==', user.uid), orderBy('createdAt', 'asc'));
      }
      let hasReceivedData = false;

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          try {
            const data: Task[] = snapshot.docs.map((d) => {
              const docData = d.data();
              return {
                id: d.id,
                title: docData.title || '',
                description: docData.description || '',
                status: docData.status || 'todo',
                projectId: docData.projectId || '',
                assignee: docData.assignee || '',
                assigneeId: docData.assigneeId || undefined,
                dueDate: docData.dueDate || '',
                priority: docData.priority || 'medium',
                createdAt: docData.createdAt || new Date().toISOString(),
                userId: docData.userId || '',
                creatorId: docData.creatorId || undefined,
              } as Task;
            });

            console.log(`[TaskStore] Received ${data.length} tasks from Firestore for user ${user.uid}`);
            
            // If we have real tasks from Firestore, use them
            if (data.length > 0) {
              setTasks(data);
              hasReceivedData = true;
              setError(null);
            } else if (!hasReceivedData) {
              // Only use sample tasks on first listener callback if empty
              const sampleWithUserId = SAMPLE_TASKS.map((task, idx) => ({
                id: `sample-${idx}`,
                ...task,
                userId: user.uid,
              }));
              setTasks(sampleWithUserId);
              hasReceivedData = true;
              setError(null);
            } else {
              // User deleted all tasks, show empty
              setTasks([]);
              setError(null);
            }
            
            setIsLoading(false);
          } catch (err) {
            console.error('Error processing snapshot:', err);
            setError(String(err));
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Firestore listener error:', error);
          setError(`Firestore error: ${error.message}`);
          setIsLoading(false);
        }
      );

      return () => unsub();
    } catch (err) {
      console.error('Error setting up listener:', err);
      setError(String(err));
      setIsLoading(false);
    }
  }, [user]);

  const addTask = useCallback(
    async (
      task: Omit<Task, 'id' | 'createdAt' | 'userId'> & Partial<{ userId: string; assigneeId?: string }>
    ) => {
      if (!user) {
        console.warn('No user logged in, cannot add task');
        return;
      }

      try {
        // if an assigneeId is provided use that as the userId so the
        // assignee's dashboard will automatically receive the new task.
        const newTask: any = {
          ...task,
          userId: task.assigneeId || user.uid,
          createdAt: new Date().toISOString(),
          creatorId: user.uid,
        };
        // mirror the userId to assigneeId for easier querying if we ever
        // need to filter by the field directly
        if (task.assigneeId) {
          newTask.assigneeId = task.assigneeId;
        }

        console.log('Adding task:', newTask);
        const docRef = await addDoc(collection(db, 'tasks'), newTask);
        console.log('Task added with ID:', docRef.id);
      } catch (err) {
        console.error('Error adding task:', err);
        setError(String(err));
        throw err;
      }
    },
    [user]
  );

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    try {
      const ref = doc(db, 'tasks', taskId);
      await updateDoc(ref, { status });
      console.log('Task updated:', taskId, status);
    } catch (err) {
      console.error('Error updating task:', err);
      setError(String(err));
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const ref = doc(db, 'tasks', taskId);
      await deleteDoc(ref);
      console.log('Task deleted:', taskId);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(String(err));
      throw err;
    }
  }, []);

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  return { tasks, addTask, updateTaskStatus, deleteTask, getTasksByStatus, isLoading, error };
}
