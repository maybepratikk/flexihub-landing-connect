import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getClientProfile, getClientJobs, getClientContracts } from '@/lib/supabase';
import { Loader2, Search, FileCheck, Briefcase, Plus, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  
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
      
      <Tabs defaultValue="jobs">
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
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
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
                        <Button size="sm" variant="outline">View Applications</Button>
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
                            {contract.jobs.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Started {contract.start_date ? formatDistanceToNow(new Date(contract.start_date), { addSuffix: true }) : ''}
                          </p>
                          <p className="text-sm">
                            <strong>Freelancer:</strong> {contract.profiles.full_name}
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
                        <Button size="sm" variant="outline">View Details</Button>
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
