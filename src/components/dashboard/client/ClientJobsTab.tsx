
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { JobsList } from './JobsList';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigateFunction } from 'react-router-dom';

interface ClientJobsTabProps {
  jobs: any[];
  navigate: NavigateFunction;
  loading: boolean;
  onUpdateApplicationStatus?: (jobId: string, applicationId: string, status: 'accepted' | 'rejected') => void;
  onJobsUpdated?: () => void;
}

export function ClientJobsTab({ 
  jobs, 
  navigate, 
  loading, 
  onUpdateApplicationStatus,
  onJobsUpdated
}: ClientJobsTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Your Jobs</CardTitle>
            <CardDescription>
              Jobs you've posted
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/post-job')}>
            <Plus className="mr-2 h-4 w-4" /> Post Job
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <JobsList 
            jobs={jobs} 
            navigate={navigate} 
            onUpdateApplicationStatus={onUpdateApplicationStatus}
            onJobsUpdated={onJobsUpdated}
          />
        )}
      </CardContent>
    </Card>
  );
}
