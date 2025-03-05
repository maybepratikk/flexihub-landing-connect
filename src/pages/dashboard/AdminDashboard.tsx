
import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboardHeader } from '@/components/dashboard/admin/AdminDashboardHeader';
import { AdminStatsCards } from '@/components/dashboard/admin/AdminStatsCards';
import { UserManagementTable } from '@/components/dashboard/admin/UserManagementTable';
import { JobManagementTable } from '@/components/dashboard/admin/JobManagementTable';
import { ContractManagementTable } from '@/components/dashboard/admin/ContractManagementTable';
import { getAllUsers, getAllJobs, getAllApplications, getAllContracts } from '@/lib/supabase/admin';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Loading admin dashboard data");
      
      // Get all users
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      console.log("Users loaded:", allUsers.length);
      
      // Get all jobs
      const allJobs = await getAllJobs();
      setJobs(allJobs);
      console.log("Jobs loaded:", allJobs.length);
      
      // Get all applications
      const allApplications = await getAllApplications();
      setApplications(allApplications);
      console.log("Applications loaded:", allApplications.length);
      
      // Get all contracts
      const allContracts = await getAllContracts();
      setContracts(allContracts);
      console.log("Contracts loaded:", allContracts.length);
      
      toast({
        title: "Dashboard Updated",
        description: "Admin dashboard data has been refreshed",
      });
    } catch (error: any) {
      console.error('Error loading admin dashboard data:', error);
      setError(error.message || "Failed to load dashboard data");
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

  // Calculate statistics
  const totalUsers = users.length;
  const clientUsers = users.filter(u => u.user_type === 'client').length;
  const freelancerUsers = users.filter(u => u.user_type === 'freelancer').length;
  const totalJobs = jobs.length;
  const totalApplications = applications.length;
  const totalContracts = contracts.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const activeContracts = contracts.filter(contract => contract.status === 'active').length;

  return (
    <div className="space-y-8">
      <AdminDashboardHeader onRefresh={loadData} />
      
      {error && (
        <div className="bg-destructive/10 p-4 rounded-md flex items-center gap-2 text-destructive">
          <AlertTriangle size={18} />
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={loadData} className="ml-auto">
            Retry
          </Button>
        </div>
      )}
      
      <AdminStatsCards 
        totalUsers={totalUsers}
        clientUsers={clientUsers}
        freelancerUsers={freelancerUsers}
        totalJobs={totalJobs}
        totalApplications={totalApplications}
        totalContracts={totalContracts}
        pendingApplications={pendingApplications}
        activeContracts={activeContracts}
        loading={loading}
      />
      
      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <UserManagementTable users={users} loading={loading} />
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-4">
          <JobManagementTable jobs={jobs} loading={loading} />
        </TabsContent>
        
        <TabsContent value="contracts" className="space-y-4">
          <ContractManagementTable contracts={contracts} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
