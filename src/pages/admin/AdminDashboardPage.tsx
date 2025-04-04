
import { useState, useEffect } from 'react';
import { getAllUsers, getAllJobs, getAllApplications, getAllContracts } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Briefcase, FileText, FileClock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { AdminRecentActivity } from '@/components/admin/AdminRecentActivity';

export function AdminDashboardPage() {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [jobsCount, setJobsCount] = useState<number | null>(null);
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null);
  const [contractsCount, setContractsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [users, jobs, applications, contracts] = await Promise.all([
          getAllUsers(),
          getAllJobs(),
          getAllApplications(),
          getAllContracts()
        ]);
        
        setUsersCount(users.length);
        setJobsCount(jobs.length);
        setApplicationsCount(applications.length);
        setContractsCount(contracts.length);
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
