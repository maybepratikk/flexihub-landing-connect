
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Job } from '@/lib/supabase';
import { ApplicationStatus } from './shared/ApplicationStatus';

interface JobSidebarActionsProps {
  job: Job;
  isJobOwner: boolean;
  canApply: boolean;
  hasApplied: { id?: string, status?: string } | null;
  onShowApplicationForm: () => void;
  showApplicationForm: boolean;
}

export function JobSidebarActions({
  job,
  isJobOwner,
  canApply,
  hasApplied,
  onShowApplicationForm,
  showApplicationForm
}: JobSidebarActionsProps) {
  const navigate = useNavigate();
  
  console.log("JobSidebarActions props:", { 
    isJobOwner, 
    canApply, 
    hasApplied, 
    showApplicationForm, 
    jobStatus: job.status 
  });
  
  return (
    <div className="p-4 border-t">
      {/* Show application status if the user has applied */}
      {hasApplied && (
        <div className="mb-4">
          <ApplicationStatus status={hasApplied.status || 'pending'} compact />
        </div>
      )}
      
      {/* Show the apply button for freelancers who haven't applied and the job is open */}
      {canApply && (
        <>
          {showApplicationForm ? (
            <Button variant="outline" onClick={onShowApplicationForm} className="w-full mb-2">
              Cancel Application
            </Button>
          ) : (
            <Button onClick={onShowApplicationForm} className="w-full mb-2">
              Apply for this Job
            </Button>
          )}
        </>
      )}
      
      {/* Show view applications button for job owners */}
      {isJobOwner && (
        <Button 
          onClick={() => navigate(`/dashboard?view=applications&jobId=${job.id}`)} 
          className="w-full mt-2"
          data-testid="view-applications-button"
        >
          View Applications
        </Button>
      )}
      
      <Button variant="outline" onClick={() => navigate(`/jobs/${job.id}`)} className="w-full mt-2">
        View Full Details
      </Button>
    </div>
  );
}
