
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getJobById, 
  hasAppliedToJob,
  Job,
  applyForJobWithPitch,
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';
import { JobSidebarHeader } from './JobSidebarHeader';
import { JobSidebarContent } from './JobSidebarContent';
import { JobSidebarActions } from './JobSidebarActions';
import { ApplicationFormData } from './shared/JobApplyForm';

interface JobSidebarProps {
  jobId: string;
  onClose: () => void;
}

export function JobSidebar({ jobId, onClose }: JobSidebarProps) {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState<{ id?: string, status?: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      setLoading(true);
      try {
        const fetchedJob = await getJobById(jobId);
        console.log("Fetched job:", fetchedJob);
        
        if (fetchedJob) {
          setJob(fetchedJob);
          
          if (user) {
            const application = await hasAppliedToJob(jobId, user.id);
            console.log("Application status:", application);
            setHasApplied(application);
          }
        } else {
          console.error("Job not found with ID:", jobId);
        }
      } catch (error) {
        console.error("Error in fetchJob:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, user]);

  const onSubmitApplication = async (data: ApplicationFormData) => {
    if (!user || !job) return;

    try {
      const application = await applyForJobWithPitch({
        job_id: job.id,
        freelancer_id: user.id,
        cover_letter: data.cover_letter,
        pitch: data.pitch,
        proposed_rate: data.proposed_rate
      });

      if (application) {
        setHasApplied({ id: application.id, status: application.status });
        setShowApplicationForm(false);
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted successfully.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="h-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Job not found</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground">This job may have been removed or is no longer available.</p>
        <Button 
          variant="outline" 
          className="mt-4 w-full"
          onClick={() => navigate('/jobs')}
        >
          Browse other jobs
        </Button>
      </div>
    );
  }

  // Get user type from user metadata
  const userType = user?.user_metadata?.user_type;
  const isFreelancer = userType === 'freelancer';
  const isJobOwner = job.client_id === user?.id;
  
  // A user can apply if they are:
  // 1. A freelancer (user_type is 'freelancer')
  // 2. Not the job owner
  // 3. Haven't already applied
  // 4. The job is still open
  const canApply = isFreelancer && !isJobOwner && !hasApplied && job.status === 'open';
  
  console.log("Job sidebar state:", { 
    userType,
    isFreelancer, 
    isJobOwner, 
    canApply, 
    hasApplied, 
    jobStatus: job.status,
    userObject: user,
    userMetadata: user?.user_metadata
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <JobSidebarHeader title={job.title} onClose={onClose} />
      
      <JobSidebarContent
        job={job}
        showApplicationForm={showApplicationForm}
        hasApplied={hasApplied}
        onSubmitApplication={onSubmitApplication}
        onCancelApplication={() => setShowApplicationForm(false)}
      />
      
      <JobSidebarActions
        job={job}
        isJobOwner={isJobOwner}
        canApply={canApply}
        hasApplied={hasApplied}
        onShowApplicationForm={() => setShowApplicationForm(!showApplicationForm)}
        showApplicationForm={showApplicationForm}
      />
    </div>
  );
}
