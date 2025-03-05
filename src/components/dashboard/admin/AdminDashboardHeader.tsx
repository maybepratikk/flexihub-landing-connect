
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AdminDashboardHeaderProps {
  onRefresh?: () => void;
}

export function AdminDashboardHeader({ onRefresh }: AdminDashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and monitor platform activities
        </p>
      </div>
      <div className="flex gap-2">
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
          </Button>
        )}
      </div>
    </div>
  );
}
