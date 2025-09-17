import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Upload, 
  Receipt, 
  Package,
} from 'lucide-react';
import type { DashboardMetrics } from '@/types';

interface QuickActionsProps {
  lowStockItems: DashboardMetrics['lowStockItems'];
  isLoading?: boolean;
}

export function QuickActions({ lowStockItems, isLoading }: QuickActionsProps) {
  const actions = [
    {
      icon: UserPlus,
      label: 'Add New Client',
      color: 'text-primary',
      testId: 'button-add-client',
    },
    {
      icon: Upload,
      label: 'Upload Documents',
      color: 'text-green-600',
      testId: 'button-upload-documents',
    },
    {
      icon: Receipt,
      label: 'Generate Invoice',
      color: 'text-blue-600',
      testId: 'button-generate-invoice',
    },
    {
      icon: Package,
      label: 'Stock Request',
      color: 'text-purple-600',
      testId: 'button-stock-request',
    },
  ];

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm" data-testid="card-quick-actions">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="w-full justify-start"
                data-testid={action.testId}
              >
                <Icon className={`h-5 w-5 mr-3 ${action.color}`} />
                <span className="text-sm">{action.label}</span>
              </Button>
            );
          })}
        </div>
        
        {/* Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Stock Alerts</h4>
            <div className="space-y-2">
              {lowStockItems.slice(0, 2).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between text-sm"
                  data-testid={`stock-alert-${item.id}`}
                >
                  <span>{item.itemName}</span>
                  <Badge variant="destructive" className="text-xs">
                    {item.quantity <= 5 ? 'Critical' : 'Low Stock'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
