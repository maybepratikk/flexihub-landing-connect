
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFreelancerProfile, getFreelancerApplications, getFreelancerContracts } from '@/lib/supabase';
import { Loader2, Search, FileCheck, Briefcase, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function FreelancerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get freelancer profile
        const freelancerProfile = await getFreelancerProfile(user.id);
        setProfile(freelancerProfile);
        
        // Get freelancer's applications
        const freelancerApplications = await getFreelancerApplications(user.id);
        setApplications(freelancerApplications);
        
        // Get freelancer's contracts
        const freelancerContracts = await getFreelancerContracts(user.id);
        setContracts(freelancerContracts);
      } catch (error) {
        console.error('Error loading freelancer dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Count applications by status
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
  const activeContracts = contracts.filter(contract => contract.status === 'active').length;
  
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <FileCheck className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{acceptedApplications}</span>
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
              {applications.length === 0 ? (
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
                              {application.jobs.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Applied {application.created_at ? formatDistanceToNow(new Date(application.created_at), { addSuffix: true }) : ''}
                          </p>
                          <p className="text-sm">
                            <strong>Proposed Rate:</strong> ${application.proposed_rate}/{application.jobs.budget_type === 'hourly' ? 'hr' : 'fixed'}
                          </p>
                          <div className="mt-2">
                            <Badge 
                              variant={
                                application.status === 'pending' ? 'secondary' : 
                                application.status === 'accepted' ? 'outline' : 'destructive'
                              }
                            >
                              {application.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
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
                            {contract.jobs.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Started {contract.start_date ? formatDistanceToNow(new Date(contract.start_date), { addSuffix: true }) : ''}
                          </p>
                          <p className="text-sm">
                            <strong>Client:</strong> {contract.profiles.full_name}
                          </p>
                          <p className="text-sm">
                            <strong>Rate:</strong> ${contract.rate}/{contract.jobs.budget_type === 'hourly' ? 'hr' : 'fixed'}
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
