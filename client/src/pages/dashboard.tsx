import { useQuery } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/topbar';
import { MetricsCards } from '@/components/dashboard/metrics-cards';
import { ApprovalPipeline } from '@/components/dashboard/approval-pipeline';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentClientsTable } from '@/components/dashboard/recent-clients-table';
import { PendingTasksTable } from '@/components/dashboard/pending-tasks-table';
import { useAuthenticatedRequest } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';
import type { DashboardMetrics } from '@/types';

export default function Dashboard() {
  const makeRequest = useAuthenticatedRequest();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
    queryFn: async () => {
      const response = await makeRequest('GET', '/api/dashboard/metrics');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleMarkTaskComplete = async (taskId: string) => {
    try {
      await makeRequest('PUT', `/api/tasks/${taskId}`, { status: 'completed' });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    } catch (error) {
      console.error('Failed to mark task as complete:', error);
    }
  };

  if (!metrics && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <TopBar 
          title="Dashboard" 
          subtitle="Welcome back, manage your solar business operations" 
        />
        <main className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load dashboard data</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar 
        title="Dashboard" 
        subtitle="Welcome back, manage your solar business operations" 
      />
      
      <main className="p-6">
        {/* Metrics Cards */}
        {metrics ? (
          <MetricsCards metrics={metrics} isLoading={isLoading} />
        ) : (
          <MetricsCards 
            metrics={{
              totalClients: 0,
              activeProjects: 0,
              pendingApprovals: 0,
              monthlyRevenue: "₹0L",
              approvalPipeline: [],
              lowStockItems: [],
              recentClients: [],
              pendingTasks: []
            }} 
            isLoading={isLoading} 
          />
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ApprovalPipeline 
            pipeline={metrics?.approvalPipeline || []} 
            isLoading={isLoading} 
          />
          <QuickActions 
            lowStockItems={metrics?.lowStockItems || []} 
            isLoading={isLoading} 
          />
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RecentClientsTable 
            clients={metrics?.recentClients || []} 
            isLoading={isLoading} 
          />
          <PendingTasksTable 
            tasks={metrics?.pendingTasks || []} 
            isLoading={isLoading}
            onMarkComplete={handleMarkTaskComplete}
          />
        </div>
      </main>
    </div>
  );
}
