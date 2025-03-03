
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

    const fetchData = async () => {
      setLoading(true);
      const fetchedJob = await getJobById(jobId);
      
      if (fetchedJob && fetchedJob.client_id === user.id) {
        setJob(fetchedJob);
        const fetchedApplications = await getJobApplications(jobId);
        setApplications(fetchedApplications);
      } else {
        // Redirect if not the job owner
        navigate('/dashboard');
        toast({
          title: "Access Denied",
          description: "You don't have permission to view these applications.",
          variant: "destructive",
        });
      }
      
      setLoading(false);
    };

    fetchData();
  }, [jobId, user, navigate, toast]);

  const handleStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const updatedApplication = await updateApplicationStatus(applicationId, status);
      
      if (updatedApplication) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId ? { ...app, status } : app
          )
        );
        
        // If accepting, create a contract
        if (status === 'accepted' && job) {
          const application = applications.find(app => app.id === applicationId);
          
          if (application) {
            // Create a contract
            const contract = await createContract({
              job_id: job.id,
              client_id: job.client_id,
              freelancer_id: application.freelancer_id,
              rate: application.proposed_rate || 0,
              start_date: new Date().toISOString(),
              status: 'active'
            });
            
            if (contract) {
              // Update job status to in_progress
              await updateJobStatus(job.id, 'in_progress');
              
              toast({
                title: "Contract Created",
                description: "A contract has been created with the freelancer.",
              });
              
              // Redirect to the contract page
              navigate(`/contracts/${contract.id}`);
            }
          }
        } else {
          toast({
            title: "Status Updated",
            description: `Application ${status === 'accepted' ? 'accepted' : 'rejected'} successfully.`,
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Job not found</h1>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  // Filter applications by status for tabs
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" onClick={() => navigate(`/jobs/${jobId}`)}>
          Back to Job Details
        </Button>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>
            Posted {job.created_at && formatDistanceToNow(new Date(job.created_at), { addSuffix: true })} • 
            {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
              {job.status === 'open' ? 'Active' : job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.slice(1)}
            </Badge>
            <Badge variant={job.budget_type === 'fixed' ? 'outline' : 'default'}>
              {job.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}
            </Badge>
            {job.budget_min && job.budget_max && (
              <Badge variant="outline">
                ${job.budget_min} - ${job.budget_max} {job.budget_type === 'hourly' && '/hr'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pending ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({acceptedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedApplications.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No pending applications</p>
          ) : (
            pendingApplications.map(application => (
              <ApplicationCard 
                key={application.id} 
                application={application} 
                onAccept={() => handleStatusUpdate(application.id, 'accepted')}
                onReject={() => handleStatusUpdate(application.id, 'rejected')}
                showActions={true}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="accepted" className="space-y-4">
          {acceptedApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No accepted applications</p>
          ) : (
            acceptedApplications.map(application => (
              <ApplicationCard 
                key={application.id} 
                application={application} 
                showActions={false}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          {rejectedApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No rejected applications</p>
          ) : (
            rejectedApplications.map(application => (
              <ApplicationCard 
                key={application.id} 
                application={application} 
                showActions={false}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ApplicationCardProps {
  application: JobApplication;
  onAccept?: () => void;
  onReject?: () => void;
  showActions: boolean;
}

function ApplicationCard({ application, onAccept, onReject, showActions }: ApplicationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            {application.profiles && (
              <>
                <Avatar>
                  <AvatarImage src={application.profiles.avatar_url || ''} />
                  <AvatarFallback>{application.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{application.profiles.full_name}</CardTitle>
                  <CardDescription>
                    Applied {application.created_at && formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                  </CardDescription>
                </div>
              </>
            )}
          </div>
          <Badge variant={
            application.status === 'pending' ? 'outline' : 
            application.status === 'accepted' ? 'default' : 
            'secondary'
          }>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {application.freelancer_profiles && (
          <div>
            <h3 className="font-semibold mb-1">Freelancer Profile</h3>
            <p className="text-sm text-muted-foreground mb-2">{application.freelancer_profiles.bio}</p>
            {application.freelancer_profiles.skills && (
              <div className="flex flex-wrap gap-1 mb-2">
                {application.freelancer_profiles.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {application.freelancer_profiles.skills.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{application.freelancer_profiles.skills.length - 5} more
                  </Badge>
                )}
              </div>
            )}
            <div className="text-sm">
              <span className="font-medium">Experience:</span> {application.freelancer_profiles.years_experience} years
            </div>
            {application.freelancer_profiles.portfolio_links && application.freelancer_profiles.portfolio_links.length > 0 && (
              <div className="text-sm mt-1">
                <span className="font-medium">Portfolio:</span>{' '}
                {application.freelancer_profiles.portfolio_links.map((link, i) => (
                  <a 
                    key={i} 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline"
                  >
                    Link {i+1}{i < application.freelancer_profiles.portfolio_links!.length - 1 ? ', ' : ''}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      
        <div>
          <h3 className="font-semibold mb-1">Cover Letter</h3>
          <p className="text-sm whitespace-pre-line">{application.cover_letter}</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-1">Pitch</h3>
          <p className="text-sm whitespace-pre-line">{application.pitch}</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-1">Proposed Rate</h3>
          <p className="text-lg font-medium">${application.proposed_rate}</p>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onReject}>
            Reject
          </Button>
          <Button onClick={onAccept}>
            Accept
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
