import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded bg-primary flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
              <path d="M12 2L2 12l10 10 10-10L12 2z" fill="hsl(0 0% 100% / 0.6)" />
              <path d="M12 6l-6 6 6 6 6-6-6-6z" fill="hsl(0 0% 100% / 0.9)" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Log in to continue</h1>
        </div>

        <div className="bg-card border border-border rounded p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-sm hover:opacity-90 transition-opacity"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
