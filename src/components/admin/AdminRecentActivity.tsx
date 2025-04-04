
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllJobs, getAllApplications } from '@/lib/supabase/admin';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'job' | 'application' | 'contract' | 'user';
  title: string;
  timestamp: string;
  actor: string;
}

interface AdminRecentActivityProps {
  loading: boolean;
}

export function AdminRecentActivity({ loading }: AdminRecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Get jobs and applications to create activity feed
        const [jobs, applications] = await Promise.all([
          getAllJobs(),
          getAllApplications(),
        ]);
        
        const jobActivities = jobs
          .filter(job => job.created_at)
          .map(job => ({
            id: job.id,
            type: 'job' as const,
            title: `New job posted: ${job.title}`,
            timestamp: job.created_at,
            actor: job.client?.full_name || 'Unknown client'
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);
          
        const applicationActivities = applications
          .filter(app => app.created_at)
          .map(app => ({
            id: app.id,
            type: 'application' as const,
            title: `New application for: ${app.job?.title || 'Unknown job'}`,
            timestamp: app.created_at,
            actor: app.freelancer?.full_name || 'Unknown freelancer'
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);
          
        // Combine and sort activities
        const allActivities = [...jobActivities, ...applicationActivities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10);
          
        setActivities(allActivities);
        
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      }
    };
    
    if (!loading) {
      fetchRecentActivity();
    }
  }, [loading]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-5">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4">
            <div className={`h-9 w-9 rounded-full flex items-center justify-center
              ${activity.type === 'job' ? 'bg-blue-100 text-blue-700' : ''}
              ${activity.type === 'application' ? 'bg-green-100 text-green-700' : ''}
              ${activity.type === 'contract' ? 'bg-purple-100 text-purple-700' : ''}
              ${activity.type === 'user' ? 'bg-orange-100 text-orange-700' : ''}
            `}>
              {activity.actor.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-muted-foreground">
                {activity.timestamp ? 
                  formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 
                  'Unknown time'}
              </p>
              <p className="text-xs font-medium mt-1">{activity.actor}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No recent activity found
        </div>
      )}
    </div>
  );
}
