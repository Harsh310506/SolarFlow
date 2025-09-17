import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { insertClientSchema, type InsertClient, type ClientWithAgent, type User } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedRequest } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientWithAgent;
  onSave?: () => void;
}

export function ClientModal({ open, onOpenChange, client, onSave }: ClientModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const makeRequest = useAuthenticatedRequest();

  // Fetch agents for assignment
  const { data: agents } = useQuery({
    queryKey: ['/api/users'],
    enabled: open,
  });

  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      assignedAgentId: undefined,
      projectStatus: 'lead',
    },
  });

  useEffect(() => {
    if (client && open) {
      form.reset({
        name: client.name,
        email: client.email || '',
        phone: client.phone,
        address: client.address,
        assignedAgentId: client.assignedAgentId || undefined,
        projectStatus: client.projectStatus,
      });
    } else if (!client && open) {
      form.reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        assignedAgentId: undefined,
        projectStatus: 'lead',
      });
    }
  }, [client, open, form]);

  const handleSubmit = async (data: InsertClient) => {
    setIsLoading(true);
    try {
      if (client) {
        await makeRequest('PUT', `/api/clients/${client.id}`, data);
      } else {
        await makeRequest('POST', '/api/clients', data);
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      
      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getApprovalStepStatus = (step: string) => {
    if (!client?.approvals) return 'pending';
    
    const approval = client.approvals.find(a => a.step === step);
    return approval?.status || 'pending';
  };

  const getApprovalStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const approvalSteps = [
    { key: 'application', label: 'Application Submission' },
    { key: 'verification', label: 'Document Verification' },
    { key: 'inspection', label: 'Site Inspection' },
    { key: 'noc', label: 'NOC Issuance' },
    { key: 'clearance', label: 'Final Installation Clearance' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto" data-testid="modal-client">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Edit Client' : 'Add New Client'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} data-testid="input-client-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 9876543210" {...field} data-testid="input-client-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="client@example.com" type="email" {...field} data-testid="input-client-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assignedAgentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Agent</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-agent">
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agents?.map((agent: User) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter complete address" 
                      rows={3} 
                      {...field} 
                      data-testid="textarea-client-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Government Approval Progress - only show for existing clients */}
            {client && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Government Approval Progress</h4>
                <div className="space-y-2">
                  {approvalSteps.map((step) => {
                    const status = getApprovalStepStatus(step.key);
                    return (
                      <div
                        key={step.key}
                        className="flex items-center justify-between p-2 rounded bg-muted/30"
                        data-testid={`approval-step-${step.key}`}
                      >
                        <span className="text-sm">{step.label}</span>
                        <Badge variant={getApprovalStatusVariant(status)} className="text-xs">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-client"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                data-testid="button-save-client"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {client ? 'Save Changes' : 'Create Client'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
