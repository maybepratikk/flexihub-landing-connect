
import { JobApplyForm, ApplicationFormData } from './shared/JobApplyForm';
import { Job } from '@/lib/supabase';
import { ApplicationStatus } from './shared/ApplicationStatus';

interface JobSidebarContentProps {
  job: Job;
  showApplicationForm: boolean;
  hasApplied: { id?: string; status?: string } | null;
  onSubmitApplication: (data: ApplicationFormData) => Promise<void>;
  onCancelApplication: () => void;
  userEmail?: string;
}

export function JobSidebarContent({
  job,
  showApplicationForm,
  hasApplied,
  onSubmitApplication,
  onCancelApplication,
  userEmail
}: JobSidebarContentProps) {
  return (
    <div className="flex-1 overflow-auto p-4">
      {showApplicationForm ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Apply for this Job</h3>
          <JobApplyForm
            onSubmit={onSubmitApplication}
            onCancel={onCancelApplication}
            budgetType={job.budget_type as 'fixed' | 'hourly'}
            defaultEmail={userEmail || ''}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <p className="text-sm">{job.description}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-1">
              {job.skills_required.map((skill, index) => (
                <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold">Budget</h3>
              <p>${job.budget_min} - ${job.budget_max} {job.budget_type === 'hourly' && '/hr'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Duration</h3>
              <p className="capitalize">{job.duration || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Category</h3>
              <p>{job.category}</p>
            </div>
            <div>
              <h3 className="font-semibold">Experience</h3>
              <p className="capitalize">{job.experience_level || 'Any'}</p>
            </div>
          </div>
          
          {hasApplied && (
            <div className="mt-4 p-4 border rounded-md bg-muted/50">
              <h3 className="text-sm font-semibold mb-2">Your Application</h3>
              <ApplicationStatus status={hasApplied.status || 'pending'} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
