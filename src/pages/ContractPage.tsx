import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  getContractById,
  Contract
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ContractPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const { user } = useContext(AuthContext);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
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
  
  // Extract job details and make sure we handle both array and object formats
  const jobDetails = contract.jobs && Array.isArray(contract.jobs) && contract.jobs.length > 0
    ? contract.jobs[0]
    : contract.jobs || {};
  
  // Get the correct other party data
  const otherPartyId = isClient ? contract.freelancer_id : contract.client_id;
  
  // Handle different structures for profiles data
  let otherParty = null;
  if (contract.profiles) {
    if (isClient) {
      // When viewing as client, get freelancer info (from freelancer_id key)
      otherParty = contract.profiles.freelancer_id || contract.profiles;
    } else {
      // When viewing as freelancer, get client info (from client_id key)
      otherParty = contract.profiles.client_id || contract.profiles;
    }
  }

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
                  contract.status === 'completed' ? 'secondary' : 
                  'secondary'
                }>
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-1">Rate</h3>
                <p className="text-lg font-medium">
                  ${contract.rate}{jobDetails.budget_type === 'hourly' ? '/hr' : ' (fixed)'}
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
                    <h4 className="font-medium">{jobDetails.title || 'Unnamed Job'}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {jobDetails.description && jobDetails.description.substring(0, 100)}...
                    </p>
                    {jobDetails.id && (
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
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
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
        </div>
      </div>
    </div>
  );
}
