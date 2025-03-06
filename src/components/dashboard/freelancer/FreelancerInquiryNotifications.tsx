import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, MessageCircle, XCircle } from 'lucide-react';
import { updateInquiryStatus } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';

interface InquiryNotificationProps {
  inquiries: any[];
  onUpdate: () => void;
}

export function FreelancerInquiryNotifications({ 
  inquiries, 
  onUpdate 
}: InquiryNotificationProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const pendingInquiries = inquiries.filter(inq => inq.status === 'pending');
  
  if (pendingInquiries.length === 0) {
    return null;
  }
  
  const handleAccept = async (inquiry: any) => {
    setIsProcessing(true);
    try {
      console.log("Accepting inquiry:", inquiry.id);
      const result = await updateInquiryStatus(inquiry.id, 'accepted');
      
      if (result) {
        console.log("Inquiry accepted with result:", result);
        
        toast({
          title: "Inquiry Accepted",
          description: "You've accepted the project inquiry. A contract has been created and you can now chat with the client.",
        });
        
        onUpdate();
        
        // If we have a contract in the result, navigate directly to it
        if (result.contract && result.contract.id) {
          console.log("Navigating to new contract:", result.contract.id);
          navigate(`/contracts/${result.contract.id}`);
        } else {
          // Otherwise just navigate to messages view
          console.log("Contract not found in result, navigating to messages view");
          navigate(`/messages`);
        }
      } else {
        console.error("No result returned from updateInquiryStatus");
        toast({
          title: "Error",
          description: "There was a problem accepting the inquiry. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error accepting inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to accept the inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async (inquiry: any) => {
    setIsProcessing(true);
    try {
      console.log("Rejecting inquiry:", inquiry.id);
      const updated = await updateInquiryStatus(inquiry.id, 'rejected');
      if (updated) {
        console.log("Inquiry rejected successfully");
        toast({
          title: "Inquiry Rejected",
          description: "You've rejected the project inquiry.",
        });
        onUpdate();
      } else {
        console.error("No result returned from updateInquiryStatus");
        toast({
          title: "Error",
          description: "There was a problem rejecting the inquiry. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to reject the inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleViewDetails = (inquiry: any) => {
    setSelectedInquiry(inquiry);
  };
  
  return (
    <div className="space-y-3">
      {pendingInquiries.map(inquiry => (
        <Alert key={inquiry.id} className="relative">
          <MessageCircle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            Project Inquiry from {inquiry.client_name}
            <span className="text-xs text-muted-foreground">
              {new Date(inquiry.created_at).toLocaleDateString()}
            </span>
          </AlertTitle>
          <AlertDescription>
            <p className="line-clamp-2 mb-2">{inquiry.project_description}</p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleViewDetails(inquiry)}
              >
                View Details
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleAccept(inquiry)}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Accept"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(inquiry)}
                disabled={isProcessing}
              >
                Decline
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}

      {selectedInquiry && (
        <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Project Inquiry from {selectedInquiry.client_name}</DialogTitle>
              <DialogDescription>
                Received on {new Date(selectedInquiry.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <h4 className="font-medium mb-2">Project Description:</h4>
              <p className="text-sm whitespace-pre-wrap">{selectedInquiry.project_description}</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedInquiry(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleReject(selectedInquiry);
                  setSelectedInquiry(null);
                }}
                disabled={isProcessing}
              >
                Decline
              </Button>
              <Button
                onClick={() => {
                  handleAccept(selectedInquiry);
                  setSelectedInquiry(null);
                }}
                disabled={isProcessing}
              >
                Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
