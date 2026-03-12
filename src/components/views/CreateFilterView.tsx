export default function CreateFilterView() {
  const inputClass = 'w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-xl font-semibold text-foreground">Create Filter</h2>
      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <p className="text-sm text-muted-foreground">
          Add the required details to save a reusable task filter.
        </p>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Filter Name <span className="text-destructive">*</span>
          </label>
          <input className={inputClass} placeholder="Ex: High Priority Bugs" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Project <span className="text-destructive">*</span>
          </label>
          <input className={inputClass} placeholder="Ex: Project management" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select className={inputClass}>
              <option>All statuses</option>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Priority</label>
            <select className={inputClass}>
              <option>All priorities</option>
              <option>Highest</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
              <option>Lowest</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Assignee</label>
          <input className={inputClass} placeholder="Ex: John Doe" />
        </div>
      </div>
    </div>
  );
}
