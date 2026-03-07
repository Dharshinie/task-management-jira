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
  const taskStore = useTaskStore();
  const isMobile = useIsMobile();

  const renderView = () => {
    switch (activeView) {
      case 'summary': return <SummaryView tasks={taskStore.tasks} />;
      case 'list': return <ListView tasks={taskStore.tasks} onDeleteTask={taskStore.deleteTask} onUpdateStatus={taskStore.updateTaskStatus} />;
      case 'board': return <KanbanBoard taskStore={taskStore} />;
      case 'calendar': return <CalendarView tasks={taskStore.tasks} />;
      case 'timeline': return <TimelineView tasks={taskStore.tasks} />;
      case 'form':
      case 'add-item': return <FormView onAdd={taskStore.addTask} />;
      case 'reports': return <ReportsView tasks={taskStore.tasks} />;
      case 'settings': return <ProjectSettingsView />;
      case 'feedback': return <FeedbackView />;
      case 'admin': return <AdminDashboard tasks={taskStore.tasks} />;
      case 'tl': return <TLDashboard tasks={taskStore.tasks} />;
      case 'intern': return <InternDashboard tasks={taskStore.tasks} />;
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
        onAdd={taskStore.addTask}
      />
    </div>
  );
};

export default Index;
