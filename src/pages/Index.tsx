import { useState } from 'react';
import AppSidebar from '@/components/AppSidebar';
import Navbar from '@/components/Navbar';
import KanbanBoard from '@/components/KanbanBoard';
import TimelineView from '@/components/TimelineView';
import SummaryView from '@/components/views/SummaryView';
import ListView from '@/components/views/ListView';
import CalendarView from '@/components/views/CalendarView';
import FormView from '@/components/views/FormView';
import FeedbackView from '@/components/views/FeedbackView';
import ReportsView from '@/components/views/ReportsView';
import ProjectSettingsView from '@/components/views/ProjectSettingsView';
import AdminDashboard from '@/views/AdminDashboard';
import TLDashboard from '@/views/TLDashboard';
import InternDashboard from '@/views/InternDashboard';
import AddTaskDialog from '@/components/AddTaskDialog';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState('board');
  const { tasks, addTask, updateTaskStatus, deleteTask, isLoading, error } = useTaskStore();
  const isMobile = useIsMobile();

  const renderView = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-96">Loading tasks...</div>;
    }

    if (error) {
      return (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded text-destructive">
          <p className="font-medium">Error loading tasks</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    switch (activeView) {
      case 'summary': return <SummaryView tasks={tasks} />;
      case 'list': return <ListView tasks={tasks} onDeleteTask={deleteTask} onUpdateStatus={updateTaskStatus} />;
      case 'board': return <KanbanBoard taskStore={{ tasks, addTask, updateTaskStatus, deleteTask, getTasksByStatus: (status) => tasks.filter(t => t.status === status) }} />;
      case 'calendar': return <CalendarView tasks={tasks} />;
      case 'timeline': return <TimelineView tasks={tasks} />;
      case 'form':
      case 'add-item': return <FormView onAdd={addTask} />;
      case 'reports': return <ReportsView tasks={tasks} />;
      case 'settings': return <ProjectSettingsView />;
      case 'feedback': return <FeedbackView />;
      case 'admin': return <AdminDashboard tasks={tasks} />;
      case 'tl': return <TLDashboard tasks={tasks} />;
      case 'intern': return <InternDashboard tasks={tasks} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAddTask={() => setDialogOpen(true)} onViewChange={setActiveView} />
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />

      <main className={`pt-[var(--navbar-height)] ${isMobile ? 'pb-16' : 'ml-[var(--sidebar-width)]'}`}>
        <div className="p-4 sm:p-6">{renderView()}</div>
      </main>

      <AddTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={addTask}
      />
    </div>
  );
};

export default Index;
