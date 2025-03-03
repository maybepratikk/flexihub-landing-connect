
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { JobDetails } from './shared/JobDetails';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ApplicationStatus } from './shared/ApplicationStatus';
import { Job } from '@/lib/supabase';

interface JobDetailContentProps {
  job: Job;
  canApply: boolean;
  isJobOwner: boolean;
  hasApplied: { id?: string, status?: string } | null;
  showApplicationForm: boolean;
  setShowApplicationForm: (show: boolean) => void;
}

export function JobDetailContent({
  job,
  canApply,
  isJobOwner,
  hasApplied,
  showApplicationForm,
  setShowApplicationForm
}: JobDetailContentProps) {
  const navigate = useNavigate();
  
  console.log("JobDetailContent props:", { 
    canApply, 
    isJobOwner, 
    hasApplied, 
    jobStatus: job.status 
  });

  return (
    <Card className="mb-8">
      <CardContent className="space-y-6 pt-6">
        <JobDetails job={job} />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3 justify-between items-center border-t pt-4 pb-4">
        <div>
          {canApply && job.status === 'open' && !hasApplied && (
            <>
              {showApplicationForm ? (
                <Button variant="outline" onClick={() => setShowApplicationForm(false)}>
                  Cancel Application
                </Button>
              ) : (
                <Button onClick={() => setShowApplicationForm(true)}>
                  Apply for this Job
                </Button>
              )}
            </>
          )}
          
          {hasApplied && (
            <div className="mt-2">
              <ApplicationStatus status={hasApplied.status || 'pending'} compact />
            </div>
          )}
        </div>
        
        {isJobOwner && (
          <Button onClick={() => navigate(`/jobs/${job.id}/applications`)}>
            View Applications
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
