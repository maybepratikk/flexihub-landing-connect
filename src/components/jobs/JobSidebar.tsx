
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Job, hasAppliedToJob, applyForJobWithPitch } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Clock, DollarSign, Award } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface JobSidebarProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobSidebar({ job, isOpen, onClose }: JobSidebarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  // Application form state
  const [coverLetter, setCoverLetter] = useState('');
  const [pitch, setPitch] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!job || !user) return;
      
      try {
        const application = await hasAppliedToJob(job.id, user.id);
        if (application) {
          setHasApplied(true);
          setApplicationStatus(application.status);
        } else {
          setHasApplied(false);
          setApplicationStatus(null);
        }
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };
    
    checkApplicationStatus();
  }, [job, user]);
  
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
    
    if (!user || !job) return;
    
    setSubmitting(true);
    
    try {
      const application = {
        job_id: job.id,
        freelancer_id: user.id,
        cover_letter: coverLetter,
        pitch: pitch,
        proposed_rate: proposedRate ? parseFloat(proposedRate) : undefined
      };
      
      const result = await applyForJobWithPitch(application);
      
      if (result) {
        toast({
          title: 'Application Submitted',
          description: 'Your application has been submitted successfully',
        });
        setShowApplicationForm(false);
        setHasApplied(true);
        setApplicationStatus('pending');
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
  
  if (!job) return null;
  
  const isFreelancer = user && user.user_metadata?.user_type === 'freelancer';
  const isOwner = user && user.id === job.client_id;
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-2xl">{job.title}</SheetTitle>
          <SheetDescription>
            Posted {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : ''}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
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
          
          <div className="space-y-4 pt-2">
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
                    {job.duration === 'short' ? 'Short Term (&lt; 1 month)' : 
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
          </div>
          
          {showApplicationForm && isFreelancer && (
            <div className="space-y-4 pt-4">
              <h3 className="font-semibold">Apply for this Job</h3>
              <form onSubmit={submitApplication} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="coverLetter">
                    Cover Letter
                  </label>
                  <Textarea
                    id="coverLetter"
                    placeholder="Introduce yourself and explain why you're suitable for this job..."
                    className="min-h-[100px]"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="pitch">
                    Pitch Yourself
                  </label>
                  <Textarea
                    id="pitch"
                    placeholder="Detail your experience, relevant projects, and why you're the perfect fit. Include portfolio links or anything that showcases your skills."
                    className="min-h-[150px]"
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
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
            </div>
          )}
        </div>
        
        <SheetFooter className="mt-6">
          {isOwner ? (
            <Button className="w-full" variant="default" onClick={onClose}>
              View Applications
            </Button>
          ) : isFreelancer ? (
            hasApplied ? (
              <Button className="w-full" variant="secondary" disabled>
                {applicationStatus === 'pending' ? 'Application Pending' : 
                 applicationStatus === 'accepted' ? 'Application Accepted' : 'Application Rejected'}
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
            <Button className="w-full" onClick={onClose}>
              Sign Up to Apply
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
