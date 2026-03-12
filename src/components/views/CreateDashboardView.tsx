import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface CreateDashboardViewProps {
  onCreate?: () => void;
}

export default function CreateDashboardView({ onCreate }: CreateDashboardViewProps) {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [description, setDescription] = useState('');
  const [widgets, setWidgets] = useState<string[]>([]);
  const inputClass = 'w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

  function toggleWidget(widget: string) {
    setWidgets((prev) => (prev.includes(widget) ? prev.filter((w) => w !== widget) : [...prev, widget]));
  }

  function handleCreateDashboard(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !owner.trim()) {
      toast({
        title: 'Required details missing',
        description: 'Dashboard name and owner are required.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Dashboard created',
      description: `${name} has been created with ${widgets.length} widget(s).`,
    });

    setName('');
    setOwner('');
    setDescription('');
    setWidgets([]);
    onCreate?.();
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-xl font-semibold text-foreground">Create Dashboard</h2>
      <form onSubmit={handleCreateDashboard} className="bg-card border border-border rounded-lg p-6 space-y-5">
        <p className="text-sm text-muted-foreground">
          Fill in the required details to create a dashboard.
        </p>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Dashboard Name <span className="text-destructive">*</span>
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ex: Sprint Progress Dashboard" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Owner <span className="text-destructive">*</span>
          </label>
          <input value={owner} onChange={(e) => setOwner(e.target.value)} className={inputClass} placeholder="Ex: Team Lead" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Describe what this dashboard tracks..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Widgets</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-foreground">
            <label className="flex items-center gap-2"><input type="checkbox" checked={widgets.includes('Task Status')} onChange={() => toggleWidget('Task Status')} /> Task Status</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={widgets.includes('Burndown')} onChange={() => toggleWidget('Burndown')} /> Burndown</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={widgets.includes('Workload')} onChange={() => toggleWidget('Workload')} /> Workload</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={widgets.includes('Recent Activity')} onChange={() => toggleWidget('Recent Activity')} /> Recent Activity</label>
          </div>
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          Create Dashboard
        </button>
      </form>
    </div>
  );
}
