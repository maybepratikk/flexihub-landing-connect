
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientDashboardHeaderProps {
  onRefresh?: () => void;
}

export function ClientDashboardHeader({ onRefresh }: ClientDashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your jobs and contracts
        </p>
      </div>
      <div className="flex gap-2">
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
        )}
        <Button onClick={() => navigate('/post-job')}>
          <Plus className="mr-2 h-4 w-4" /> Post a Job
        </Button>
      </div>
    </div>
  );
}
