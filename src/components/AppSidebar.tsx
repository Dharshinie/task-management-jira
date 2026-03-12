import { LayoutDashboard, FolderKanban, Settings, Users, BarChart3, Plus, CalendarRange, List, FileText, MessageSquare, Shield, UserCog, GraduationCap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

const allNavItems = [
  { icon: LayoutDashboard, label: 'Summary', id: 'summary', roles: ['admin', 'tl'] },
  { icon: List, label: 'List', id: 'list', roles: ['admin', 'tl', 'intern'] },
  { icon: FolderKanban, label: 'Board', id: 'board', roles: ['admin', 'tl', 'intern'] },
  { icon: CalendarRange, label: 'Calendar', id: 'calendar', roles: ['admin', 'tl'] },
  { icon: BarChart3, label: 'Timeline', id: 'timeline', roles: ['admin', 'tl'] },
  { icon: FileText, label: 'Form', id: 'form', roles: ['admin', 'tl'] },
  { icon: Users, label: 'Reports', id: 'reports', roles: ['admin', 'tl'] },
  { icon: Shield, label: 'Admin', id: 'admin', roles: ['admin'] },
  { icon: UserCog, label: 'Team Lead', id: 'tl', roles: ['tl'] },
  { icon: GraduationCap, label: 'My Dashboard', id: 'intern', roles: ['intern'] },
];

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const isMobile = useIsMobile();
  const { userProfile } = useAuth();

  const navItems = allNavItems.filter(item => item.roles.includes(userProfile?.role || 'intern'));

  if (isMobile) {
    // Bottom tab bar for mobile
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around z-30 h-14">
        {navItems.slice(0, 7).map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors ${
              activeView === item.id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <aside className="fixed left-0 top-[var(--navbar-height)] bottom-0 w-[var(--sidebar-width)] bg-card border-r border-border flex flex-col z-30">
      {/* Project header */}
      <div className="flex items-center gap-2.5 px-5 h-[var(--navbar-height)] border-b border-sidebar-border">
        <div className="w-8 h-8 rounded bg-sidebar-primary flex items-center justify-center">
          <FolderKanban className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-sidebar-foreground tracking-tight leading-tight">Project management</span>
          <span className="text-[11px] text-sidebar-foreground/60">Business project</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`sidebar-link w-full ${activeView === item.id ? 'active' : ''}`}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-0.5 border-t border-sidebar-border">
        {(userProfile?.role === 'admin' || userProfile?.role === 'tl') && (
          <>
            <button onClick={() => onViewChange('add-item')} className={`sidebar-link w-full ${activeView === 'add-item' ? 'active' : 'opacity-80 hover:opacity-100'}`}>
              <Plus className="w-[18px] h-[18px]" />
              Add item
            </button>
            <button onClick={() => onViewChange('settings')} className={`sidebar-link w-full ${activeView === 'settings' ? 'active' : 'opacity-80 hover:opacity-100'}`}>
              <Settings className="w-[18px] h-[18px]" />
              Project settings
            </button>
          </>
        )}
        <button onClick={() => onViewChange('feedback')} className={`sidebar-link w-full ${activeView === 'feedback' ? 'active' : 'opacity-80 hover:opacity-100'}`}>
          <MessageSquare className="w-[18px] h-[18px]" />
          Give feedback
        </button>
      </div>
    </aside>
  );
}
