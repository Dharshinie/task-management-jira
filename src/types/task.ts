export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
  /**
   * Human-readable name/email of the assignee. Used for display and
   * for aggregations in dashboards.
   */
  assignee: string;
  /**
   * Optional UID of the user this task is assigned to. When present we
   * also use `userId` field to mirror this value so that the task store
   * query automatically returns tasks for the assignee.
   */
  assigneeId?: string;
  dueDate: string;
  priority: TaskPriority;
  attachmentURL?: string;
  createdAt: string;
  /**
   * Currently this field is used as the index for the task listener. By
   * convention we set it equal to the assignee's uid (or creator when no
   * assignee is provided) so that each user only receives tasks that are
   * assigned to them.
   */
  userId: string;
  /**
   * UID of the user who created the task. This is useful for admins / TLs
   * tracking tasks they spawned even after assigning them to someone
   * else. It's not currently used for the work flow but stored for
   * future filtering.
   */
  creatorId?: string;
  /**
   * Whether this task is starred by the user. Defaults to false.
   */
  starred?: boolean;
}

export interface Column {
  id: TaskStatus;
  title: string;
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export interface Team {
  id: string;
  name: string;
  members: string[]; // user ids
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tlId: string; // team lead user id
  teamId: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}
