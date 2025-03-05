
import {
  Users,
  Briefcase,
  FileText,
  AlertCircle,
  FileCheck,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminStatsCardsProps {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalContracts: number;
  pendingApplications: number;
  activeContracts: number;
  loading?: boolean;
}

export function AdminStatsCards({
  totalUsers,
  totalJobs,
  totalApplications,
  totalContracts,
  pendingApplications,
  activeContracts,
  loading = false
}: AdminStatsCardsProps) {
  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: <Users className="h-4 w-4 text-blue-500" />,
      description: "Registered users on platform"
    },
    {
      title: "Total Jobs",
      value: totalJobs,
      icon: <Briefcase className="h-4 w-4 text-green-500" />,
      description: "Jobs posted on platform"
    },
    {
      title: "Total Applications",
      value: totalApplications,
      icon: <FileText className="h-4 w-4 text-purple-500" />,
      description: "Applications submitted"
    },
    {
      title: "Pending Applications",
      value: pendingApplications,
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      description: "Applications awaiting review"
    },
    {
      title: "Total Contracts",
      value: totalContracts,
      icon: <FileCheck className="h-4 w-4 text-indigo-500" />,
      description: "Contracts created"
    },
    {
      title: "Active Contracts",
      value: activeContracts,
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      description: "Currently active contracts"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
