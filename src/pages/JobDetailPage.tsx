
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getJobById, 
  applyForJobWithPitch, 
  hasAppliedToJob,
  Job,
  JobApplication
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
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
      const fetchedJob = await getJobById(jobId);
      setJob(fetchedJob);
      
      if (user && fetchedJob) {
        // Check if user has already applied
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
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  const isClient = user?.user_type === 'client';
  const isJobOwner = job.client_id === user?.id;
  const canApply = user?.user_type === 'freelancer' && !isJobOwner && !hasApplied;

  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" onClick={() => navigate('/jobs')} className="mb-6">
        Back to Jobs
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <CardDescription>Posted {job.created_at && formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</CardDescription>
            </div>
            <Badge variant={job.budget_type === 'fixed' ? 'outline' : 'default'}>
              {job.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="whitespace-pre-line">{job.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Skills Required</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills_required.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Budget</h3>
              <p>${job.budget_min} - ${job.budget_max} {job.budget_type === 'hourly' && '/hr'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Duration</h3>
              <p>{job.duration ? job.duration.charAt(0).toUpperCase() + job.duration.slice(1) + ' term' : 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Experience Level</h3>
              <p>{job.experience_level ? job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1) : 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <p>{job.category}</p>
            </div>
          </div>
          
          {job.profiles && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Posted by</h3>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={job.profiles.avatar_url || ''} />
                  <AvatarFallback>{job.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span>{job.profiles.full_name}</span>
              </div>
            </div>
          )}
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
      
      {showApplicationForm && (
        <Card>
          <CardHeader>
            <CardTitle>Apply for this Job</CardTitle>
            <CardDescription>Please complete the application form below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="cover_letter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Letter</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Introduce yourself and explain why you're interested in this job."
                          className="min-h-[120px]"
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
                          placeholder="Describe your relevant experience and why you're the best fit for this job. You can include links to your portfolio, previous work, or testimonials."
                          className="min-h-[200px]"
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
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => setShowApplicationForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Application
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
