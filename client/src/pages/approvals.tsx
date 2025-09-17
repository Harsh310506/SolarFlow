import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileCheck, 
  Edit, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthenticatedRequest } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';
import type { Approval, ClientWithAgent } from '@/types';

export default function Approvals() {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  
  const makeRequest = useAuthenticatedRequest();

  const { data: clients = [], isLoading: clientsLoading } = useQuery<ClientWithAgent[]>({
    queryKey: ['/api/clients'],
  });

  const { data: approvals = [], isLoading: approvalsLoading } = useQuery<Approval[]>({
    queryKey: ['/api/approvals', selectedClient],
    queryFn: async () => {
      const url = selectedClient ? `/api/approvals?clientId=${selectedClient}` : '/api/approvals';
      const response = await fetch(url, {
        headers: {
          'user-id': localStorage.getItem('auth-user') ? JSON.parse(localStorage.getItem('auth-user')!).id : '',
          'user-role': localStorage.getItem('auth-user') ? JSON.parse(localStorage.getItem('auth-user')!).role : '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch approvals');
      return response.json();
    },
  });

  const updateApprovalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Approval> }) => {
      await makeRequest('PUT', `/api/approvals/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      setIsUpdateModalOpen(false);
      setSelectedApproval(null);
      setUpdateStatus('');
      setRemarks('');
    },
  });

  const createApprovalMutation = useMutation({
    mutationFn: async (data: { clientId: string; step: string; status: string; remarks?: string }) => {
      await makeRequest('POST', '/api/approvals', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
    },
  });

  const approvalSteps = [
    { key: 'application', label: 'Application Submission', color: 'bg-blue-500' },
    { key: 'verification', label: 'Document Verification', color: 'bg-green-500' },
    { key: 'inspection', label: 'Site Inspection', color: 'bg-yellow-500' },
    { key: 'noc', label: 'NOC Issuance', color: 'bg-purple-500' },
    { key: 'clearance', label: 'Final Installation Clearance', color: 'bg-red-500' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const getClientApprovalProgress = (clientId: string) => {
    const clientApprovals = approvals.filter(a => a.clientId === clientId);
    const completedSteps = clientApprovals.filter(a => a.status === 'approved').length;
    return Math.round((completedSteps / approvalSteps.length) * 100);
  };

  const handleUpdateApproval = (approval: Approval) => {
    setSelectedApproval(approval);
    setUpdateStatus(approval.status);
    setRemarks(approval.remarks || '');
    setIsUpdateModalOpen(true);
  };

  const handleSubmitUpdate = () => {
    if (!selectedApproval) return;
    
    updateApprovalMutation.mutate({
      id: selectedApproval.id,
      data: {
        status: updateStatus as 'pending' | 'approved' | 'rejected',
        remarks,
      },
    });
  };

  const getClientForApproval = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar 
        title="Government Approvals" 
        subtitle="Track and manage government approval workflows for solar installations" 
      />
      
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Approval Pipeline</h2>
            <p className="text-sm text-muted-foreground">
              Monitor the 5-stage government approval process
            </p>
          </div>
          <div className="flex space-x-3">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-48" data-testid="select-client-filter">
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pipeline Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {approvalSteps.map((step, index) => {
            const stepApprovals = approvals.filter(a => a.step === step.key);
            const pendingCount = stepApprovals.filter(a => a.status === 'pending').length;
            const approvedCount = stepApprovals.filter(a => a.status === 'approved').length;
            
            return (
              <Card key={step.key} className="text-center">
                <CardContent className="p-4">
                  <div className={`w-3 h-3 ${step.color} rounded-full mx-auto mb-2`}></div>
                  <h3 className="font-semibold text-sm mb-2">{step.label}</h3>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-green-600">{approvedCount}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                    {pendingCount > 0 && (
                      <>
                        <p className="text-sm font-semibold text-yellow-600">{pendingCount}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Client Progress Overview */}
        {!selectedClient && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Client Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {clientsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {clients.filter(c => c.projectStatus !== 'completed').map((client) => {
                    const progress = getClientApprovalProgress(client.id);
                    return (
                      <div key={client.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{client.name}</h4>
                            <span className="text-sm text-muted-foreground">{progress}% Complete</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedClient(client.id)}
                          data-testid={`button-view-client-approvals-${client.id}`}
                        >
                          View Details
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Approvals Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedClient ? `Approvals for ${clients.find(c => c.id === selectedClient)?.name}` : 'All Approvals'}
              </CardTitle>
              {selectedClient && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedClient('')}
                  data-testid="button-clear-filter"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {approvalsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : approvals.length === 0 ? (
              <div className="text-center py-8">
                <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No approvals found</p>
                <p className="text-sm text-muted-foreground">
                  Approvals will be created automatically when clients are assigned to agents.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Approval Step</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.map((approval) => {
                      const client = getClientForApproval(approval.clientId);
                      const step = approvalSteps.find(s => s.key === approval.step);
                      
                      return (
                        <TableRow key={approval.id} data-testid={`approval-row-${approval.id}`}>
                          <TableCell>
                            {client && (
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {client.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{client.name}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 ${step?.color || 'bg-gray-500'} rounded-full`}></div>
                              <span className="text-sm">{step?.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(approval.status)}
                              <Badge variant={getStatusVariant(approval.status)}>
                                {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-48 truncate">
                            {approval.remarks || 'No remarks'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(approval.updatedAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateApproval(approval)}
                                data-testid={`button-update-approval-${approval.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {approval.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  data-testid={`button-upload-document-${approval.id}`}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Approval Modal */}
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent data-testid="modal-update-approval">
            <DialogHeader>
              <DialogTitle>Update Approval Status</DialogTitle>
            </DialogHeader>
            
            {selectedApproval && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select value={updateStatus} onValueChange={setUpdateStatus}>
                    <SelectTrigger data-testid="select-approval-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Remarks</label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any remarks or notes..."
                    rows={3}
                    data-testid="textarea-approval-remarks"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsUpdateModalOpen(false)}
                    data-testid="button-cancel-approval-update"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitUpdate}
                    disabled={updateApprovalMutation.isPending}
                    data-testid="button-save-approval-update"
                  >
                    {updateApprovalMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
