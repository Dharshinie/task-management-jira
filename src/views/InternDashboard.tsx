import { useState, useEffect, useCallback } from 'react';
import { Task, Project, Team } from '@/types/task';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InternDashboardProps {
  tasks: Task[];
}

interface ActivityLog {
  id: string;
  action: string;
  taskId: string;
  timestamp: string;
}

// extend Project type with fetched team name for convenience
interface InternProject extends Project {
  teamName?: string;
}

export default function InternDashboard({ tasks }: InternDashboardProps) {
  const { userProfile } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [myProjects, setMyProjects] = useState<InternProject[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);

  const fetchActivityLogs = useCallback(async () => {
    if (!userProfile?.uid) return;
    
    try {
      const logsQuery = query(
        collection(db, 'activity_logs'),
        where('userId', '==', userProfile.uid)
      );
      const logsSnap = await getDocs(logsQuery);
      const logs = logsSnap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as ActivityLog)).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  // determine the team(s) this intern belongs to
  useEffect(() => {
    const loadTeam = async () => {
      if (!userProfile?.uid) return;
      try {
        const teamsQuery = query(
          collection(db, 'teams'),
          where('members', 'array-contains', userProfile.uid)
        );
        const snap = await getDocs(teamsQuery);
        if (!snap.empty) {
          const tdoc = snap.docs[0];
          setMyTeam({ ...tdoc.data(), id: tdoc.id } as Team);
        }
      } catch (err) {
        console.error('Error fetching intern team:', err);
      }
    };
    loadTeam();
  }, [userProfile?.uid]);

  const myTasks = tasks.filter(t => t.userId === userProfile?.uid);
  const completedTasks = myTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = myTasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = myTasks.filter(t => t.status === 'todo').length;

  // load project info for tasks
  useEffect(() => {
    const fetchProjects = async () => {
      if (myTasks.length === 0) {
        setMyProjects([]);
        return;
      }
      try {
        const uniqueIds = Array.from(new Set(myTasks.map(t => t.projectId)));
        const projectsData: InternProject[] = [];
        for (const pid of uniqueIds) {
          const projDoc = await getDoc(doc(db, 'projects', pid));
          if (projDoc.exists()) {
            const proj = { ...projDoc.data(), id: projDoc.id } as InternProject;
            // fetch team name if available
            if (proj.teamId) {
              try {
                const teamDoc = await getDoc(doc(db, 'teams', proj.teamId));
                if (teamDoc.exists()) {
                  const teamData = teamDoc.data();
                  proj.teamName = teamData.name;
                }
              } catch (e) {
                console.error('Error fetching team for project', proj.id, e);
              }
            }
            projectsData.push(proj);
          }
        }
        setMyProjects(projectsData);
      } catch (err) {
        console.error('Error fetching projects for intern:', err);
      }
    };
    fetchProjects();
  }, [myTasks]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Intern Dashboard</h1>
      {myTeam && (
        <p className="text-sm text-muted-foreground">Team: {myTeam.name}</p>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="text-lg font-semibold">Total Tasks</h3>
              <p className="text-3xl font-bold text-primary">{myTasks.length}</p>
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
            <h3 className="text-lg font-semibold mb-2">Task Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{
                  width: `${myTasks.length > 0 ? (completedTasks / myTasks.length) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round((completedTasks / (myTasks.length || 1)) * 100)}% completed
            </p>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">My Assigned Tasks</h3>
            {myTasks.length === 0 ? (
              <p className="text-muted-foreground">No tasks assigned yet</p>
            ) : (
              <div className="space-y-2">
                {myTasks.map(task => (
                  <div key={task.id} className="flex justify-between items-center p-3 border rounded hover:bg-muted/50">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">My Projects</h3>
            {myProjects.length === 0 ? (
              <p className="text-muted-foreground">No associated projects</p>
            ) : (
              <div className="space-y-2">
                {myProjects.map(project => {
                  const projectTasks = myTasks.filter(t => t.projectId === project.id);
                  return (
                    <div key={project.id} className="p-3 border rounded hover:bg-muted/50">
                      <h4 className="font-medium">{project.name}</h4>
                      {project.teamName && (
                        <p className="text-xs text-muted-foreground">Team: {project.teamName}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      {projectTasks.length > 0 && (
                        <p className="text-xs mt-1">Assigned tasks: {projectTasks.length}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
            {loading ? (
              <p className="text-muted-foreground">Loading activity logs...</p>
            ) : activityLogs.length === 0 ? (
              <p className="text-muted-foreground">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {activityLogs.slice(0, 10).map(log => (
                  <div key={log.id} className="flex justify-between items-start p-3 border rounded bg-muted/50">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}