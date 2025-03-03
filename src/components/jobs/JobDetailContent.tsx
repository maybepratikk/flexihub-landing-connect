
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

  return (
    <Card className="mb-8">
      <CardContent className="space-y-6">
        <JobDetails job={job} />
      </CardContent>
      <CardFooter>
        {canApply && (
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
          <div className="text-muted-foreground">
            You have already applied to this job. Status: {hasApplied.status}
          </div>
        )}
        
        {isJobOwner && (
          <Button onClick={() => navigate(`/jobs/${job.id}/applications`)}>
            View Applications
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
