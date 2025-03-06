
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, XCircle, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatusNotificationProps {
  recentStatusChanges: any[];
  recentInquiries?: any[];
  onDismiss: (applicationId: string) => void;
  onDismissInquiry?: (inquiryId: string) => void;
  onAcceptInquiry?: (inquiry: any) => void;
  onRejectInquiry?: (inquiry: any) => void;
}

export function FreelancerStatusNotifications({ 
  recentStatusChanges, 
  recentInquiries = [],
  onDismiss,
  onDismissInquiry,
  onAcceptInquiry,
  onRejectInquiry
}: StatusNotificationProps) {
  const navigate = useNavigate();
  
  const hasNotifications = recentStatusChanges.length > 0 || recentInquiries.length > 0;
  
  if (!hasNotifications) {
    return null;
  }
  
  return (
    <div className="space-y-3">
      {recentStatusChanges.map(app => (
        <Alert key={app.id} variant={app.status === 'accepted' ? 'default' : 'destructive'} className="relative pr-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1 h-6 w-6 rounded-full p-0"
            onClick={() => onDismiss(app.id)}
          >
            <X className="h-4 w-4" />
          </Button>
          {app.status === 'accepted' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {app.status === 'accepted' 
              ? 'Application Accepted!' 
              : 'Application Rejected'}
          </AlertTitle>
          <AlertDescription>
            {app.status === 'accepted' 
              ? `Your application for "${app.jobs?.title || 'this job'}" has been accepted! A contract has been created.` 
              : `Your application for "${app.jobs?.title || 'this job'}" was not selected.`}
            <Button 
              variant="link" 
              className="p-0 h-auto"
              onClick={() => app.status === 'accepted' 
                ? navigate('/contracts') 
                : navigate(`/jobs/${app.job_id}`)}
            >
              {app.status === 'accepted' ? 'View Contract' : 'Find Similar Jobs'}
            </Button>
          </AlertDescription>
        </Alert>
      ))}

      {recentInquiries.filter(inq => inq.status === 'pending').map(inquiry => (
        <Alert key={inquiry.id} className="relative">
          {onDismissInquiry && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1 h-6 w-6 rounded-full p-0"
              onClick={() => onDismissInquiry(inquiry.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <MessageCircle className="h-4 w-4" />
          <AlertTitle>
            Project Inquiry from {inquiry.client_name || 'a client'}
          </AlertTitle>
          <AlertDescription>
            <p className="line-clamp-2 mb-2">{inquiry.project_description}</p>
            {onAcceptInquiry && onRejectInquiry && (
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onAcceptInquiry(inquiry)}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRejectInquiry(inquiry)}
                >
                  Decline
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
