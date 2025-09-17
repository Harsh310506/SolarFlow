import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Package, Plus, AlertTriangle } from 'lucide-react';
import type { Inventory } from '@/types';

export default function Inventory() {
  const { data: inventory = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ['/api/inventory'],
  });

  const isLowStock = (item: Inventory) => item.quantity <= item.threshold;
  const isCriticalStock = (item: Inventory) => item.quantity <= 5;

  const getStockBadgeVariant = (item: Inventory) => {
    if (isCriticalStock(item)) return 'destructive';
    if (isLowStock(item)) return 'secondary';
    return 'outline';
  };

  const getStockBadgeText = (item: Inventory) => {
    if (isCriticalStock(item)) return 'Critical';
    if (isLowStock(item)) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar 
        title="Inventory" 
        subtitle="Manage your solar equipment and stock levels" 
      />
      
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Stock Management</h2>
            <p className="text-sm text-muted-foreground">
              {inventory.length} item{inventory.length !== 1 ? 's' : ''} in inventory
            </p>
          </div>
          <Button data-testid="button-add-inventory">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-2xl font-bold">{inventory.length}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {inventory.filter(isLowStock).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {inventory.filter(isCriticalStock).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Critical Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No inventory items found</p>
                <Button data-testid="button-add-first-item">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Item
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id} data-testid={`inventory-row-${item.id}`}>
                        <TableCell className="font-medium" data-testid={`text-item-name-${item.id}`}>
                          {item.itemName}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-48 truncate">
                          {item.description || 'No description'}
                        </TableCell>
                        <TableCell data-testid={`text-quantity-${item.id}`}>
                          <span className={isCriticalStock(item) ? 'text-red-600 font-semibold' : ''}>
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.threshold}
                        </TableCell>
                        <TableCell data-testid={`text-price-${item.id}`}>
                          {item.unitPrice ? `₹${item.unitPrice}` : 'Not set'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStockBadgeVariant(item)}
                            data-testid={`badge-stock-status-${item.id}`}
                          >
                            {getStockBadgeText(item)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`button-edit-item-${item.id}`}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`button-request-stock-${item.id}`}
                            >
                              Request
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
      </main>
    </div>
  );
}
