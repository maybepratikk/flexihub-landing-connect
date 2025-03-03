
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, FileCheck } from 'lucide-react';

interface ClientStatsCardsProps {
  openJobs: number;
  inProgressJobs: number;
  completedJobs: number;
}

export function ClientStatsCards({ openJobs, inProgressJobs, completedJobs }: ClientStatsCardsProps) {
  return (
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
  );
}
