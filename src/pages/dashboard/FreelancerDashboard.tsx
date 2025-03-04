
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFreelancerProfile, getFreelancerApplications, getFreelancerContracts } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  FreelancerDashboardHeader,
  FreelancerStatusNotifications,
  FreelancerStatsCards,
  FreelancerProfileCard,
  FreelancerApplicationsTab,
  FreelancerContractsTab,
  FreelancerLoadingState,
  FreelancerEmptyState
} from '@/components/dashboard/freelancer';

export function FreelancerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);
  
  const loadData = useCallback(async () => {
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
      
      // Get freelancer's applications with job details
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
  }, [user, toast]);
  
  useEffect(() => {
    loadData();
    
    // Set up periodic refresh to ensure data is current
    const intervalId = setInterval(() => {
      console.log("FreelancerDashboard - Performing periodic refresh");
      loadData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [loadData]);

  const dismissNotification = (applicationId: string) => {
    setDismissedNotifications(prev => [...prev, applicationId]);
  };
  
  if (loading) {
    return <FreelancerLoadingState />;
  }
  
  if (!profile) {
    return <FreelancerEmptyState />;
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
           updatedAt && updatedAt > sevenDaysAgo &&
           !dismissedNotifications.includes(app.id);
  }) || [];
  
  return (
    <div className="space-y-8">
      <FreelancerDashboardHeader />
      
      <FreelancerStatusNotifications 
        recentStatusChanges={recentStatusChanges} 
        onDismiss={dismissNotification} 
      />
      
      <FreelancerStatsCards 
        pendingApplications={pendingApplications}
        acceptedApplications={acceptedApplications}
        rejectedApplications={rejectedApplications}
        activeContracts={activeContracts}
      />
      
      <FreelancerProfileCard profile={profile} />
      
      <Tabs defaultValue="applications">
        <TabsList className="mb-4">
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications" className="space-y-4">
          <FreelancerApplicationsTab 
            applications={applications} 
            contracts={contracts} 
          />
        </TabsContent>
        
        <TabsContent value="contracts" className="space-y-4">
          <FreelancerContractsTab contracts={contracts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
