
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { JobApplicationsList } from './JobApplicationsList';

interface JobsListProps {
  jobs: any[];
  loadJobApplications: (jobId: string) => void;
  loadingApplications: Record<string, boolean>;
  jobApplications: Record<string, any[]>;
}

export function JobsList({ jobs, loadJobApplications, loadingApplications, jobApplications }: JobsListProps) {
  const navigate = useNavigate();

  if (jobs.length === 0) {
    return (
      <div className="text-center py-6">
        <Briefcase className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">You haven't posted any jobs yet</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/post-job')}>
          Post Your First Job
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {jobs.map((job) => (
        <div key={job.id} className="border rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  <Link to={`/jobs/${job.id}`} className="hover:underline">
                    {job.title}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Posted {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : ''}
                </p>
                <div className="mt-2">
                  <Badge 
                    variant={
                      job.status === 'open' ? 'secondary' : 
                      job.status === 'in_progress' ? 'outline' : 'destructive'
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  data-testid="view-applications-button"
                  onClick={() => loadJobApplications(job.id)}
                >
                  {loadingApplications[job.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "View Applications"
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {jobApplications[job.id] && (
            <JobApplicationsList 
              jobId={job.id} 
              applications={jobApplications[job.id]} 
              navigate={navigate}
            />
          )}
        </div>
      ))}
    </div>
  );
}
