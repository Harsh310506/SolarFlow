import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  TrendingUp, 
  Download, 
  FileText, 
  Users, 
  Package,
  CreditCard,
  BarChart3,
  PieChart,
  FileSpreadsheet
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import type { ClientWithAgent, TaskWithClient, Inventory, DashboardMetrics } from '@/types';

export default function Reports() {
  const [reportType, setReportType] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('30');
  
  const { user } = useAuth();

  const { data: clients = [] } = useQuery<ClientWithAgent[]>({
    queryKey: ['/api/clients'],
  });

  const { data: tasks = [] } = useQuery<TaskWithClient[]>({
    queryKey: ['/api/tasks'],
  });

  const { data: inventory = [] } = useQuery<Inventory[]>({
    queryKey: ['/api/inventory'],
  });

  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
  });

  const generateReport = (type: string) => {
    // In a real implementation, this would trigger a download
    console.log(`Generating ${type} report for the last ${dateRange} days`);
  };

  const reportTypes = [
    { value: 'overview', label: 'Business Overview', icon: BarChart3 },
    { value: 'clients', label: 'Client Report', icon: Users },
    { value: 'approvals', label: 'Approval Status', icon: FileText },
    { value: 'inventory', label: 'Inventory Report', icon: Package },
    { value: 'finance', label: 'Financial Report', icon: CreditCard },
    { value: 'performance', label: 'Agent Performance', icon: TrendingUp },
  ];

  const exportFormats = [
    { value: 'pdf', label: 'PDF Report', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet },
  ];

  const getClientStatusCounts = () => {
    return {
      lead: clients.filter(c => c.projectStatus === 'lead').length,
      inProgress: clients.filter(c => c.projectStatus === 'in-progress').length,
      completed: clients.filter(c => c.projectStatus === 'completed').length,
    };
  };

  const getInventoryAlerts = () => {
    return inventory.filter(item => item.quantity <= item.threshold);
  };

  const getTaskStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => 
        t.dueDate && new Date() > new Date(t.dueDate) && t.status === 'pending'
      ).length,
    };
  };

  const statusCounts = getClientStatusCounts();
  const inventoryAlerts = getInventoryAlerts();
  const taskStats = getTaskStats();

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar 
        title="Reports" 
        subtitle="Generate and export business reports and analytics" 
      />
      
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Business Reports</h2>
            <p className="text-sm text-muted-foreground">
              Analyze your business performance and export data
            </p>
          </div>
        </div>

        {/* Report Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger data-testid="select-date-range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium mb-2">Export Format</label>
              <div className="flex space-x-2">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <Button
                      key={format.value}
                      variant="outline"
                      onClick={() => generateReport(format.value)}
                      className="flex-1"
                      data-testid={`button-export-${format.value}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {format.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Content Based on Selection */}
        {reportType === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{clients.length}</p>
                      <p className="text-sm text-muted-foreground">Total Clients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{statusCounts.inProgress}</p>
                      <p className="text-sm text-muted-foreground">Active Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{inventoryAlerts.length}</p>
                      <p className="text-sm text-muted-foreground">Low Stock Items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{taskStats.pending}</p>
                      <p className="text-sm text-muted-foreground">Pending Tasks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Approval Pipeline Progress */}
            {metrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Approval Pipeline Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {metrics.approvalPipeline.map((step, index) => (
                      <div key={step.step} className="text-center p-4 border rounded-lg">
                        <div className={`w-3 h-3 bg-blue-${(index + 1) * 100} rounded-full mx-auto mb-2`}></div>
                        <h4 className="font-semibold text-sm mb-1 capitalize">{step.step.replace('_', ' ')}</h4>
                        <p className="text-lg font-bold">{step.count}</p>
                        <p className="text-xs text-muted-foreground">{step.percentage}% complete</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {reportType === 'clients' && (
          <Card>
            <CardHeader>
              <CardTitle>Client Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id} data-testid={`client-report-row-${client.id}`}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{client.phone}</p>
                            {client.email && (
                              <p className="text-xs text-muted-foreground">{client.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{client.assignedAgent?.name || 'Unassigned'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            client.projectStatus === 'completed' ? 'default' :
                            client.projectStatus === 'in-progress' ? 'secondary' : 'outline'
                          }>
                            {client.projectStatus.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(client.createdAt), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === 'inventory' && (
          <Card>
            <CardHeader>
              <CardTitle>Inventory Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id} data-testid={`inventory-report-row-${item.id}`}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell>
                          <span className={item.quantity <= item.threshold ? 'text-red-600 font-semibold' : ''}>
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell>{item.threshold}</TableCell>
                        <TableCell>{item.unitPrice ? `₹${item.unitPrice}` : 'Not set'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            item.quantity <= 5 ? 'destructive' :
                            item.quantity <= item.threshold ? 'secondary' : 'outline'
                          }>
                            {item.quantity <= 5 ? 'Critical' :
                             item.quantity <= item.threshold ? 'Low Stock' : 'In Stock'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === 'performance' && user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Agent performance tracking coming soon</p>
                <p className="text-sm text-muted-foreground">
                  This section will show detailed performance metrics for each agent including 
                  client handling, task completion rates, and revenue generation.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === 'finance' && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Financial reporting coming soon</p>
                <p className="text-sm text-muted-foreground">
                  This section will include revenue analysis, payment tracking, 
                  outstanding amounts, and profit margins.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === 'approvals' && (
          <Card>
            <CardHeader>
              <CardTitle>Government Approval Status Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Approval status reporting coming soon</p>
                <p className="text-sm text-muted-foreground">
                  This section will show detailed approval progress, pending submissions, 
                  and completion timelines for all government approval stages.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
