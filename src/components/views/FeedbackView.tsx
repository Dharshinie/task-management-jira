import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function FeedbackView() {
  const [type, setType] = useState('suggestion');
  const [message, setMessage] = useState('');

  const inputClass = "w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    toast({ title: 'Feedback sent', description: 'Thank you for your feedback!' });
    setMessage(''); setType('suggestion');
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-semibold text-foreground">Give Feedback</h2>
      <div className="bg-card border border-border rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Feedback Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              <option value="suggestion">Suggestion</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Message <span className="text-destructive">*</span></label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what you think..." rows={5} className={`${inputClass} resize-none`} required />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity">
            Send Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
