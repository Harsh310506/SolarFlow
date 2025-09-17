import { TopBar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/lib/auth';

export default function Agents() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex-1 overflow-y-auto">
        <TopBar 
          title="Agents" 
          subtitle="Manage your solar installation agents and their performance" 
        />
        
        <main className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Agent management features coming soon</p>
                <p className="text-sm text-muted-foreground">
                  This section will allow you to manage agents, track their performance, and assign clients.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
