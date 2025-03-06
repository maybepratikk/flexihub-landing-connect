
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  getContractById,
  Contract,
  Job, // Import Job type
  ProjectSubmission,
  getProjectSubmissionsByContract,
  updateProjectSubmission,
  updateContractStatus
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { ProjectSubmissionForm } from '@/components/projects/ProjectSubmissionForm';
import { ProjectSubmissionDetails } from '@/components/projects/ProjectSubmissionDetails';
import { PaymentForm } from '@/components/payments/PaymentForm';

export default function ContractPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const { user } = useContext(AuthContext);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectSubmissions, setProjectSubmissions] = useState<ProjectSubmission[]>([]);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<ProjectSubmission | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!contractId || !user) return;

    const fetchContract = async () => {
      setLoading(true);
      try {
        console.log(`Fetching contract ${contractId} for user ${user.id}`);
        const fetchedContract = await getContractById(contractId);
        
        if (fetchedContract) {
          console.log('Contract data fetched:', fetchedContract);
          
          // Check if user is either the client or freelancer of this contract
          const isAuthorized = 
            fetchedContract.client_id === user.id || 
            fetchedContract.freelancer_id === user.id;
            
          console.log(`User authorization check: ${isAuthorized} (client_id: ${fetchedContract.client_id}, freelancer_id: ${fetchedContract.freelancer_id}, user.id: ${user.id})`);
            
          if (isAuthorized) {
            console.log('User authorized to view contract');
            setContract(fetchedContract);
            
            // Fetch project submissions for this contract
            const submissions = await getProjectSubmissionsByContract(contractId);
            setProjectSubmissions(submissions);
            if (submissions.length > 0) {
              setCurrentSubmission(submissions[0]); // Set the most recent submission
            }
          } else {
            // Redirect if not authorized
            console.log('User not authorized to view contract');
            navigate('/dashboard');
            toast({
              title: "Access Denied",
              description: "You don't have permission to view this contract.",
              variant: "destructive",
            });
          }
        } else {
          // Contract not found
          console.log('Contract not found');
          navigate('/dashboard');
          toast({
            title: "Not Found",
            description: "The requested contract could not be found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
        toast({
          title: "Error",
          description: "There was a problem loading the contract details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId, user, navigate, toast]);

  const handleSubmitProject = (submission: ProjectSubmission) => {
    setProjectSubmissions([submission, ...projectSubmissions]);
    setCurrentSubmission(submission);
    setShowSubmissionForm(false);
    
    // Refresh contract to get updated status
    if (contractId) {
      getContractById(contractId).then(updatedContract => {
        if (updatedContract) {
          setContract(updatedContract);
        }
      });
    }
  };

  const handleAcceptSubmission = async () => {
    if (!currentSubmission) return;
    
    try {
      const updatedSubmission = await updateProjectSubmission(
        currentSubmission.id,
        'accepted'
      );
      
      if (updatedSubmission) {
        // Update local state
        setProjectSubmissions(submissions => 
          submissions.map(s => s.id === updatedSubmission.id ? updatedSubmission : s)
        );
        setCurrentSubmission(updatedSubmission);
        
        // Refresh contract to get updated status
        if (contractId) {
          const updatedContract = await getContractById(contractId);
          if (updatedContract) {
            setContract(updatedContract);
          }
        }
        
        toast({
          title: "Submission Accepted",
          description: "The project has been marked as completed.",
          variant: "default",
        });
        
        // Show payment form
        setShowPaymentForm(true);
      }
    } catch (error) {
      console.error('Error accepting submission:', error);
      toast({
        title: "Error",
        description: "There was a problem accepting this submission.",
        variant: "destructive",
      });
    }
  };

  const handleRejectSubmission = async () => {
    if (!currentSubmission || !feedbackText) return;
    
    try {
      const updatedSubmission = await updateProjectSubmission(
        currentSubmission.id,
        'rejected',
        feedbackText
      );
      
      if (updatedSubmission) {
        // Update local state
        setProjectSubmissions(submissions => 
          submissions.map(s => s.id === updatedSubmission.id ? updatedSubmission : s)
        );
        setCurrentSubmission(updatedSubmission);
        
        // Refresh contract to get updated status
        if (contractId) {
          const updatedContract = await getContractById(contractId);
          if (updatedContract) {
            setContract(updatedContract);
          }
        }
        
        // Close dialog and reset form
        setRejectDialogOpen(false);
        setFeedbackText('');
        
        toast({
          title: "Feedback Sent",
          description: "Your feedback has been sent to the freelancer.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "There was a problem sending your feedback.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    toast({
      title: "Payment Successful",
      description: "Thank you for your payment. The freelancer has been notified.",
      variant: "default",
    });
  };

  // Handle contract termination
  const handleTerminateContract = async () => {
    if (!contract) return;
    
    try {
      await updateContractStatus(contract.id, 'terminated');
      
      // Refresh contract data
      const updatedContract = await getContractById(contract.id);
      if (updatedContract) {
        setContract(updatedContract);
      }
      
      toast({
        title: "Contract Terminated",
        description: "The contract has been terminated.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error terminating contract:', error);
      toast({
        title: "Error",
        description: "There was a problem terminating the contract.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Contract not found</h1>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const isClient = user?.id === contract.client_id;
  const isFreelancer = user?.id === contract.freelancer_id;
  
  // Extract job details and make sure we handle both array and object formats
  const jobDetails = contract.jobs || {} as Job;
  console.log("Job details extracted:", jobDetails);
  
  // Get the correct other party data
  const otherPartyId = isClient ? contract.freelancer_id : contract.client_id;
  
  // Handle different structures for profiles data based on the Contract type
  let otherParty = null;
  
  // Log to debug the structure of contract.profiles
  console.log("Profiles structure:", contract.profiles);
  
  if (contract.profiles) {
    if (isClient) {
      // When viewing as client, get freelancer info (from freelancer_id key)
      otherParty = contract.profiles.freelancer_id || {};
    } else {
      // When viewing as freelancer, get client info (from client_id key)
      otherParty = contract.profiles.client_id || {};
    }
  } else {
    // Try to get profiles from separate properties that might be directly on the contract
    if (isClient && contract.freelancer) {
      otherParty = contract.freelancer;
    } else if (!isClient && contract.client) {
      otherParty = contract.client;
    } else {
      // Fallback to an empty object if neither is available
      otherParty = {};
    }
  }

  // Log the contract data to see what we're working with
  console.log("Contract data in ContractPage:", contract);
  console.log("Job details in ContractPage:", jobDetails);
  console.log("Other party in ContractPage:", otherParty);

  // Can show submission form if:
  // 1. User is the freelancer
  // 2. Contract is active (not completed or terminated)
  // 3. There is no pending submission
  const canShowSubmissionForm = isFreelancer && 
    (contract.status === 'active') && 
    (!currentSubmission || (currentSubmission && currentSubmission.status !== 'pending'));

  // Can show submission details if there is a current submission
  const canShowSubmissionDetails = currentSubmission !== null;

  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-6">
        Back to Dashboard
      </Button>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
              <CardDescription>
                Created {contract.created_at && formatDistanceToNow(new Date(contract.created_at), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">Status</h3>
                <Badge variant={
                  contract.status === 'active' ? 'default' : 
                  contract.status === 'submitted' ? 'secondary' :
                  contract.status === 'completed' ? 'outline' : 
                  'destructive'
                }>
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-1">Rate</h3>
                <p className="text-lg font-medium">
                  ${contract.rate}{jobDetails?.budget_type === 'hourly' ? '/hr' : ' (fixed)'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-1">Start Date</h3>
                <p>{contract.start_date && format(new Date(contract.start_date), 'PPP')}</p>
              </div>
              
              {contract.end_date && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">End Date</h3>
                  <p>{format(new Date(contract.end_date), 'PPP')}</p>
                </div>
              )}
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-semibold mb-1">Job</h3>
                {jobDetails && (
                  <div className="mt-2">
                    <h4 className="font-medium">{jobDetails?.title || 'Unnamed Job'}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {jobDetails?.description && jobDetails.description.substring(0, 100)}...
                    </p>
                    {jobDetails?.id && (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto mt-1"
                        onClick={() => navigate(`/jobs/${jobDetails.id}`)}
                      >
                        View Job Details
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-semibold mb-1">
                  {isClient ? 'Freelancer' : 'Client'}
                </h3>
                {otherParty && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Avatar>
                      <AvatarImage src={otherParty.avatar_url || ''} />
                      <AvatarFallback>{otherParty.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{otherParty.full_name || 'Unknown User'}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Contract Actions */}
              <Separator />
              
              <div className="space-y-2">
                {/* Freelancer actions */}
                {isFreelancer && contract.status === 'active' && (
                  <Button 
                    onClick={() => setShowSubmissionForm(true)}
                    className="w-full"
                  >
                    Submit Project
                  </Button>
                )}
                
                {/* Client actions */}
                {isClient && contract.status === 'submitted' && currentSubmission && (
                  <div className="space-y-2">
                    <Button 
                      onClick={handleAcceptSubmission}
                      className="w-full"
                    >
                      Accept Submission
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setRejectDialogOpen(true)}
                      className="w-full"
                    >
                      Request Changes
                    </Button>
                  </div>
                )}
                
                {/* Terminate contract option */}
                {contract.status !== 'completed' && contract.status !== 'terminated' && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                      >
                        Terminate Contract
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Terminate Contract</SheetTitle>
                        <SheetDescription>
                          Are you sure you want to terminate this contract? This action cannot be undone.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        <p>
                          Terminating this contract will:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Immediately end the working relationship</li>
                          <li>Mark the contract as terminated</li>
                          <li>Close any pending submissions</li>
                        </ul>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button 
                            variant="destructive" 
                            onClick={handleTerminateContract}
                          >
                            Terminate Contract
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Project Submission */}
          {canShowSubmissionDetails && (
            <ProjectSubmissionDetails 
              submission={currentSubmission} 
              isClient={isClient}
              onAccept={handleAcceptSubmission}
              onReject={() => setRejectDialogOpen(true)}
              onPayment={() => setShowPaymentForm(true)}
            />
          )}
        </div>
        
        <div className="md:col-span-2">
          {/* Project Submission Form */}
          {showSubmissionForm ? (
            <Card>
              <CardContent className="pt-6">
                <ProjectSubmissionForm 
                  contract={contract}
                  onSubmitSuccess={handleSubmitProject}
                  onCancel={() => setShowSubmissionForm(false)}
                />
              </CardContent>
            </Card>
          ) : showPaymentForm ? (
            <Card>
              <CardContent className="pt-6">
                <PaymentForm 
                  contract={contract}
                  onPaymentSuccess={handlePaymentSuccess}
                  onCancel={() => setShowPaymentForm(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Communicate with {isClient ? 'your freelancer' : 'the client'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[600px] p-0">
                {contract && user && (
                  <ChatInterface 
                    contractId={contract.id} 
                    currentUserId={user.id}
                    otherPartyName={otherParty?.full_name || 'User'}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Provide feedback to the freelancer about what needs to be changed or improved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Please describe what changes or improvements are needed..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[150px]"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRejectSubmission}
                disabled={!feedbackText}
              >
                Send Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
