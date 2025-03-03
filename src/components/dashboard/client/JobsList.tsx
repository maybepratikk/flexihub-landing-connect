
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getJobApplications } from '@/lib/supabase';
import { NavigateFunction } from 'react-router-dom';
import { JobApplicationsList } from './JobApplicationsList';

interface JobsListProps {
  jobs: any[];
  navigate: NavigateFunction;
  onUpdateApplicationStatus?: (jobId: string, applicationId: string, status: 'accepted' | 'rejected') => void;
  onJobsUpdated?: () => void;
}

export function JobsList({ 
  jobs, 
  navigate, 
  onUpdateApplicationStatus,
  onJobsUpdated
}: JobsListProps) {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [jobApplications, setJobApplications] = useState<Record<string, any[]>>({});
  const [loadingApplications, setLoadingApplications] = useState<Record<string, boolean>>({});

  const loadApplicationsForJob = async (jobId: string) => {
    setLoadingApplications(prev => ({ ...prev, [jobId]: true }));
    try {
      const applications = await getJobApplications(jobId);
      console.log(`Applications for job ${jobId}:`, applications);
      setJobApplications(prev => ({ ...prev, [jobId]: applications }));
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoadingApplications(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const toggleJobExpand = (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
      if (!jobApplications[jobId]) {
        loadApplicationsForJob(jobId);
      }
    }
  };

  const handleApplicationsUpdated = () => {
    if (expandedJobId) {
      loadApplicationsForJob(expandedJobId);
    }
    if (onJobsUpdated) {
      onJobsUpdated();
    }
  };

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">You haven't posted any jobs yet</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/post-job')}>
            Post Your First Job
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="border rounded-lg">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Posted {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : ''}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        job.status === 'open' ? 'default' :
                        job.status === 'in_progress' ? 'secondary' :
                        job.status === 'completed' ? 'outline' : 'destructive'
                      }>
                        {job.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {job.budget_type === 'hourly' ? 
                          `$${job.budget_min} - $${job.budget_max}/hr` : 
                          `$${job.budget_min}${job.budget_max ? ` - $${job.budget_max}` : ''}`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills_required?.map((skill: string) => (
                        <Badge key={skill} variant="outline" className="mr-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toggleJobExpand(job.id)}
                    >
                      {expandedJobId === job.id ? 'Hide Applications' : 'View Applications'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {expandedJobId === job.id && (
                loadingApplications[job.id] ? (
                  <div className="p-4 border-t">
                    <div className="animate-pulse flex space-x-4">
                      <div className="h-10 w-10 rounded-full bg-muted"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-2 rounded bg-muted"></div>
                        <div className="space-y-2">
                          <div className="h-2 rounded bg-muted"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <JobApplicationsList 
                    jobId={job.id} 
                    applications={jobApplications[job.id] || []} 
                    navigate={navigate}
                    onUpdateStatus={onUpdateApplicationStatus}
                    onApplicationsUpdated={handleApplicationsUpdated}
                  />
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
