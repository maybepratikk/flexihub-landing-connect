
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, FileCheck } from 'lucide-react';

interface ClientStatsCardsProps {
  jobsCount: number;
  contractsCount: number;
  openJobsCount: number;
  activeContractsCount: number;
  loading: boolean;
}

export function ClientStatsCards({ 
  jobsCount, 
  contractsCount, 
  openJobsCount, 
  activeContractsCount,
  loading
}: ClientStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        <Card className="opacity-70">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Open Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">-</span>
            </div>
          </CardContent>
        </Card>
        <Card className="opacity-70">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">-</span>
            </div>
          </CardContent>
        </Card>
        <Card className="opacity-70">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">All Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold">-</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Open Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold">{openJobsCount}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Active Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-2xl font-bold">{activeContractsCount}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">All Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-gray-500" />
            <span className="text-2xl font-bold">{jobsCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
