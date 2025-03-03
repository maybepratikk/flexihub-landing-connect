
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { getContractById } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Calendar, DollarSign, Briefcase } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function ContractPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<any>(null);
  
  useEffect(() => {
    const loadContract = async () => {
      if (!contractId || !user) return;
      
      setLoading(true);
      try {
        const contractData = await getContractById(contractId);
        
        if (!contractData) {
          toast({
            title: 'Contract not found',
            description: 'The contract you are looking for does not exist',
            variant: 'destructive'
          });
          navigate('/dashboard');
          return;
        }
        
        // Check if user is part of this contract
        if (contractData.client_id !== user.id && contractData.freelancer_id !== user.id) {
          toast({
            title: 'Unauthorized',
            description: 'You do not have permission to view this contract',
            variant: 'destructive'
          });
          navigate('/dashboard');
          return;
        }
        
        setContract(contractData);
      } catch (error) {
        console.error('Error loading contract:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contract',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadContract();
  }, [contractId, user, navigate, toast]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }
  
  if (!contract) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The contract you're looking for doesn't exist or has been removed
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  const isClient = user?.id === contract.client_id;
  const otherUser = isClient 
    ? contract.profiles.freelancer_id 
    : contract.profiles.client_id;
  const otherUserName = isClient 
    ? contract.profiles.freelancer_id.full_name 
    : contract.profiles.client_id.full_name;
  const otherUserAvatar = isClient 
    ? contract.profiles.freelancer_id.avatar_url 
    : contract.profiles.client_id.avatar_url;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{contract.jobs.title}</CardTitle>
                    <CardDescription>
                      Contract {contract.status}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    contract.status === 'active' ? 'default' : 
                    contract.status === 'completed' ? 'outline' : 'destructive'
                  }>
                    {contract.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Start Date</h3>
                      <p>{format(new Date(contract.start_date), 'PPP')}</p>
                    </div>
                  </div>
                  
                  {contract.end_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">End Date</h3>
                        <p>{format(new Date(contract.end_date), 'PPP')}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Rate</h3>
                      <p>
                        ${contract.rate}
                        {contract.jobs.budget_type === 'hourly' ? '/hr' : ' total'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Job Type</h3>
                      <p>
                        {contract.jobs.budget_type === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Job Description</h3>
                  <div className="text-muted-foreground whitespace-pre-line">
                    {contract.jobs.description}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <ChatInterface 
              contractId={contract.id} 
              otherUserName={otherUserName} 
              otherUserAvatar={otherUserAvatar}
            />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isClient ? 'Freelancer' : 'Client'}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={otherUserAvatar || ''} alt={otherUserName} />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{otherUserName}</h3>
                <p className="text-sm text-muted-foreground">
                  {isClient ? 'Freelancer' : 'Client'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Status:</strong> {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </p>
                <p>
                  <strong>Duration:</strong> {formatDistanceToNow(new Date(contract.start_date), { addSuffix: false })}
                </p>
                {contract.jobs.category && (
                  <p>
                    <strong>Category:</strong> {contract.jobs.category}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
