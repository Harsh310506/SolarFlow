import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { DashboardMetrics } from '@/types';

interface RecentClientsTableProps {
  clients: DashboardMetrics['recentClients'];
  isLoading?: boolean;
}

export function RecentClientsTable({ clients, isLoading }: RecentClientsTableProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'default';
      case 'lead':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'lead':
        return 'Lead';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <Card className="shadow-sm" data-testid="card-recent-clients">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Clients</CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-view-all-clients">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {clients.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No clients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-0 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-0 text-sm font-medium text-muted-foreground">Agent</th>
                  <th className="text-left py-3 px-0 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-0 text-sm font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="border-b border-border/50"
                    data-testid={`client-row-${client.id}`}
                  >
                    <td className="py-3 px-0">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium" data-testid={`text-client-name-${client.id}`}>
                            {client.name}
                          </p>
                          {client.phone && (
                            <p className="text-xs text-muted-foreground">{client.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-0 text-sm" data-testid={`text-agent-name-${client.id}`}>
                      {client.assignedAgent?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-0">
                      <Badge variant={getStatusVariant(client.projectStatus)} data-testid={`badge-status-${client.id}`}>
                        {getStatusLabel(client.projectStatus)}
                      </Badge>
                    </td>
                    <td className="py-3 px-0 text-sm text-muted-foreground" data-testid={`text-date-${client.id}`}>
                      {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
