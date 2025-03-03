
import { useState } from 'react';
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
  
  console.log("JobSidebarActions props:", { isJobOwner, canApply, hasApplied, showApplicationForm, jobStatus: job.status });
  
  return (
    <div className="p-4 border-t">
      {canApply && job.status === 'open' && (
        <>
          {showApplicationForm ? (
            <Button variant="outline" onClick={onShowApplicationForm} className="w-full">
              Cancel Application
            </Button>
          ) : (
            <Button onClick={onShowApplicationForm} className="w-full">
              Apply for this Job
            </Button>
          )}
        </>
      )}
      
      {hasApplied && (
        <div className="mb-4">
          <ApplicationStatus status={hasApplied.status || 'pending'} compact />
        </div>
      )}
      
      {isJobOwner && (
        <Button onClick={() => navigate(`/jobs/${job.id}/applications`)} className="w-full mt-2">
          View Applications
        </Button>
      )}
      
      <Button variant="outline" onClick={() => navigate(`/jobs/${job.id}`)} className="w-full mt-2">
        View Full Details
      </Button>
    </div>
  );
}
