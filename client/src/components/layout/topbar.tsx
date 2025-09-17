import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TopBarProps {
  title: string;
  subtitle: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-pagetitle">{title}</h1>
          <p className="text-muted-foreground" data-testid="text-pagesubtitle">{subtitle}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search clients, agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-background"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              data-testid="badge-notification-count"
            >
              3
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
