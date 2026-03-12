import { useState, useEffect, useCallback } from 'react';
import { Task, Team, Project } from '@/types/task';
import { UserProfile, UserRole } from '@/types/user';
import { Team, Project, ActivityLog } from '@/types/task';
import { db } from '@/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  tasks: Task[];
}

export default function AdminDashboard({ tasks }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [usersSnap, teamsSnap, projectsSnap, logsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'teams')),
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'activity_logs')),
      ]);

      setUsers(usersSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile)));
      setTeams(teamsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Team)));
      setProjects(projectsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Project)));
      setActivityLogs(logsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActivityLog)).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const tasksByAssignee = tasks.reduce((acc, task) => {
    acc[task.assignee] = (acc[task.assignee] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading admin data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Teams</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Team</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <CreateTeamForm onCreate={fetchData} />
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => {
              const teamProjects = projects.filter(p => p.teamId === team.id);
              const teamMembers = users.filter(u => team.members.includes(u.uid));

              return (
                <div key={team.id} className="bg-card p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">{team.name}</h3>
                  <div className="space-y-1 text-sm mb-3">
                    <p>Members: {teamMembers.length}</p>
                    <p>Projects: {teamProjects.length}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Team Members:</p>
                    {teamMembers.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No members yet</p>
                    ) : (
                      teamMembers.map(member => (
                        <p key={member.uid} className="text-xs">{member.email} ({member.role})</p>
                      ))
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="mt-3 w-full">Manage Members</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manage Team Members - {team.name}</DialogTitle>
                      </DialogHeader>
                      <ManageTeamMembers team={team} users={users} onUpdate={fetchData} />
                    </DialogContent>
                  </Dialog>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <h2 className="text-xl font-semibold">Users Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => {
              const userTasks = tasks.filter(t => t.userId === user.uid);
              const completedTasks = userTasks.filter(t => t.status === 'done').length;
              const totalTasks = userTasks.length;
              const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div key={user.uid} className="bg-card p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{user.email}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <Select value={user.role} onValueChange={(role: UserRole) => updateUserRole(user.uid, role)}>
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="tl">TL</SelectItem>
                          <SelectItem value="intern">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="destructive" size="sm" onClick={() => deleteUser(user.uid)}>×</Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>Tasks: {totalTasks} ({completedTasks} completed)</p>
                    <p>Completion: {completionRate}%</p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Projects</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <CreateProjectForm users={users} teams={teams} onCreate={fetchData} />
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              const completedTasks = projectTasks.filter(t => t.status === 'done').length;
              const totalTasks = projectTasks.length;
              const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              const team = teams.find(t => t.id === project.teamId);
              const tl = users.find(u => u.uid === project.tlId);

              return (
                <div key={project.id} className="bg-card p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  <div className="space-y-1 text-sm mb-3">
                    <p>Team Lead: {tl?.email || 'Unknown'}</p>
                    <p>Team: {team?.name || 'Unknown'}</p>
                    <p>Tasks: {totalTasks} ({completedTasks} completed)</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-center mt-1">{completionRate}% complete</p>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <h2 className="text-xl font-semibold">Activity Logs</h2>
          {activityLogs.length === 0 ? (
            <p className="text-muted-foreground">No activity logs yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activityLogs.slice(0, 50).map(log => (
                <div key={log.id} className="bg-card p-3 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        User: {users.find(u => u.uid === log.userId)?.email || log.userId}
                      </p>
                      {log.taskId && (
                        <p className="text-sm text-muted-foreground">
                          Task: {tasks.find(t => t.id === log.taskId)?.title || log.taskId}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  async function updateUserRole(uid: string, role: UserRole) {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
      setUsers(users.map(u => u.uid === uid ? { ...u, role } : u));
      toast({
        title: "Success",
        description: "User role updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  }

  async function deleteUser(uid: string) {
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUsers(users.filter(u => u.uid !== uid));
      toast({
        title: "Success",
        description: "User deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  }
}

function CreateTeamForm({ onCreate }: { onCreate: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'teams'), {
        name: name.trim(),
        members: [],
        createdAt: new Date().toISOString(),
      });
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      onCreate();
      setName('');
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Team Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Team'}
      </Button>
    </form>
  );
}

function CreateProjectForm({ users, teams, onCreate }: { users: UserProfile[], teams: Team[], onCreate: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tlId, setTlId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const availableTLs = users.filter(u => u.role === 'tl');
  const availableTeams = teams;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !tlId || !teamId) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'projects'), {
        name: name.trim(),
        description: description.trim(),
        tlId,
        teamId,
        createdAt: new Date().toISOString(),
      });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      onCreate();
      setName('');
      setDescription('');
      setTlId('');
      setTeamId('');
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
      />
      <Input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        disabled={loading}
      />
      <Select value={tlId} onValueChange={setTlId} disabled={loading}>
        <SelectTrigger>
          <SelectValue placeholder="Select Team Lead" />
        </SelectTrigger>
        <SelectContent>
          {availableTLs.length === 0 ? (
            <SelectItem value="" disabled>No Team Leads available</SelectItem>
          ) : (
            availableTLs.map(user => (
              <SelectItem key={user.uid} value={user.uid}>{user.email}</SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <Select value={teamId} onValueChange={setTeamId} disabled={loading}>
        <SelectTrigger>
          <SelectValue placeholder="Select Team" />
        </SelectTrigger>
        <SelectContent>
          {availableTeams.length === 0 ? (
            <SelectItem value="" disabled>No Teams available</SelectItem>
          ) : (
            availableTeams.map(team => (
              <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <Button type="submit" disabled={loading || availableTLs.length === 0 || availableTeams.length === 0}>
        {loading ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  );
}

function ManageTeamMembers({ team, users, onUpdate }: { team: Team; users: UserProfile[]; onUpdate: () => void }) {
  const { toast } = useToast();

  const addMember = async (userId: string) => {
    try {
      const updatedMembers = [...team.members, userId];
      await updateDoc(doc(db, 'teams', team.id), { members: updatedMembers });
      toast({
        title: "Success",
        description: "Member added to team",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (userId: string) => {
    try {
      const updatedMembers = team.members.filter(id => id !== userId);
      await updateDoc(doc(db, 'teams', team.id), { members: updatedMembers });
      toast({
        title: "Success",
        description: "Member removed from team",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const availableUsers = users.filter(u => !team.members.includes(u.uid));

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Current Members</h4>
        {team.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members in this team</p>
        ) : (
          <div className="space-y-1">
            {team.members.map(memberId => {
              const member = users.find(u => u.uid === memberId);
              return member ? (
                <div key={memberId} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">{member.email} ({member.role})</span>
                  <Button size="sm" variant="destructive" onClick={() => removeMember(memberId)}>Remove</Button>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-medium mb-2">Add Members</h4>
        {availableUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No available users to add</p>
        ) : (
          <div className="space-y-1">
            {availableUsers.map(user => (
              <div key={user.uid} className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm">{user.email} ({user.role})</span>
                <Button size="sm" onClick={() => addMember(user.uid)}>Add</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}