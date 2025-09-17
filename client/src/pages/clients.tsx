import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/topbar';
import { ClientModal } from '@/components/modals/client-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { UserPlus, Edit, Eye, Phone, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ClientWithAgent } from '@/types';

export default function Clients() {
  const [selectedClient, setSelectedClient] = useState<ClientWithAgent | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: clients = [], isLoading, refetch } = useQuery<ClientWithAgent[]>({
    queryKey: ['/api/clients'],
  });

  const handleAddClient = () => {
    setSelectedClient(undefined);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: ClientWithAgent) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedClient(undefined);
  };

  const handleModalSave = () => {
    refetch();
  };

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
    <div className="flex-1 overflow-y-auto">
      <TopBar 
        title="Clients" 
        subtitle="Manage your solar installation clients and projects" 
      />
      
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">All Clients</h2>
            <p className="text-sm text-muted-foreground">
              {clients.length} client{clients.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button onClick={handleAddClient} data-testid="button-add-client">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No clients found</p>
                <Button onClick={handleAddClient} data-testid="button-add-first-client">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Your First Client
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id} data-testid={`client-row-${client.id}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {client.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium" data-testid={`text-client-name-${client.id}`}>
                                {client.name}
                              </p>
                              <p className="text-sm text-muted-foreground truncate max-w-48">
                                {client.address}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {client.phone}
                            </div>
                            {client.email && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Mail className="h-3 w-3 mr-1" />
                                {client.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-agent-${client.id}`}>
                          {client.assignedAgent ? (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {client.assignedAgent.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{client.assignedAgent.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(client.projectStatus)} data-testid={`badge-status-${client.id}`}>
                            {getStatusLabel(client.projectStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground" data-testid={`text-created-${client.id}`}>
                          {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClient(client)}
                              data-testid={`button-view-client-${client.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClient(client)}
                              data-testid={`button-edit-client-${client.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <ClientModal
          open={isModalOpen}
          onOpenChange={handleModalClose}
          client={selectedClient}
          onSave={handleModalSave}
        />
      </main>
    </div>
  );
}
