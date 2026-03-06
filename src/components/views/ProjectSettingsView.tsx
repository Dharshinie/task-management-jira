import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function ProjectSettingsView() {
  const [name, setName] = useState('Project management');
  const [key, setKey] = useState('PM');
  const [lead, setLead] = useState('Alice Chen');

  const inputClass = "w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    toast({ title: 'Settings saved', description: 'Project settings have been updated.' });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-semibold text-foreground">Project Settings</h2>
      <div className="bg-card border border-border rounded-lg p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Project Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Project Key</label>
            <input value={key} onChange={(e) => setKey(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Project Lead</label>
            <input value={lead} onChange={(e) => setLead(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Default Assignee</label>
            <select className={inputClass}>
              <option>Project Lead</option>
              <option>Unassigned</option>
            </select>
          </div>
          <button type="submit" className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
