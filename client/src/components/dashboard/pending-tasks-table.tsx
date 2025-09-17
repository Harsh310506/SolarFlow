import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { isAfter } from 'date-fns';
import type { DashboardMetrics } from '@/types';

interface PendingTasksTableProps {
  tasks: DashboardMetrics['pendingTasks'];
  isLoading?: boolean;
  onMarkComplete?: (taskId: string) => void;
}

export function PendingTasksTable({ tasks, isLoading, onMarkComplete }: PendingTasksTableProps) {
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

  const getPriorityColor = (task: typeof tasks[0]) => {
    if (!task.dueDate) return 'bg-blue-500';
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (isAfter(now, dueDate)) return 'bg-red-500'; // Overdue
    
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 1) return 'bg-red-500'; // Due today/tomorrow
    if (daysDiff <= 3) return 'bg-yellow-500'; // Due soon
    
    return 'bg-green-500'; // Not urgent
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

  return (
    <Card className="shadow-sm" data-testid="card-pending-tasks">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pending Tasks</CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-view-all-tasks">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No pending tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30"
                data-testid={`task-${task.id}`}
              >
                <div className={`w-2 h-2 ${getPriorityColor(task)} rounded-full mt-2 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" data-testid={`text-task-title-${task.id}`}>
                    {task.title} - {task.client.name}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-task-agent-${task.id}`}>
                    Assigned to {task.assignedAgent.name}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <Badge 
                      variant={task.dueDate && isAfter(new Date(), new Date(task.dueDate)) ? "destructive" : "secondary"}
                      className="text-xs"
                      data-testid={`badge-due-date-${task.id}`}
                    >
                      {getDueDateText(task.dueDate)}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkComplete?.(task.id)}
                  className="text-xs text-primary hover:text-primary/80 flex-shrink-0"
                  data-testid={`button-complete-task-${task.id}`}
                >
                  Mark Complete
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
