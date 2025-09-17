import { TopBar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  IndianRupee, 
  FileText, 
  CreditCard, 
  TrendingUp,
  Plus,
  Eye,
  Download 
} from 'lucide-react';

export default function Finance() {
  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar 
        title="Finance" 
        subtitle="Manage invoices, quotations, and payment tracking" 
      />
      
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Financial Overview</h2>
            <p className="text-sm text-muted-foreground">
              Track your revenue, invoices, and payments
            </p>
          </div>
          <Button data-testid="button-create-invoice">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <IndianRupee className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">₹12.5L</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">₹0</p>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No invoices found</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first invoice to start tracking payments and revenue.
              </p>
              <Button data-testid="button-create-first-invoice">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
