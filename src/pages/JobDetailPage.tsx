
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getJobById, 
  applyForJobWithPitch, 
  hasAppliedToJob,
  Job
} from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { JobDetailHeader } from '@/components/jobs/JobDetailHeader';
import { JobDetailContent } from '@/components/jobs/JobDetailContent';
import { JobDetailApplication } from '@/components/jobs/JobDetailApplication';
import { ApplicationFormData } from '@/components/jobs/shared/JobApplyForm';

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
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
      const fetchedJob = await getJobById(jobId);
      setJob(fetchedJob);
      
      if (user && fetchedJob) {
        const application = await hasAppliedToJob(jobId, user.id);
        setHasApplied(application);
      }
      
      setLoading(false);
    };

    fetchJob();
  }, [jobId, user]);

  const onSubmit = async (data: ApplicationFormData) => {
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
      <div className="container mx-auto py-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Job not found</h1>
        <button onClick={() => navigate('/jobs')}>Back to Jobs</button>
      </div>
    );
  }

  const userType = user && 'user_metadata' in user ? (user.user_metadata as any).user_type : undefined;
  const isClient = userType === 'client';
  const isJobOwner = job.client_id === user?.id;
  const canApply = userType === 'freelancer' && !isJobOwner && !hasApplied;

  return (
    <div className="container mx-auto py-10">
      <JobDetailHeader job={job} />

      <JobDetailContent
        job={job}
        canApply={canApply}
        isJobOwner={isJobOwner}
        hasApplied={hasApplied}
        showApplicationForm={showApplicationForm}
        setShowApplicationForm={setShowApplicationForm}
      />
      
      {showApplicationForm && (
        <JobDetailApplication 
          onSubmit={onSubmit}
          onCancel={() => setShowApplicationForm(false)}
          budgetType={job.budget_type as 'fixed' | 'hourly'}
        />
      )}
    </div>
  );
}
