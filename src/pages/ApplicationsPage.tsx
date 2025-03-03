
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  getJobById, 
  getJobApplications, 
  updateApplicationStatus, 
  createContract, 
  updateJobStatus
} from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, User, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      if (!jobId || !user) return;
      
      setLoading(true);
      try {
        // Get job details
        const jobData = await getJobById(jobId);
        
        if (!jobData) {
          toast({
            title: 'Job not found',
            description: 'The job you are looking for does not exist',
            variant: 'destructive'
          });
          navigate('/dashboard');
          return;
        }
        
        // Check if user is the owner of the job
        if (jobData.client_id !== user.id) {
          toast({
            title: 'Unauthorized',
            description: 'You do not have permission to view this page',
            variant: 'destructive'
          });
          navigate('/dashboard');
          return;
        }
        
        setJob(jobData);
        
        // Get job applications
        const applicationsData = await getJobApplications(jobId);
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load applications',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [jobId, user, navigate, toast]);
  
  const handleAcceptApplication = async (applicationId: string, freelancerId: string, proposedRate: number) => {
    if (!jobId || !user) return;
    
    setProcessing(applicationId);
    
    try {
      // Update application status
      await updateApplicationStatus(applicationId, 'accepted');
      
      // Create a contract
      const contractData = {
        job_id: jobId,
        freelancer_id: freelancerId,
        client_id: user.id,
        rate: proposedRate,
        start_date: new Date().toISOString(),
        status: 'active' as const
      };
      
      const contract = await createContract(contractData);
      
      if (contract) {
        // Update job status to in_progress
        await updateJobStatus(jobId, 'in_progress');
        
        toast({
          title: 'Application Accepted',
          description: 'A contract has been created with the freelancer',
        });
        
        // Refresh applications
        const updatedApplications = await getJobApplications(jobId);
        setApplications(updatedApplications);
        
        // Update job data
        const updatedJob = await getJobById(jobId);
        setJob(updatedJob);
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept application',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };
  
  const handleRejectApplication = async (applicationId: string) => {
    setProcessing(applicationId);
    
    try {
      await updateApplicationStatus(applicationId, 'rejected');
      
      toast({
        title: 'Application Rejected',
        description: 'The application has been rejected',
      });
      
      // Refresh applications
      const updatedApplications = await getJobApplications(jobId);
      setApplications(updatedApplications);
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject application',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
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
            <Button asChild onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <CardDescription>
                    {job.status === 'open' ? 'Open for Applications' : 
                     job.status === 'in_progress' ? 'In Progress' : 
                     job.status === 'completed' ? 'Completed' : 'Cancelled'}
                  </CardDescription>
                </div>
                <Badge variant={
                  job.status === 'open' ? 'default' : 
                  job.status === 'in_progress' ? 'secondary' : 
                  job.status === 'completed' ? 'outline' : 'destructive'
                }>
                  {job.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
              </p>
            </CardContent>
          </Card>
          
          <h2 className="text-xl font-semibold">Applications</h2>
          
          {applications.length === 0 ? (
            <div className="text-center p-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={application.profiles?.avatar_url || ''} alt={application.profiles?.full_name || 'Freelancer'} />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{application.profiles?.full_name}</CardTitle>
                          <CardDescription>
                            Applied {application.created_at ? formatDistanceToNow(new Date(application.created_at), { addSuffix: true }) : ''}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={
                        application.status === 'pending' ? 'secondary' : 
                        application.status === 'accepted' ? 'outline' : 'destructive'
                      }>
                        {application.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Cover Letter</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {application.cover_letter}
                      </p>
                    </div>
                    
                    {application.pitch && (
                      <div>
                        <h3 className="font-medium mb-1">Pitch</h3>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {application.pitch}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Proposed Rate: ${application.proposed_rate}
                        {job.budget_type === 'hourly' ? '/hr' : ' total'}
                      </span>
                    </div>
                    
                    {application.freelancer_profiles && (
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Freelancer Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Hourly Rate:</span> ${application.freelancer_profiles.hourly_rate}/hr
                          </div>
                          <div>
                            <span className="font-medium">Experience:</span> {application.freelancer_profiles.years_experience} years
                          </div>
                          {application.freelancer_profiles.skills && (
                            <div className="md:col-span-2">
                              <span className="font-medium">Skills:</span> {application.freelancer_profiles.skills.join(', ')}
                            </div>
                          )}
                          {application.freelancer_profiles.education && (
                            <div className="md:col-span-2">
                              <span className="font-medium">Education:</span> {application.freelancer_profiles.education}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {application.status === 'pending' && job.status === 'open' && (
                    <CardFooter className="justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectApplication(application.id)}
                        disabled={processing === application.id || job.status !== 'open'}
                      >
                        {processing === application.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptApplication(application.id, application.freelancer_id, application.proposed_rate)}
                        disabled={processing === application.id || job.status !== 'open'}
                      >
                        {processing === application.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                        Accept
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
