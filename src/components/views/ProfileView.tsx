import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileView() {
  const { user, userProfile } = useAuth();

  const memberSince = useMemo(() => {
    const dateStr = userProfile?.createdAt;
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }, [userProfile?.createdAt]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">User Details</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground">Name</div>
              <div className="font-medium">{user?.displayName || 'N/A'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Email</div>
              <div className="font-medium">{user?.email || 'N/A'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Role</div>
              <div className="font-medium capitalize">{userProfile?.role || 'N/A'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Member since</div>
              <div className="font-medium">{memberSince}</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground">User ID</div>
              <div className="font-mono text-xs break-all">{user?.uid || 'N/A'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Provider</div>
              <div className="font-medium">{user?.providerData?.[0]?.providerId || 'Email/Password'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
