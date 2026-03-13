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
const SAMPLE_TASKS: Omit<Task, 'id'>[] = [];

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
                starred: docData.starred || false,
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
        // Firestore rejects undefined values; only set assigneeId when present.
        if (task.assigneeId) {
          newTask.assigneeId = task.assigneeId;
        } else {
          delete newTask.assigneeId;
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

  const toggleStarTask = useCallback(async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const ref = doc(db, 'tasks', taskId);
      await updateDoc(ref, { starred: !task.starred });
      console.log('Task starred toggled:', taskId);
    } catch (err) {
      console.error('Error toggling star:', err);
      setError(String(err));
      throw err;
    }
  }, [tasks]);

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

  return {
    tasks,
    addTask,
    updateTaskStatus,
    toggleStarTask,
    deleteTask,
    getTasksByStatus,
    isLoading,
    error,
  };
}
