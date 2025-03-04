
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  getJobById, 
  getJobApplications, 
  updateApplicationStatus,
  createContract,
  updateJobStatus,
  Job,
  JobApplication 
} from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, CheckCircle, XCircle, Phone, Mail, Loader2 } from 'lucide-react';

export default function ApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!jobId || !user) return;

    const fetchJobAndApplications = async () => {
      setLoading(true);
      try {
        console.log("Fetching job details and applications for jobId:", jobId);
        const jobData = await getJobById(jobId);
        console.log("Job data:", jobData);
        
        if (jobData && jobData.client_id === user.id) {
          setJob(jobData);
          const applicationsData = await getJobApplications(jobId);
          console.log("Applications data:", applicationsData);
          setApplications(applicationsData);
        } else {
          // If user is not the job owner, redirect
          toast({
            title: "Access Denied",
            description: "You don't have permission to view applications for this job.",
            variant: "destructive",
          });
          navigate('/jobs');
        }
      } catch (error) {
        console.error('Error fetching job and applications:', error);
        toast({
          title: "Error",
          description: "Failed to load job applications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndApplications();
  }, [jobId, user, navigate, toast]);

  const handleStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    if (!job || !user) return;

    try {
      console.log(`Updating application ${applicationId} status to ${status}`);
      const updatedApplication = await updateApplicationStatus(applicationId, status);
      
      if (updatedApplication) {
        // Update the applications list
        setApplications(prevApplications => 
          prevApplications.map(app => 
            app.id === applicationId ? { ...app, status } : app
          )
        );

        // If accepting, create a contract
        if (status === 'accepted') {
          const application = applications.find(app => app.id === applicationId);
          
          if (application) {
            // Create a contract
            console.log("Creating contract for accepted application:", application);
            const contract = await createContract({
              job_id: job.id,
              freelancer_id: application.freelancer_id,
              client_id: user.id,
              rate: application.proposed_rate || 0,
              status: 'active'
            });

            if (contract) {
              // Update job status to in_progress
              console.log("Updating job status to in_progress");
              await updateJobStatus(job.id, 'in_progress');
              
              // Update local job status
              setJob(prevJob => prevJob ? { ...prevJob, status: 'in_progress' } : null);
              
              toast({
                title: "Application Accepted",
                description: "You've hired this freelancer and a contract has been created.",
                variant: "default",
              });
              
              // Redirect to contract page
              navigate(`/contracts/${contract.id}`);
            }
          }
        } else {
          toast({
            title: "Application Rejected",
            description: "The freelancer has been notified.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "There was an error updating the application status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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

  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{job?.title}</CardTitle>
              <CardDescription>
                {applications.length} application{applications.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Badge variant={job?.status === 'open' ? 'default' : 'secondary'}>
              {job?.status === 'open' ? 'Active' : job?.status === 'in_progress' ? 'In Progress' : 'Closed'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">{job?.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {job?.skills_required.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Budget:</span> ${job?.budget_min} - ${job?.budget_max} {job?.budget_type === 'hourly' && '/hr'}
            </div>
            <div>
              <span className="font-medium">Category:</span> {job?.category}
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">Applications</h2>
      
      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">No applications yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map(application => (
            <Card key={application.id} className={application.status !== 'pending' ? 'bg-muted/50' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {application.profiles && (
                      <Avatar>
                        <AvatarImage src={application.profiles.avatar_url || ''} />
                        <AvatarFallback>{application.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {application.profiles?.full_name}
                        {application.status !== 'pending' && (
                          <Badge className="ml-2" variant={application.status === 'accepted' ? 'default' : 'secondary'}>
                            {application.status === 'accepted' ? 'Hired' : 'Rejected'}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Applied {application.created_at && formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">Proposed Rate:</span> ${application.proposed_rate} {job?.budget_type === 'hourly' && '/hr'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.cover_letter && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Cover Letter</h3>
                    <p className="text-sm whitespace-pre-line">{application.cover_letter}</p>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Pitch</h3>
                  <div className="text-sm whitespace-pre-line">{application.pitch}</div>
                </div>
                
                {application.status === 'accepted' && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        {application.contact_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{application.contact_phone}</span>
                          </div>
                        )}
                        {application.contact_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${application.contact_email}`} className="text-primary hover:underline">
                              {application.contact_email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                {application.status === 'pending' ? (
                  <div className="flex gap-2 w-full justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => handleStatusUpdate(application.id, 'rejected')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                    <Button 
                      onClick={() => handleStatusUpdate(application.id, 'accepted')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Hire Freelancer
                    </Button>
                  </div>
                ) : (
                  <div className="w-full text-right text-muted-foreground">
                    {application.status === 'accepted' 
                      ? 'You have hired this freelancer' 
                      : 'You have declined this application'}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
