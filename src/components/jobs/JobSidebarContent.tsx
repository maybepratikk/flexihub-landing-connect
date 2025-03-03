
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { JobDetails } from './shared/JobDetails';
import { JobApplyForm, ApplicationFormData } from './shared/JobApplyForm';
import { Job } from '@/lib/supabase';

interface JobSidebarContentProps {
  job: Job;
  showApplicationForm: boolean;
  hasApplied: { id?: string, status?: string } | null;
  onSubmitApplication: (data: ApplicationFormData) => Promise<void>;
  onCancelApplication: () => void;
}

export function JobSidebarContent({
  job,
  showApplicationForm,
  hasApplied,
  onSubmitApplication,
  onCancelApplication
}: JobSidebarContentProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">
            Posted {job.created_at && new Date(job.created_at).toLocaleDateString()}
          </p>
          <Badge variant="outline" className="mt-2">
            Status: {job.status}
          </Badge>
        </div>
        <Badge variant={job.budget_type === 'fixed' ? 'outline' : 'default'}>
          {job.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}
        </Badge>
      </div>
      
      <JobDetails job={job} compact />
      
      {showApplicationForm && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold">Apply for this Job</h3>
            <JobApplyForm 
              onSubmit={onSubmitApplication} 
              onCancel={onCancelApplication} 
              budgetType={job.budget_type as 'fixed' | 'hourly'} 
            />
          </div>
        </>
      )}
    </div>
  );
}
