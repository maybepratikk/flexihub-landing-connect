
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ProjectSubmission } from '@/lib/supabase';

interface ProjectSubmissionDetailsProps {
  submission: ProjectSubmission;
  isClient: boolean;
  onAccept: () => void;
  onReject: () => void;
  onPayment?: () => void;
}

export function ProjectSubmissionDetails({ 
  submission, 
  isClient,
  onAccept, 
  onReject,
  onPayment
}: ProjectSubmissionDetailsProps) {
  const { toast } = useToast();
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Project Submission</CardTitle>
          <Badge variant={getStatusBadgeVariant(submission.status)}>
            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-1">Submission Date</h3>
          <p className="text-sm">
            {submission.submission_date && format(new Date(submission.submission_date), 'PPP')}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold mb-1">Notes</h3>
          <p className="text-sm whitespace-pre-wrap">{submission.submission_notes || 'No notes provided'}</p>
        </div>
        
        {submission.submission_files && submission.submission_files.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Files</h3>
            <ul className="text-sm space-y-1">
              {submission.submission_files.map((file, index) => (
                <li key={index} className="underline text-blue-500">
                  <a href={file} target="_blank" rel="noopener noreferrer">
                    {file.split('/').pop()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {submission.feedback && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Feedback</h3>
            <p className="text-sm whitespace-pre-wrap">{submission.feedback}</p>
          </div>
        )}
        
        {isClient && submission.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onAccept}
              className="flex-1"
            >
              Accept Submission
            </Button>
            <Button
              variant="outline"
              onClick={onReject}
              className="flex-1"
            >
              Request Changes
            </Button>
          </div>
        )}
        
        {isClient && submission.status === 'accepted' && onPayment && (
          <div className="pt-2">
            <Button
              onClick={onPayment}
              className="w-full"
            >
              Proceed to Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
