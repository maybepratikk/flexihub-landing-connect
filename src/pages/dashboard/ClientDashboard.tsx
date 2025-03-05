
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getClientProfile, 
  getClientJobs, 
  getClientContracts,
  fixSpecificJob
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
  const [needsSpecificJobFix, setNeedsSpecificJobFix] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log("Loading client dashboard data for user:", user.id);
      
      // Get client profile
      const clientProfile = await getClientProfile(user.id);
      setProfile(clientProfile);
      
      // Try to fix the specific job if needed
      if (needsSpecificJobFix) {
        console.log("Attempting to fix 'Testing @1 am' job on dashboard load");
        const fixedJob = await fixSpecificJob("Testing @1 am");
        if (fixedJob) {
          console.log("Successfully fixed 'Testing @1 am' job:", fixedJob);
          setNeedsSpecificJobFix(false);
        }
      }
      
      // Get client's jobs
      const clientJobs = await getClientJobs(user.id);
      console.log("Loaded client jobs:", clientJobs);
      setJobs(clientJobs);
      
      // Get client's contracts - make sure we're getting unique contracts
      const clientContracts = await getClientContracts(user.id);
      console.log("Loaded client contracts:", clientContracts);
      
      // Deduplicate contracts by id to ensure no duplicates are displayed
      const uniqueContracts = Array.from(
        new Map(clientContracts.map(contract => [contract.id, contract])).values()
      );
      
      if (uniqueContracts.length !== clientContracts.length) {
        console.log(`Removed ${clientContracts.length - uniqueContracts.length} duplicate contracts`);
      }
      
      setContracts(uniqueContracts);
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
  }, [user, toast, needsSpecificJobFix]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Simplified function that just refreshes data after application status update
  const handleUpdateApplicationStatus = async () => {
    try {
      // Force immediate data refresh to show updated status
      await loadData();
      
      // Call parent refresh if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating data after status change:', error);
      toast({
        title: "Error",
        description: `Failed to refresh data: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
