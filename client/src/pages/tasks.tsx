import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TopBar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  CheckSquare, 
  Plus, 
  Edit, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow, isAfter, format } from 'date-fns';
import { useAuthenticatedRequest, useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';
import { insertTaskSchema, type InsertTask, type TaskWithClient, type ClientWithAgent } from '@/types';
import { z } from 'zod';

const createTaskSchema = insertTaskSchema.extend({
  dueDate: z.string().optional(),
});

type CreateTaskData = z.infer<typeof createTaskSchema>;

export default function Tasks() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithClient | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterClient, setFilterClient] = useState<string>('');
  
  const { user } = useAuth();
  const makeRequest = useAuthenticatedRequest();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<TaskWithClient[]>({
    queryKey: ['/api/tasks'],
  });

  const { data: clients = [] } = useQuery<ClientWithAgent[]>({
    queryKey: ['/api/clients'],
  });

  const form = useForm<CreateTaskData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      clientId: '',
      assignedAgentId: '',
      dueDate: '',
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const taskData: InsertTask = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      };
      await makeRequest('POST', '/api/tasks', taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      setIsCreateModalOpen(false);
      form.reset();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTask> }) => {
      await makeRequest('PUT', `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
    },
  });

  const handleCreateTask = (data: CreateTaskData) => {
    createTaskMutation.mutate(data);
  };

  const handleMarkComplete = (task: TaskWithClient) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: 'completed' },
    });
  };

  const handleMarkPending = (task: TaskWithClient) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: 'pending' },
    });
  };

  const getPriorityColor = (task: TaskWithClient) => {
    if (!task.dueDate) return 'bg-blue-500';
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (isAfter(now, dueDate)) return 'bg-red-500'; // Overdue
    
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 1) return 'bg-red-500'; // Due today/tomorrow
    if (daysDiff <= 3) return 'bg-yellow-500'; // Due soon
    
    return 'bg-green-500'; // Not urgent
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'overdue':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const getDueDateText = (dueDate: Date | string | null) => {
    if (!dueDate) return 'No due date';
    
    const due = new Date(dueDate);
    const now = new Date();
    
    if (isAfter(now, due)) {
      return `Overdue by ${formatDistanceToNow(due)}`;
    }
    
    return `Due ${formatDistanceToNow(due, { addSuffix: true })}`;
  };

  const isOverdue = (dueDate: Date | string | null) => {
    if (!dueDate) return false;
    return isAfter(new Date(), new Date(dueDate));
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus && task.status !== filterStatus) return false;
    if (filterClient && task.clientId !== filterClient) return false;
    return true;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.dueDate && isOverdue(t.dueDate)).length,
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar 
        title="Tasks & Reminders" 
        subtitle="Manage tasks, follow-ups, and automated reminders" 
      />
      
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Task Management</h2>
            <p className="text-sm text-muted-foreground">
              Stay on top of all project tasks and deadlines
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-task">
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckSquare className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-2xl font-bold">{taskStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterClient} onValueChange={setFilterClient}>
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

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No tasks found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first task to start tracking project activities.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-first-task">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Task
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id} data-testid={`task-row-${task.id}`}>
                        <TableCell>
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 ${getPriorityColor(task)} rounded-full mt-2 flex-shrink-0`}></div>
                            <div>
                              <p className="font-medium" data-testid={`text-task-title-${task.id}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground max-w-64 truncate">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {task.client.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{task.client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {task.assignedAgent.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{task.assignedAgent.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {task.dueDate ? (
                              <div>
                                <p>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</p>
                                <p className={`text-xs ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-muted-foreground'}`}>
                                  {getDueDateText(task.dueDate)}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No due date</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(task.status)}
                            <Badge variant={getStatusVariant(task.status)}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {task.status === 'pending' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkComplete(task)}
                                data-testid={`button-complete-task-${task.id}`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkPending(task)}
                                data-testid={`button-reopen-task-${task.id}`}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-edit-task-${task.id}`}
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

        {/* Create Task Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent data-testid="modal-create-task">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateTask)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} data-testid="input-task-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter task description" 
                          rows={3} 
                          {...field} 
                          data-testid="textarea-task-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-task-client">
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assignedAgentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign To</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          defaultValue={user?.role === 'agent' ? user.id : ''}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-task-agent">
                              <SelectValue placeholder="Select agent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => 
                              client.assignedAgent ? (
                                <SelectItem key={client.assignedAgent.id} value={client.assignedAgent.id}>
                                  {client.assignedAgent.name}
                                </SelectItem>
                              ) : null
                            ).filter((item, index, self) => 
                              index === self.findIndex(t => t?.key === item?.key)
                            )}
                            {user?.role === 'agent' && (
                              <SelectItem value={user.id}>{user.name} (Me)</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-task-due-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    data-testid="button-cancel-task"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTaskMutation.isPending}
                    data-testid="button-save-task"
                  >
                    {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
