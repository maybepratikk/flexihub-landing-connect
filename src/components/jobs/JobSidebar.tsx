
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  getJobById, 
  hasAppliedToJob,
  Job,
  applyForJobWithPitch,
  updateJobStatus
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { X } from 'lucide-react';

const applicationSchema = z.object({
  cover_letter: z.string().min(10, {
    message: "Cover letter must be at least 10 characters.",
  }),
  pitch: z.string().min(10, {
    message: "Pitch must be at least 10 characters.",
  }),
  proposed_rate: z.coerce.number().min(5, {
    message: "Proposed rate must be at least $5.",
  }),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface JobSidebarProps {
  jobId: string;
  onClose: () => void;
}

export function JobSidebar({ jobId, onClose }: JobSidebarProps) {
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState<{ id?: string, status?: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      cover_letter: "",
      pitch: "",
      proposed_rate: 0,
    },
  });

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

  const userType = user && 'user_metadata' in user ? (user.user_metadata as any).user_type : undefined;
  const isClient = userType === 'client';
  const isJobOwner = job.client_id === user?.id;
  const canApply = userType === 'freelancer' && !isJobOwner && !hasApplied && job.status === 'open';
  const isAccepted = hasApplied?.status === 'accepted';

  if (isAccepted) {
    updateJobStatus(job.id, 'in_progress');
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold truncate">{job.title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">
              Posted {job.created_at && formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </p>
            <Badge variant="outline" className="mt-2">
              Status: {job.status}
            </Badge>
          </div>
          <Badge variant={job.budget_type === 'fixed' ? 'outline' : 'default'}>
            {job.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}
          </Badge>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="whitespace-pre-line text-sm">{job.description}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Skills Required</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills_required.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-1 text-sm">Budget</h3>
            <p className="text-sm">${job.budget_min} - ${job.budget_max} {job.budget_type === 'hourly' && '/hr'}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm">Duration</h3>
            <p className="text-sm">{job.duration ? job.duration.charAt(0).toUpperCase() + job.duration.slice(1) + ' term' : 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm">Experience Level</h3>
            <p className="text-sm">{job.experience_level ? job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1) : 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm">Category</h3>
            <p className="text-sm">{job.category}</p>
          </div>
        </div>
        
        {job.profiles && (
          <div>
            <h3 className="font-semibold mb-2 text-sm">Posted by</h3>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={job.profiles.avatar_url || ''} />
                <AvatarFallback>{job.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{job.profiles.full_name}</span>
            </div>
          </div>
        )}
        
        {showApplicationForm && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold">Apply for this Job</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cover_letter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Letter</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Introduce yourself and explain why you're interested in this job."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pitch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pitch Yourself</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your relevant experience and why you're the best fit for this job. Include links to your portfolio or previous work."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="proposed_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Rate {job.budget_type === 'hourly' ? '(per hour)' : '(fixed)'}</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="mr-2">$</span>
                            <Input type="number" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" type="button" onClick={() => setShowApplicationForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Submit Application
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </>
        )}
      </div>
      
      <div className="p-4 border-t">
        {canApply ? (
          <>
            {showApplicationForm ? (
              <Button variant="outline" onClick={() => setShowApplicationForm(false)} className="w-full">
                Cancel Application
              </Button>
            ) : (
              <Button onClick={() => setShowApplicationForm(true)} className="w-full">
                Apply for this Job
              </Button>
            )}
          </>
        ) : hasApplied ? (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="font-medium">Application Status: {hasApplied.status}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasApplied.status === 'pending' ? 'Waiting for client review' :
               hasApplied.status === 'accepted' ? 'Congratulations! Your application was accepted.' :
               'Application was not selected for this position.'}
            </p>
          </div>
        ) : null}
        
        {isJobOwner && (
          <Button onClick={() => navigate(`/jobs/${job.id}/applications`)} className="w-full mt-2">
            View Applications
          </Button>
        )}
        
        <Button variant="outline" onClick={() => navigate(`/jobs/${job.id}`)} className="w-full mt-2">
          View Full Details
        </Button>
      </div>
    </div>
  );
}
