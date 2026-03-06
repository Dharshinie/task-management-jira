import { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, ChevronDown, LogOut, User, Settings, Briefcase, Filter, LayoutDashboard, Users, AppWindow, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import jiraLogo from '@/assets/jira-logo.png';

interface NavbarProps {
  onAddTask: () => void;
  onViewChange?: (view: string) => void;
}

const navMenus: { label: string; icon: React.ElementType; items: { label: string; desc: string; viewId?: string }[] }[] = [
  {
    label: 'Your work',
    icon: Briefcase,
    items: [
      { label: 'Recent projects', desc: 'View recently accessed projects', viewId: 'summary' },
      { label: 'Assigned to me', desc: 'Tasks assigned to you', viewId: 'list' },
      { label: 'Starred', desc: 'Your starred items', viewId: 'list' },
    ],
  },
  {
    label: 'Projects',
    icon: LayoutDashboard,
    items: [
      { label: 'View all projects', desc: 'Browse all projects', viewId: 'summary' },
      { label: 'Create project', desc: 'Start a new project', viewId: 'form' },
    ],
  },
  {
    label: 'Filters',
    icon: Filter,
    items: [
      { label: 'View all filters', desc: 'See saved filters', viewId: 'list' },
      { label: 'Create filter', desc: 'Create a new filter', viewId: 'list' },
    ],
  },
  {
    label: 'Dashboards',
    icon: LayoutDashboard,
    items: [
      { label: 'View all dashboards', desc: 'Browse dashboards', viewId: 'reports' },
      { label: 'Create dashboard', desc: 'Build a new dashboard', viewId: 'reports' },
    ],
  },
  {
    label: 'People',
    icon: Users,
    items: [
      { label: 'Teams', desc: 'View team members', viewId: 'reports' },
      { label: 'Invite people', desc: 'Add new team members', viewId: 'settings' },
    ],
  },
  {
    label: 'Apps',
    icon: AppWindow,
    items: [
      { label: 'Explore apps', desc: 'Find new integrations' },
      { label: 'Manage apps', desc: 'Configure installed apps' },
    ],
  },
];

function NavDropdown({ menu, onViewChange }: { menu: typeof navMenus[0]; onViewChange?: (view: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-header-foreground/90 hover:bg-header-hover rounded-sm transition-colors"
      >
        {menu.label}
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-card border border-border rounded shadow-lg z-50 py-2">
          {menu.items.map((item) => (
            <button
              key={item.label}
              className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors"
              onClick={() => {
                if (item.viewId && onViewChange) onViewChange(item.viewId);
                setOpen(false);
              }}
            >
              <div className="text-sm font-medium text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileDropdown({ onViewChange }: { onViewChange?: (view: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div ref={ref} className="relative">
      <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-header-foreground/30 transition-all" onClick={() => setOpen(!open)}>
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">AC</AvatarFallback>
      </Avatar>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded shadow-lg z-50 py-1">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-sm font-semibold text-foreground">Alex Cooper</div>
            <div className="text-xs text-muted-foreground">alex@company.com</div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors" onClick={() => setOpen(false)}>
            <User className="w-4 h-4 text-muted-foreground" />
            Profile
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
            onClick={() => {
              if (onViewChange) onViewChange('settings');
              setOpen(false);
            }}
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
            Settings
          </button>
          <div className="border-t border-border my-1" />
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-accent transition-colors" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ onAddTask, onViewChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[var(--navbar-height)] bg-header flex items-center justify-between px-4 z-40 border-b border-border">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-1">
          {/* Mobile menu toggle */}
          <button className="lg:hidden p-2 rounded-sm hover:bg-header-hover transition-colors mr-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5 text-header-foreground" /> : <Menu className="w-5 h-5 text-header-foreground" />}
          </button>
          {/* Jira-style logo */}
          <div className="flex items-center gap-2 mr-4">
            <img src={jiraLogo} alt="Jira" className="w-7 h-7 object-contain" />
            <span className="text-sm font-bold text-header-foreground tracking-tight hidden sm:inline">Jira</span>
          </div>

          {/* Nav menu items - desktop */}
          <nav className="hidden lg:flex items-center">
            {navMenus.map((menu) => (
              <NavDropdown key={menu.label} menu={menu} onViewChange={onViewChange} />
            ))}
          </nav>
        </div>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center max-w-md mx-4 hidden sm:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-header-foreground/50" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-header-hover/50 border border-header-foreground/10 text-header-foreground placeholder:text-header-foreground/40 rounded-sm focus:outline-none focus:bg-card focus:text-foreground focus:placeholder:text-muted-foreground focus:border-ring transition-colors"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onAddTask}
            className="bg-primary text-primary-foreground text-sm font-semibold px-3.5 py-1.5 rounded-sm hover:bg-primary/90 transition-colors"
          >
            Create
          </button>

          <button className="p-2 rounded-sm hover:bg-header-hover transition-colors hidden sm:block">
            <HelpCircle className="w-[18px] h-[18px] text-header-foreground/80" />
          </button>
          <button className="p-2 rounded-sm hover:bg-header-hover transition-colors relative">
            <Bell className="w-[18px] h-[18px] text-header-foreground/80" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full ring-2 ring-header" />
          </button>

          <ProfileDropdown onViewChange={onViewChange} />
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[var(--navbar-height)] bg-background z-50 lg:hidden overflow-y-auto">
          <div className="p-4 space-y-1">
            {/* Search on mobile */}
            <div className="relative mb-4 sm:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {navMenus.map((menu) => (
              <div key={menu.label} className="border-b border-border pb-2 mb-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">{menu.label}</div>
                {menu.items.map(item => (
                  <button
                    key={item.label}
                    className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-sm transition-colors"
                    onClick={() => {
                      if (item.viewId && onViewChange) onViewChange(item.viewId);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
