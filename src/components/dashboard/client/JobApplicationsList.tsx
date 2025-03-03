
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface JobApplicationsListProps {
  jobId: string;
  applications: any[];
  navigate: NavigateFunction;
  onUpdateStatus?: (jobId: string, applicationId: string, status: 'accepted' | 'rejected') => void;
}

export function JobApplicationsList({ 
  jobId, 
  applications, 
  navigate, 
  onUpdateStatus 
}: JobApplicationsListProps) {
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
                
                {application.status === 'pending' && onUpdateStatus ? (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-destructive"
                      onClick={() => onUpdateStatus(jobId, application.id, 'rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => onUpdateStatus(jobId, application.id, 'accepted')}
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
