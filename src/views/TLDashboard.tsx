import { useState, useEffect, useCallback } from 'react';
import { Task, Team, Project } from '@/types/task';
import { UserProfile } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { collection, getDocs, query, where, addDoc, getDoc, doc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import AddTaskDialog from '@/components/AddTaskDialog';

interface TLDashboardProps {
  tasks: Task[];
  addTask: (
    task: Omit<Task, 'id' | 'createdAt' | 'userId'> & { assigneeId?: string }
  ) => void | Promise<void>;
}

export default function TLDashboard({ tasks, addTask }: TLDashboardProps) {
  const { userProfile } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchTLData = useCallback(async () => {
    if (!userProfile?.uid) return;
    
    try {
      // Get projects where user is TL
      const projectsQuery = query(collection(db, 'projects'), where('tlId', '==', userProfile.uid));
      const projectsSnap = await getDocs(projectsQuery);
      const projectsData = projectsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Project));
      setProjects(projectsData);

      // Get team info from first project or fetch separately
      if (projectsData.length > 0) {
        const teamId = projectsData[0].teamId;
        try {
          const teamDoc = await getDoc(doc(db, 'teams', teamId));
          if (teamDoc.exists()) {
            setTeam({ ...teamDoc.data(), id: teamDoc.id } as Team);
            
            // Fetch team members
            const teamData = teamDoc.data();
            if (teamData.members && teamData.members.length > 0) {
              const membersData: UserProfile[] = [];
              for (const memberId of teamData.members) {
                try {
                  const userDoc = await getDoc(doc(db, 'users', memberId));
                  if (userDoc.exists()) {
                    membersData.push({ ...userDoc.data(), uid: userDoc.id } as UserProfile);
                  }
                } catch (err) {
                  console.error('Error fetching user:', memberId, err);
                }
              }
              setTeamMembers(membersData);
            }
          }
        } catch (error) {
          console.error('Error fetching team:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching TL data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userProfile?.uid, toast]);

  useEffect(() => {
    fetchTLData();
  }, [fetchTLData]);

  const myTasks = tasks.filter(t => t.userId === userProfile?.uid);

  const [teamTasks, setTeamTasks] = useState<Task[]>([]);

  // once we know which projects the TL leads, fetch all tasks under those projects
  useEffect(() => {
    const loadTeamTasks = async () => {
      if (projects.length === 0) {
        setTeamTasks([]);
        return;
      }
      try {
        const projIds = projects.map(p => p.id);
        const tasksSnap = await getDocs(collection(db, 'tasks'));
        const allTasks: Task[] = tasksSnap.docs.map(d => ({ id: d.id, ...(d.data() as Task) } as Task));
        setTeamTasks(allTasks.filter(t => projIds.includes(t.projectId)));
      } catch (error) {
        console.error('Error fetching tasks for TL team:', error);
      }
    };
    loadTeamTasks();
  }, [projects]);

  const completedTasks = myTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = myTasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = myTasks.filter(t => t.status === 'todo').length;

  const teamCompletedTasks = teamTasks.filter(t => t.status === 'done').length;
  const teamInProgressTasks = teamTasks.filter(t => t.status === 'in-progress').length;

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading team data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team Lead Dashboard</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {team && (
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="text-lg font-semibold">Team</h3>
              <p className="text-2xl font-bold">{team.name}</p>
              <p className="text-sm text-muted-foreground">Members: {teamMembers.length}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="text-lg font-semibold">My Tasks</h3>
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
            <h3 className="text-lg font-semibold mb-4">My Tasks</h3>
            <div className="space-y-2">
              {myTasks.map(task => (
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
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">{team?.name || 'My Team'}</h3>
            <p className="text-muted-foreground mb-4">Team Members: {teamMembers.length}</p>
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div key={member.uid} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{member.email}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">My Projects</h2>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setTaskDialogOpen(true)} disabled={teamMembers.length === 0 || projects.length === 0}>
                    Create Task
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Project</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <CreateProjectForm teamId={team?.id} onCreate={fetchTLData} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="space-y-2">
            {projects.map(project => (
              <div key={project.id} className="bg-card p-4 rounded-lg border">
                <h4 className="font-semibold">{project.name}</h4>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="text-lg font-semibold">Team Progress</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Total Team Tasks</span>
                  <span className="font-semibold">{teamTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span className="font-semibold text-green-600">{teamCompletedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>In Progress</span>
                  <span className="font-semibold text-yellow-600">{teamInProgressTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${teamTasks.length > 0 ? (teamCompletedTasks / teamTasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* task creation dialog for TLs */}
      <AddTaskDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        onAdd={addTask}
        projects={projects}
      />
    </div>
  );
}

function CreateProjectForm({ teamId, onCreate }: { teamId?: string; onCreate: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'projects'), {
        name,
        description,
        tlId: userProfile?.uid,
        teamId: teamId || '',
        createdAt: new Date().toISOString(),
      });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      onCreate();
      setName('');
      setDescription('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Textarea
        placeholder="Project Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <Button type="submit">Create Project</Button>
    </form>
  );
}
