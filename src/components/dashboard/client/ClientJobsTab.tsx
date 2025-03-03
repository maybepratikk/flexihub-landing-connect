
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JobsList } from './JobsList';

interface ClientJobsTabProps {
  jobs: any[];
  loadJobApplications: (jobId: string) => void;
  loadingApplications: Record<string, boolean>;
  jobApplications: Record<string, any[]>;
  handleStatusUpdate: (jobId: string, applicationId: string, status: 'accepted' | 'rejected') => void;
}

export function ClientJobsTab({ 
  jobs, 
  loadJobApplications, 
  loadingApplications, 
  jobApplications,
  handleStatusUpdate
}: ClientJobsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Job Postings</CardTitle>
        <CardDescription>
          Manage your active and past job postings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <JobsList 
          jobs={jobs} 
          loadJobApplications={loadJobApplications} 
          loadingApplications={loadingApplications} 
          jobApplications={jobApplications}
        />
      </CardContent>
    </Card>
  );
}
