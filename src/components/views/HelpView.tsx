import { HelpCircle } from 'lucide-react';

export default function HelpView() {
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Help & Support</h2>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Required Things</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-foreground">
          <li>Use the top navigation to switch between project areas.</li>
          <li>Use the `Create` button to add new tasks quickly.</li>
          <li>Use `Create filter` to jump to the List filter section.</li>
          <li>Use the bell icon to check latest notification details.</li>
        </ul>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Quick Tips</h3>
        <p className="text-sm text-muted-foreground">
          Keep task status and due dates updated to get accurate dashboards and notifications.
        </p>
      </div>
    </div>
  );
}
