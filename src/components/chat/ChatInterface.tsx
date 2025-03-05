
import { useState, useEffect, useRef } from 'react';
import { 
  sendChatMessage, 
  getChatMessages, 
  markMessagesAsRead, 
  subscribeToContractMessages 
} from '@/lib/supabase/chat';
import { ChatMessage } from '@/lib/supabase/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatInterfaceProps {
  contractId: string;
  currentUserId: string;
  otherPartyName: string;
}

export function ChatInterface({ contractId, currentUserId, otherPartyName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const chatMessages = await getChatMessages(contractId);
        setMessages(chatMessages);
        
        // Mark all messages from the other party as read
        await markMessagesAsRead(contractId, currentUserId);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error loading messages",
          description: "Could not load chat messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages using the Supabase realtime API
    const setupSubscription = async () => {
      try {
        const subscription = await subscribeToContractMessages(contractId, (newMessage) => {
          console.log("New message received:", newMessage);
          
          // If we have all the data we need directly in the payload
          if (newMessage) {
            setMessages(prevMessages => {
              // Check if the message already exists in our messages array
              const exists = prevMessages.some(m => m.id === newMessage.id);
              if (exists) return prevMessages;
              
              // Add the new message to the messages array
              return [...prevMessages, newMessage];
            });
            
            // If message is from the other party, mark it as read
            if (newMessage.sender_id !== currentUserId) {
              markMessagesAsRead(contractId, currentUserId);
            }
          }
        });
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    };
    
    const unsubscribe = setupSubscription();
    
    return () => {
      // Clean up the subscription when the component unmounts
      if (unsubscribe) {
        unsubscribe.then(unsub => {
          if (unsub) unsub();
        });
      }
    };
  }, [contractId, currentUserId, toast]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      setNewMessage(''); // Clear input immediately for better UX
      const sentMessage = await sendChatMessage(contractId, currentUserId, newMessage.trim());
      
      if (!sentMessage) {
        throw new Error("Failed to send message");
      }
      
      // No need to manually add to messages array since we'll get it via subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Your message could not be sent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {loading ? (
          <div className="space-y-4">
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            No messages yet. Start the conversation with {otherPartyName}.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isCurrentUser={message.sender_id === currentUserId} 
              />
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            placeholder={`Message ${otherPartyName}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow"
            disabled={sending}
          />
          <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex items-start gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-3 w-[100px]" />
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-start max-w-[75%]">
        {!isCurrentUser && message.profiles && (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={message.profiles.avatar_url || ''} />
            <AvatarFallback>{message.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`rounded-lg px-4 py-2 ${
          isCurrentUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}>
          <div className="break-words whitespace-pre-wrap">{message.message}</div>
          <div className={`text-xs mt-1 ${
            isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            {message.created_at && formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            {message.read && isCurrentUser && (
              <span className="ml-2">✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
