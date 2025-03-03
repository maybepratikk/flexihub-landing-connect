
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getClientProfile, getClientJobs, getClientContracts, getJobApplications, updateApplicationStatus, createContract, updateJobStatus } from '@/lib/supabase';
import { Loader2, Search, FileCheck, Briefcase, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobApplications, setJobApplications] = useState<Record<string, any[]>>({});
  const [loadingApplications, setLoadingApplications] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get client profile
        const clientProfile = await getClientProfile(user.id);
        setProfile(clientProfile);
        
        // Get client's jobs
        const clientJobs = await getClientJobs(user.id);
        setJobs(clientJobs);
        
        // Get client's contracts
        const clientContracts = await getClientContracts(user.id);
        setContracts(clientContracts);
      } catch (error) {
        console.error('Error loading client dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const loadJobApplications = async (jobId: string) => {
    if (loadingApplications[jobId] || jobApplications[jobId]) return;
    
    setLoadingApplications(prev => ({ ...prev, [jobId]: true }));
    try {
      const applications = await getJobApplications(jobId);
      setJobApplications(prev => ({ ...prev, [jobId]: applications }));
    } catch (error) {
      console.error(`Error loading applications for job ${jobId}:`, error);
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingApplications(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleStatusUpdate = async (jobId: string, applicationId: string, status: 'accepted' | 'rejected') => {
    if (!user) return;

    try {
      const updatedApplication = await updateApplicationStatus(applicationId, status);
      
      if (updatedApplication) {
        // Update the applications list
        setJobApplications(prev => ({
          ...prev,
          [jobId]: prev[jobId].map(app => 
            app.id === applicationId ? { ...app, status } : app
          )
        }));

        // If accepting, create a contract
        if (status === 'accepted') {
          const application = jobApplications[jobId].find(app => app.id === applicationId);
          
          if (application) {
            // Create a contract
            const contract = await createContract({
              job_id: jobId,
              freelancer_id: application.freelancer_id,
              client_id: user.id,
              rate: application.proposed_rate || 0,
              start_date: new Date().toISOString(),
              status: 'active'
            });

            if (contract) {
              // Update job status to in_progress
              await updateJobStatus(jobId, 'in_progress');
              
              // Update local job status
              setJobs(prev => prev.map(job => 
                job.id === jobId ? { ...job, status: 'in_progress' } : job
              ));
              
              toast({
                title: "Application Accepted",
                description: "You've hired this freelancer and a contract has been created.",
                variant: "default",
              });
              
              // Refresh contracts
              const updatedContracts = await getClientContracts(user.id);
              setContracts(updatedContracts);
            }
          }
        } else {
          toast({
            title: "Application Rejected",
            description: "The freelancer has been notified of your decision.",
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Count jobs by status
  const openJobs = jobs.filter(job => job.status === 'open').length;
  const inProgressJobs = jobs.filter(job => job.status === 'in_progress').length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your jobs and contracts
          </p>
        </div>
        <Button onClick={() => navigate('/post-job')}>
          <Plus className="mr-2 h-4 w-4" /> Post a Job
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Open Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{openJobs}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">In Progress Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{inProgressJobs}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Completed Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold">{completedJobs}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            Your company's information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Company Name:</strong> {profile?.company_name}</p>
          <p><strong>Industry:</strong> {profile?.industry}</p>
          <p><strong>Company Size:</strong> {profile?.company_size}</p>
          <p><strong>Description:</strong> {profile?.company_description}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link to="/profile">Update Profile</Link>
          </Button>
        </CardFooter>
      </Card>
      
      <Tabs defaultValue="jobs" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="jobs">Your Jobs</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Job Postings</CardTitle>
              <CardDescription>
                Manage your active and past job postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-6">
                  <Briefcase className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">You haven't posted any jobs yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/post-job')}>
                    Post Your First Job
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              <Link to={`/jobs/${job.id}`} className="hover:underline">
                                {job.title}
                              </Link>
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Posted {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : ''}
                            </p>
                            <div className="mt-2">
                              <Badge 
                                variant={
                                  job.status === 'open' ? 'secondary' : 
                                  job.status === 'in_progress' ? 'outline' : 'destructive'
                                }
                              >
                                {job.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => navigate(`/jobs/${job.id}`)}
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => loadJobApplications(job.id)}
                            >
                              {loadingApplications[job.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "View Applications"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Applications section */}
                      {jobApplications[job.id] && (
                        <div className="border-t bg-muted/30 p-4">
                          <h4 className="font-medium mb-3">Applications ({jobApplications[job.id].length})</h4>
                          
                          {jobApplications[job.id].length === 0 ? (
                            <p className="text-sm text-muted-foreground">No applications yet.</p>
                          ) : (
                            <div className="space-y-4">
                              {jobApplications[job.id].map((application) => (
                                <div key={application.id} className="bg-background p-4 rounded-md border">
                                  <div className="flex justify-between">
                                    <div className="flex items-center gap-3">
                                      {application.profiles && (
                                        <Avatar>
                                          <AvatarImage src={application.profiles.avatar_url || ''} />
                                          <AvatarFallback>{application.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                      )}
                                      <div>
                                        <p className="font-medium">{application.profiles?.full_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                          Proposed Rate: ${application.proposed_rate} {job.budget_type === 'hourly' ? '/hr' : ''}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {application.status === 'pending' ? (
                                      <div className="flex gap-2">
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="text-destructive"
                                          onClick={() => handleStatusUpdate(job.id, application.id, 'rejected')}
                                        >
                                          <XCircle className="h-4 w-4 mr-1" /> Reject
                                        </Button>
                                        <Button 
                                          size="sm"
                                          onClick={() => handleStatusUpdate(job.id, application.id, 'accepted')}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-1" /> Accept
                                        </Button>
                                      </div>
                                    ) : (
                                      <Badge 
                                        variant={application.status === 'accepted' ? 'default' : 'secondary'}
                                      >
                                        {application.status === 'accepted' ? 'Hired' : 'Rejected'}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Show more details for accepted applications */}
                                  {application.status === 'accepted' && (
                                    <div className="mt-4 pt-4 border-t text-sm">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h5 className="font-semibold mb-1">Contact Information:</h5>
                                          <p>Email: {application.contact_email || 'N/A'}</p>
                                          <p>Phone: {application.contact_phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <h5 className="font-semibold mb-1">Experience:</h5>
                                          <p>{application.freelancer_profiles?.years_experience || 'N/A'} years</p>
                                          
                                          {application.freelancer_profiles?.skills && (
                                            <div className="mt-2">
                                              <p className="font-semibold">Skills:</p>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {application.freelancer_profiles.skills.map((skill: string, i: number) => (
                                                  <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Pitch and cover letter */}
                                      <div className="mt-4">
                                        <h5 className="font-semibold mb-1">Pitch:</h5>
                                        <p className="whitespace-pre-line">{application.pitch || 'No pitch provided.'}</p>
                                        
                                        {application.cover_letter && (
                                          <div className="mt-2">
                                            <h5 className="font-semibold mb-1">Cover Letter:</h5>
                                            <p className="whitespace-pre-line">{application.cover_letter}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Show pitch preview for pending applications */}
                                  {application.status === 'pending' && (
                                    <div className="mt-2">
                                      <p className="text-sm whitespace-pre-line line-clamp-2">
                                        {application.pitch || 'No pitch provided.'}
                                      </p>
                                      <Button 
                                        size="sm" 
                                        variant="link" 
                                        onClick={() => navigate(`/jobs/${job.id}/applications`)}
                                        className="p-0 h-auto mt-1"
                                      >
                                        View full application
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                              
                              <Button
                                size="sm"
                                variant="outline" 
                                className="w-full"
                                onClick={() => navigate(`/jobs/${job.id}/applications`)}
                              >
                                View All Applications in Detail
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Contracts</CardTitle>
              <CardDescription>
                Active and past contracts with freelancers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No contracts found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {contract.jobs?.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Started {contract.start_date ? formatDistanceToNow(new Date(contract.start_date), { addSuffix: true }) : ''}
                          </p>
                          <p className="text-sm">
                            <strong>Freelancer:</strong> {contract.profiles?.full_name}
                          </p>
                          <p className="text-sm">
                            <strong>Rate:</strong> ${contract.rate}/{contract.jobs?.budget_type === 'hourly' ? 'hr' : 'fixed'}
                          </p>
                          <div className="mt-2">
                            <Badge 
                              variant={
                                contract.status === 'active' ? 'secondary' : 
                                contract.status === 'completed' ? 'outline' : 'destructive'
                              }
                            >
                              {contract.status}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => navigate(`/contracts/${contract.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
