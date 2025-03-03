
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFreelancerProfile, getFreelancerApplications, getFreelancerContracts } from '@/lib/supabase';
import { Loader2, Search, FileCheck, Briefcase, Clock, CheckCircle, XCircle, Mail, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function FreelancerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      console.log("FreelancerDashboard - Starting to load data for user:", user.id);
      setLoading(true);
      try {
        // Get freelancer profile
        console.log("FreelancerDashboard - Fetching profile for user:", user.id);
        const freelancerProfile = await getFreelancerProfile(user.id);
        console.log("FreelancerDashboard - Profile loaded:", freelancerProfile);
        setProfile(freelancerProfile);
        
        // Get freelancer's applications
        console.log("FreelancerDashboard - Fetching applications for user:", user.id);
        const freelancerApplications = await getFreelancerApplications(user.id);
        console.log("FreelancerDashboard - Applications loaded:", freelancerApplications);
        setApplications(freelancerApplications);
        
        // Get freelancer's contracts
        console.log("FreelancerDashboard - Fetching contracts for user:", user.id);
        const freelancerContracts = await getFreelancerContracts(user.id);
        console.log("FreelancerDashboard - Contracts loaded:", freelancerContracts);
        setContracts(freelancerContracts);
      } catch (error) {
        console.error('Error loading freelancer dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        console.log("FreelancerDashboard - Finished loading data");
      }
    };
    
    loadData();
    
    // Set up periodic refresh to ensure data is current
    const intervalId = setInterval(() => {
      console.log("FreelancerDashboard - Performing periodic refresh");
      loadData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [user, toast]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Profile Not Found</h2>
        <p className="text-muted-foreground">
          Please complete your onboarding to access the dashboard.
        </p>
        <Button onClick={() => navigate('/onboarding')}>
          Complete Onboarding
        </Button>
      </div>
    );
  }
  
  // Count applications by status
  const pendingApplications = applications?.filter(app => app.status === 'pending')?.length || 0;
  const acceptedApplications = applications?.filter(app => app.status === 'accepted')?.length || 0;
  const rejectedApplications = applications?.filter(app => app.status === 'rejected')?.length || 0;
  const activeContracts = contracts?.filter(contract => contract.status === 'active')?.length || 0;
  
  // Find recent status changes (within last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentStatusChanges = applications?.filter(app => {
    const updatedAt = app?.updated_at ? new Date(app.updated_at) : null;
    return (app?.status === 'accepted' || app?.status === 'rejected') && 
           updatedAt && updatedAt > sevenDaysAgo;
  }) || [];
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
          <p className="text-muted-foreground">
            Find jobs and manage your applications
          </p>
        </div>
        <Button onClick={() => navigate('/jobs')}>
          <Search className="mr-2 h-4 w-4" /> Find Jobs
        </Button>
      </div>
      
      {/* Notifications for status changes */}
      {recentStatusChanges.length > 0 && (
        <div className="space-y-3">
          {recentStatusChanges.map(app => (
            <Alert key={app.id} variant={app.status === 'accepted' ? 'default' : 'destructive'}>
              {app.status === 'accepted' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {app.status === 'accepted' 
                  ? 'Application Accepted!' 
                  : 'Application Rejected'}
              </AlertTitle>
              <AlertDescription>
                {app.status === 'accepted' 
                  ? `Your application for "${app.jobs?.title}" has been accepted! A contract has been created.` 
                  : `Your application for "${app.jobs?.title}" was not selected.`}
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => app.status === 'accepted' 
                    ? navigate('/contracts') 
                    : navigate(`/jobs/${app.job_id}`)}
                >
                  {app.status === 'accepted' ? 'View Contract' : 'Find Similar Jobs'}
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{pendingApplications}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Accepted Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{acceptedApplications}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Rejected Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{rejectedApplications}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{activeContracts}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Profile overview */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Overview</CardTitle>
          <CardDescription>
            Your professional profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Hourly Rate:</strong> ${profile?.hourly_rate}/hr</p>
          <p><strong>Experience:</strong> {profile?.years_experience} years</p>
          <p><strong>Skills:</strong> {profile?.skills?.join(', ')}</p>
          <p><strong>Availability:</strong> {profile?.availability}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link to="/profile">Update Profile</Link>
          </Button>
        </CardFooter>
      </Card>
      
      {/* Applications and Contracts tabs */}
      <Tabs defaultValue="applications">
        <TabsList className="mb-4">
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
              <CardDescription>
                Jobs you've applied for
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!applications || applications.length === 0 ? (
                <div className="text-center py-6">
                  <FileCheck className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">You haven't applied to any jobs yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/jobs')}>
                    Find Jobs to Apply
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            <Link to={`/jobs/${application.job_id}`} className="hover:underline">
                              {application.jobs?.title || 'Unnamed Job'}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Applied {application.created_at ? formatDistanceToNow(new Date(application.created_at), { addSuffix: true }) : ''}
                          </p>
                          <p className="text-sm">
                            <strong>Proposed Rate:</strong> ${application.proposed_rate}/{application.jobs?.budget_type === 'hourly' ? 'hr' : 'fixed'}
                          </p>
                          <div className="mt-2">
                            <Badge 
                              variant={
                                application.status === 'pending' ? 'secondary' : 
                                application.status === 'accepted' ? 'default' : 'destructive'
                              }
                            >
                              {application.status === 'pending' ? 'Pending' : 
                               application.status === 'accepted' ? 'Accepted' : 'Rejected'}
                            </Badge>
                          </div>
                        </div>
                        
                        {application.status === 'accepted' && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              // Find the corresponding contract
                              const contract = contracts.find(c => c.job_id === application.job_id);
                              if (contract) {
                                navigate(`/contracts/${contract.id}`);
                              } else {
                                navigate(`/jobs/${application.job_id}`);
                              }
                            }}
                          >
                            View Contract
                          </Button>
                        )}
                      </div>
                      
                      {/* Show client contact info for accepted applications */}
                      {application.status === 'accepted' && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-semibold mb-2">Client Contact Information</h4>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Use the contract page to message your client</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Your application has been accepted! A contract has been created for this job.
                            </p>
                          </div>
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
                Active and past contracts with clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!contracts || contracts.length === 0 ? (
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
                            {contract.jobs?.title || 'Unnamed Job'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Started {contract.start_date ? formatDistanceToNow(new Date(contract.start_date), { addSuffix: true }) : ''}
                          </p>
                          <p className="text-sm">
                            <strong>Client:</strong> {contract.profiles?.full_name || 'Unknown Client'}
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
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/contracts/${contract.id}`}>
                            View Details
                          </Link>
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
