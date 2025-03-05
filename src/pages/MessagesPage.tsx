import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { getContractsWithMessages, getUnreadMessageCount } from '@/lib/supabase/chat';
import { Contract } from '@/lib/supabase/types';

interface ContractWithLastMessage extends Contract {
  last_message?: {
    message: string;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
  id: string;
  client_id: string;
  freelancer_id: string;
  client?: {
    full_name?: string;
    avatar_url?: string;
  };
  freelancer?: {
    full_name?: string;
    avatar_url?: string;
  };
  jobs?: {
    title?: string;
  };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<ContractWithLastMessage[]>([]);

  useEffect(() => {
    async function loadContracts() {
      if (!user) return;

      try {
        setLoading(true);
        const contractsWithMessages = await getContractsWithMessages(user.id);
        
        const contractsWithUnreadCounts = await Promise.all(
          contractsWithMessages.map(async (contract) => {
            const unreadCount = await getUnreadMessageCount(contract.id, user.id);
            return {
              ...contract,
              unread_count: unreadCount
            };
          })
        );
        
        const sortedContracts = contractsWithUnreadCounts.sort((a, b) => {
          const dateA = a.last_message?.created_at ? new Date(a.last_message.created_at) : new Date(0);
          const dateB = b.last_message?.created_at ? new Date(b.last_message.created_at) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        setContracts(sortedContracts);
      } catch (error) {
        console.error('Error loading contracts with messages:', error);
      } finally {
        setLoading(false);
      }
    }

    loadContracts();
  }, [user]);

  const getOtherPartyDetails = (contract: ContractWithLastMessage) => {
    if (!user) return { name: 'Unknown', avatar: '' };
    
    const isClient = user.id === contract.client_id;
    const otherParty = isClient ? contract.freelancer : contract.client;
    
    return {
      name: otherParty?.full_name || 'Unknown',
      avatar: otherParty?.avatar_url || ''
    };
  };

  const handleContractClick = (contractId: string) => {
    navigate(`/contracts/${contractId}`);
  };

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      {loading ? (
        <div className="space-y-4">
          <MessageSkeleton />
          <MessageSkeleton />
          <MessageSkeleton />
        </div>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">You don't have any message conversations yet.</p>
            <p className="mt-2">Messages will appear here once you have contracts with clients or freelancers.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => {
            const { name, avatar } = getOtherPartyDetails(contract);
            const isUserSender = contract.last_message?.sender_id === user?.id;
            
            return (
              <Button
                key={contract.id}
                variant="ghost"
                className="w-full p-4 h-auto justify-start"
                onClick={() => handleContractClick(contract.id)}
              >
                <div className="flex items-start w-full">
                  <Avatar className="h-12 w-12 mr-4 flex-shrink-0">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h3 className={`font-medium truncate ${contract.unread_count ? 'font-semibold' : ''}`}>
                        {name}
                      </h3>
                      {contract.last_message?.created_at && (
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {formatDistanceToNow(new Date(contract.last_message.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <p className="text-sm text-muted-foreground truncate mr-2">
                        {contract.last_message ? (
                          <>
                            {isUserSender && <span>You: </span>}
                            {contract.last_message.message}
                          </>
                        ) : (
                          <span className="italic">No messages yet</span>
                        )}
                      </p>
                      
                      {contract.unread_count > 0 && (
                        <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                          {contract.unread_count}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {contract.jobs?.title || 'Untitled Project'}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex items-start p-4 border rounded-md">
      <Skeleton className="h-12 w-12 rounded-full mr-4" />
      <div className="flex-grow space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
