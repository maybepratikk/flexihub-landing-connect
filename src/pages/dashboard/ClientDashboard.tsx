
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getClientProfile, 
  getClientJobs, 
  getClientContracts,
  updateApplicationStatus,
  createContract,
  updateJobStatus
} from '@/lib/supabase';
import { ClientDashboardHeader } from '@/components/dashboard/client/ClientDashboardHeader';
import { ClientStatsCards } from '@/components/dashboard/client/ClientStatsCards';
import { ClientProfileCard } from '@/components/dashboard/client/ClientProfileCard';
import { ClientJobsTab } from '@/components/dashboard/client/ClientJobsTab';
import { ClientContractsTab } from '@/components/dashboard/client/ClientContractsTab';
import { useToast } from '@/components/ui/use-toast';

interface ClientDashboardProps {
  onRefresh?: () => void;
}

export function ClientDashboard({ onRefresh }: ClientDashboardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  const loadData = useCallback(async () => {
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
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateApplicationStatus = async (jobId: string, applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      // Update the application status
      const updatedApplication = await updateApplicationStatus(applicationId, status);
      
      if (!updatedApplication) {
        throw new Error('Failed to update application status');
      }
      
      // If the application was accepted, create a contract and update job status
      if (status === 'accepted') {
        // Get the application data to create the contract
        const jobToUpdate = jobs.find(job => job.id === jobId);
        
        if (!jobToUpdate) {
          throw new Error('Job not found');
        }
        
        const contractData = {
          job_id: jobId,
          freelancer_id: updatedApplication.freelancer_id,
          client_id: user!.id,
          rate: updatedApplication.proposed_rate,
          status: 'active',
          start_date: new Date().toISOString()
        };
        
        const newContract = await createContract(contractData);
        
        if (!newContract) {
          throw new Error('Failed to create contract');
        }
        
        // Update job status to in_progress
        await updateJobStatus(jobId, 'in_progress');
        
        toast({
          title: "Application accepted",
          description: "A contract has been created with this freelancer.",
          variant: "default",
        });
      } else {
        toast({
          title: "Application rejected",
          description: "The freelancer will be notified.",
          variant: "default",
        });
      }
      
      // Refresh data
      loadData();
      
      // Call parent refresh if provided
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: `Failed to update application status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-8">
      <ClientDashboardHeader onRefresh={loadData} />
      
      <ClientStatsCards 
        jobsCount={jobs.length} 
        contractsCount={contracts.length}
        openJobsCount={jobs.filter(job => job.status === 'open').length}
        activeContractsCount={contracts.filter(contract => contract.status === 'active').length}
        loading={loading}
      />
      
      <ClientProfileCard
        profile={profile}
        navigate={navigate}
        loading={loading}
      />
      
      <Tabs defaultValue="jobs">
        <TabsList className="mb-4">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs" className="space-y-4">
          <ClientJobsTab
            jobs={jobs}
            navigate={navigate}
            loading={loading}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onJobsUpdated={loadData}
          />
        </TabsContent>
        
        <TabsContent value="contracts" className="space-y-4">
          <ClientContractsTab
            contracts={contracts}
            navigate={navigate}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
