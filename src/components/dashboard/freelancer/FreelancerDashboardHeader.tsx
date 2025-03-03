
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FreelancerDashboardHeader() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
        <p className="text-muted-foreground">
          Find jobs and manage your applications
        </p>
      </div>
      <Button onClick={() => navigate('/jobs')}>
        <Search className="mr-2 h-4 w-4" /> Find Jobs
      </Button>
    </div>
  );
}
