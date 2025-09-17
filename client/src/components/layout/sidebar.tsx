import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Users,
  FileCheck,
  Bus,
  Package,
  CreditCard,
  CheckSquare,
  TrendingUp,
  Settings,
  LogOut,
  Sun,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: typeof BarChart3;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/approvals', label: 'Government Approvals', icon: FileCheck },
  { href: '/agents', label: 'Agents', icon: Bus, adminOnly: true },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/finance', label: 'Finance', icon: CreditCard },
  { href: '/tasks', label: 'Tasks & Reminders', icon: CheckSquare },
  { href: '/reports', label: 'Reports', icon: TrendingUp },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="w-64 bg-card shadow-lg border-r border-border h-full">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sun className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">SolarFlow</span>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg mb-6" data-testid="user-profile">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm" data-testid="text-username">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize" data-testid="text-userrole">
              {user?.role}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  data-testid={`nav-${item.href.replace('/', '')}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
