
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { getJobById, applyForJob } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Clock, DollarSign, Award, User, Briefcase } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const JobDetailPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  // Application form state
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return;
      
      setLoading(true);
      try {
        const jobData = await getJobById(jobId);
        setJob(jobData);
      } catch (error) {
        console.error('Error loading job:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadJob();
  }, [jobId, toast]);
  
  const handleApply = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to sign in to apply for jobs',
        variant: 'destructive'
      });
      return;
    }
    
    if (user.user_metadata?.user_type !== 'freelancer') {
      toast({
        title: 'Action Not Allowed',
        description: 'Only freelancers can apply for jobs',
        variant: 'destructive'
      });
      return;
    }
    
    setShowApplicationForm(true);
  };
  
  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !jobId) return;
    
    setSubmitting(true);
    
    try {
      const application = {
        job_id: jobId,
        freelancer_id: user.id,
        cover_letter: coverLetter,
        proposed_rate: proposedRate ? parseFloat(proposedRate) : undefined
      };
      
      const result = await applyForJob(application);
      
      if (result) {
        toast({
          title: 'Application Submitted',
          description: 'Your application has been submitted successfully',
        });
        setShowApplicationForm(false);
        setApplying(true);
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The job you're looking for doesn't exist or has been removed
            </p>
            <Button asChild>
              <Link to="/jobs">Browse All Jobs</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  const isOwner = user && user.id === job.client_id;
  const isFreelancer = user && user.user_metadata?.user_type === 'freelancer';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            Back to Jobs
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <CardDescription>
                      Posted by {job.profiles.full_name} • {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : ''}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{job.category}</Badge>
                  <Badge variant={job.budget_type === 'fixed' ? 'outline' : 'default'}>
                    {job.budget_type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  </Badge>
                  {job.experience_level && (
                    <Badge variant="outline">
                      {job.experience_level === 'entry' ? 'Entry Level' : 
                       job.experience_level === 'intermediate' ? 'Intermediate' : 'Expert'}
                    </Badge>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Job Description</h3>
                  <div className="text-muted-foreground whitespace-pre-line">
                    {job.description}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required && job.skills_required.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {showApplicationForm && isFreelancer && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this Job</CardTitle>
                  <CardDescription>
                    Tell the client why you're a good fit for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitApplication} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="coverLetter">
                        Cover Letter
                      </label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Introduce yourself and explain why you're suitable for this job..."
                        className="min-h-[150px]"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="proposedRate">
                        Proposed Rate ({job.budget_type === 'fixed' ? 'Total' : 'Hourly'} in $)
                      </label>
                      <Input
                        id="proposedRate"
                        type="number"
                        placeholder={job.budget_type === 'fixed' ? 'Your total price' : 'Your hourly rate'}
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowApplicationForm(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Application'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Budget</h3>
                    <p>
                      ${job.budget_min} - ${job.budget_max}
                      {job.budget_type === 'hourly' && '/hr'}
                    </p>
                  </div>
                </div>
                
                {job.duration && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Duration</h3>
                      <p>
                        {job.duration === 'short' ? 'Short Term (< 1 month)' : 
                         job.duration === 'medium' ? 'Medium Term (1-3 months)' : 'Long Term (3+ months)'}
                      </p>
                    </div>
                  </div>
                )}
                
                {job.experience_level && (
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Experience Level</h3>
                      <p>
                        {job.experience_level === 'entry' ? 'Entry Level' : 
                         job.experience_level === 'intermediate' ? 'Intermediate' : 'Expert'}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Posted By</h3>
                    <p>{job.profiles.full_name}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Posted On</h3>
                    <p>
                      {job.created_at ? format(new Date(job.created_at), 'PPP') : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {isOwner ? (
                  <Button className="w-full" variant="outline" asChild>
                    <Link to={`/jobs/${job.id}/applications`}>
                      View Applications
                    </Link>
                  </Button>
                ) : isFreelancer ? (
                  applying ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Applied
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={handleApply}
                      disabled={showApplicationForm}
                    >
                      Apply Now
                    </Button>
                  )
                ) : (
                  <Button className="w-full" onClick={() => navigate('/signup')}>
                    Sign Up to Apply
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>About the Client</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {job.profiles.full_name}
                </p>
                {/* We could add more client details here in the future */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailPage;
