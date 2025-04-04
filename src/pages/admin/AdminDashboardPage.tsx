
import { useState, useEffect } from 'react';
import { getAllUsers, getAllJobs, getAllApplications, getAllContracts } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Briefcase, FileText, FileClock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { AdminRecentActivity } from '@/components/admin/AdminRecentActivity';
import { useToast } from '@/hooks/use-toast';

export function AdminDashboardPage() {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [jobsCount, setJobsCount] = useState<number | null>(null);
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null);
  const [contractsCount, setContractsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log("Loading admin dashboard data...");
        setLoading(true);
        setError(null);
        
        const [users, jobs, applications, contracts] = await Promise.all([
          getAllUsers(),
          getAllJobs(),
          getAllApplications(),
          getAllContracts()
        ]);
        
        console.log("Data loaded successfully:", {
          users: users.length,
          jobs: jobs.length,
          applications: applications.length,
          contracts: contracts.length
        });
        
        setUsersCount(users.length);
        setJobsCount(jobs.length);
        setApplicationsCount(applications.length);
        setContractsCount(contracts.length);
      } catch (error: any) {
        console.error("Error loading admin dashboard data:", error);
        setError(error.message || "Failed to load dashboard data");
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  const stats = [
    {
      title: "Total Users",
      value: usersCount,
      icon: Users,
      description: "Registered platform users",
      change: "+12%",
      changeType: "increase" as const,
    },
    {
      title: "Active Jobs",
      value: jobsCount,
      icon: Briefcase,
      description: "Jobs posted on platform",
      change: "+5%",
      changeType: "increase" as const,
    },
    {
      title: "Applications",
      value: applicationsCount,
      icon: FileText,
      description: "Job applications submitted",
      change: "+18%",
      changeType: "increase" as const,
    },
    {
      title: "Contracts",
      value: contractsCount,
      icon: FileClock,
      description: "Active contracts",
      change: "+2%",
      changeType: "increase" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-medium text-red-800">Error Loading Dashboard</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  className="text-sm text-red-800 hover:text-red-900 underline mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <AdminStatsCards stats={stats} loading={loading} />
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
            <CardDescription>Platform usage over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="w-full h-[250px]" />
              </div>
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="flex flex-col items-center text-muted-foreground">
                  <BarChart3 size={48} />
                  <p className="mt-2">Analytics charts coming soon</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminRecentActivity loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
