import { Card, CardContent } from '@/components/ui/card';
import { Users, FolderOpen, Clock, IndianRupee, TrendingUp, AlertTriangle } from 'lucide-react';
import type { DashboardMetrics } from '@/types';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
  isLoading?: boolean;
}

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Clients',
      value: metrics.totalClients.toString(),
      icon: Users,
      trend: '+12% from last month',
      trendUp: true,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Active Projects',
      value: metrics.activeProjects.toString(),
      icon: FolderOpen,
      trend: '+8% from last month',
      trendUp: true,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Pending Approvals',
      value: metrics.pendingApprovals.toString(),
      icon: Clock,
      trend: '5 overdue items',
      trendUp: false,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Monthly Revenue',
      value: metrics.monthlyRevenue,
      icon: IndianRupee,
      trend: '+15% from last month',
      trendUp: true,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trendUp ? TrendingUp : AlertTriangle;
        
        return (
          <Card key={card.title} className="shadow-sm" data-testid={`card-metric-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{card.title}</p>
                  <p className="text-2xl font-bold" data-testid={`text-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
              <div className={`flex items-center mt-2 text-sm ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                <TrendIcon className="h-4 w-4 mr-1" />
                <span data-testid={`text-trend-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {card.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
