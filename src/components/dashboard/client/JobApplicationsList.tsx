
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import { updateApplicationStatus, createContract, updateJobStatus } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface JobApplicationsListProps {
  jobId: string;
  applications: any[];
  navigate: NavigateFunction;
  onUpdateStatus?: (jobId: string, applicationId: string, status: 'accepted' | 'rejected') => void;
  onApplicationsUpdated?: () => void;
}

export function JobApplicationsList({ 
  jobId, 
  applications, 
  navigate, 
  onUpdateStatus,
  onApplicationsUpdated
}: JobApplicationsListProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUpdateStatus = async (jobId: string, applicationId: string, status: 'accepted' | 'rejected', applicantId: string, rate: number) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log(`Updating application ${applicationId} to ${status} for job ${jobId}`);
      
      // First update the application status
      const updatedApplication = await updateApplicationStatus(applicationId, status);
      
      if (!updatedApplication) {
        throw new Error('Failed to update application status');
      }

      // If the application was accepted, create a contract and update job status
      if (status === 'accepted') {
        console.log('Application accepted, creating contract');
        
        const contractData = {
          job_id: jobId,
          freelancer_id: applicantId,
          client_id: user.id,
          rate: rate,
          status: 'active' as 'active' | 'completed' | 'terminated',
          start_date: new Date().toISOString()
        };
        
        console.log('Contract data:', contractData);
        
        const newContract = await createContract(contractData);
        
        if (!newContract) {
          throw new Error('Failed to create contract');
        }
        
        console.log('Contract created successfully:', newContract);
        
        // Update job status to in_progress
        const updatedJob = await updateJobStatus(jobId, 'in_progress');
        console.log('Job status updated:', updatedJob);
        
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
      
      // Call the parent's update callback if provided
      if (onUpdateStatus) {
        onUpdateStatus(jobId, applicationId, status);
      }
      
      // Trigger refresh of applications list
      if (onApplicationsUpdated) {
        onApplicationsUpdated();
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border-t bg-muted/30 p-4">
      <h4 className="font-medium mb-3">Applications ({applications.length})</h4>
      
      {applications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="bg-background p-4 rounded-md border">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  {application.profiles && (
                    <Avatar>
                      <AvatarImage src={application.profiles.avatar_url || ''} />
                      <AvatarFallback>{application.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <p className="font-medium">{application.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Proposed Rate: ${application.proposed_rate} 
                    </p>
                  </div>
                </div>
                
                {application.status === 'pending' ? (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-destructive"
                      onClick={() => handleUpdateStatus(
                        jobId, 
                        application.id, 
                        'rejected',
                        application.freelancer_id,
                        application.proposed_rate
                      )}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateStatus(
                        jobId, 
                        application.id, 
                        'accepted',
                        application.freelancer_id,
                        application.proposed_rate
                      )}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Accept
                    </Button>
                  </div>
                ) : (
                  <Badge 
                    variant={application.status === 'accepted' ? 'default' : 'secondary'}
                  >
                    {application.status === 'accepted' ? 'Hired' : 'Rejected'}
                  </Badge>
                )}
              </div>
              
              <div className="mt-2">
                <p className="text-sm whitespace-pre-line line-clamp-2">
                  {application.pitch || 'No pitch provided.'}
                </p>
                <Button 
                  size="sm" 
                  variant="link" 
                  onClick={() => navigate(`/jobs/${jobId}/applications`)}
                  className="p-0 h-auto mt-1"
                >
                  View full application
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            size="sm"
            variant="outline" 
            className="w-full"
            onClick={() => navigate(`/jobs/${jobId}/applications`)}
          >
            View All Applications in Detail
          </Button>
        </div>
      )}
    </div>
  );
}
