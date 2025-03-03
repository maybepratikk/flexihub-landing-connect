
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  getClientProfile, 
  getClientJobs, 
  getClientContracts, 
  getJobApplications, 
  updateApplicationStatus, 
  createContract, 
  updateJobStatus 
} from '@/lib/supabase';

// Import our new components
import { ClientDashboardHeader } from '@/components/dashboard/client/ClientDashboardHeader';
import { ClientStatsCards } from '@/components/dashboard/client/ClientStatsCards';
import { ClientProfileCard } from '@/components/dashboard/client/ClientProfileCard';
import { ClientJobsTab } from '@/components/dashboard/client/ClientJobsTab';
import { ClientContractsTab } from '@/components/dashboard/client/ClientContractsTab';

export function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobApplications, setJobApplications] = useState<Record<string, any[]>>({});
  const [loadingApplications, setLoadingApplications] = useState<Record<string, boolean>>({});
  
  const queryParams = new URLSearchParams(location.search);
  const viewParam = queryParams.get('view');
  const jobIdParam = queryParams.get('jobId');
  
  useEffect(() => {
    if (viewParam === 'applications' && jobIdParam) {
      setActiveTab('jobs');
      loadJobApplications(jobIdParam);
    }
  }, [viewParam, jobIdParam]);
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const clientProfile = await getClientProfile(user.id);
        setProfile(clientProfile);
        
        const clientJobs = await getClientJobs(user.id);
        console.log("Loaded client jobs:", clientJobs);
        setJobs(clientJobs);
        
        try {
          const clientContracts = await getClientContracts(user.id);
          setContracts(clientContracts);
        } catch (error) {
          console.error('Error fetching client contracts:', error);
          setContracts([]);
        }
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
      console.log("Loading applications for job:", jobId);
      const applications = await getJobApplications(jobId);
      console.log("Loaded applications:", applications);
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
      console.log(`Updating application ${applicationId} to status: ${status}`);
      const updatedApplication = await updateApplicationStatus(applicationId, status);
      
      if (updatedApplication) {
        setJobApplications(prev => ({
          ...prev,
          [jobId]: prev[jobId].map(app => 
            app.id === applicationId ? { ...app, status } : app
          )
        }));

        if (status === 'accepted') {
          const application = jobApplications[jobId].find(app => app.id === applicationId);
          
          if (application) {
            const contract = await createContract({
              job_id: jobId,
              freelancer_id: application.freelancer_id,
              client_id: user.id,
              rate: application.proposed_rate || 0,
              start_date: new Date().toISOString(),
              status: 'active'
            });

            if (contract) {
              console.log("Updating job status to in_progress");
              await updateJobStatus(jobId, 'in_progress');
              
              setJobs(prev => prev.map(job => 
                job.id === jobId ? { ...job, status: 'in_progress' } : job
              ));
              
              toast({
                title: "Application Accepted",
                description: "You've hired this freelancer and a contract has been created.",
                variant: "default",
              });
              
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
  
  const openJobs = jobs.filter(job => job.status === 'open').length;
  const inProgressJobs = jobs.filter(job => job.status === 'in_progress').length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  
  return (
    <div className="space-y-8">
      <ClientDashboardHeader />
      
      <ClientStatsCards 
        openJobs={openJobs} 
        inProgressJobs={inProgressJobs} 
        completedJobs={completedJobs} 
      />
      
      <ClientProfileCard profile={profile} />
      
      <Tabs defaultValue="jobs" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="jobs">Your Jobs</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs" className="space-y-4">
          <ClientJobsTab 
            jobs={jobs}
            loadJobApplications={loadJobApplications}
            loadingApplications={loadingApplications}
            jobApplications={jobApplications}
            handleStatusUpdate={handleStatusUpdate}
          />
        </TabsContent>
        
        <TabsContent value="contracts" className="space-y-4">
          <ClientContractsTab contracts={contracts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
