
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  getChatMessages, 
  sendChatMessage, 
  markMessagesAsRead, 
  ChatMessage 
} from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Send } from 'lucide-react';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  contractId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  className?: string;
}

export function ChatInterface({ contractId, otherUserName, otherUserAvatar, className }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const loadMessages = async () => {
      if (!contractId || !user) return;
      
      setLoading(true);
      try {
        const messagesData = await getChatMessages(contractId);
        setMessages(messagesData);
        
        // Mark messages as read
        await markMessagesAsRead(contractId, user.id);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `contract_id=eq.${contractId}`
        },
        async (payload) => {
          console.log('Real-time update:', payload);
          
          // Reload messages when there's an update
          const messagesData = await getChatMessages(contractId);
          setMessages(messagesData);
          
          // Mark messages as read
          if (user) {
            await markMessagesAsRead(contractId, user.id);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [contractId, user, toast]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractId || !user || !newMessage.trim()) return;
    
    setSending(true);
    
    try {
      await sendChatMessage(contractId, user.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };
  
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };
  
  const formatMessageDate = (timestamp: string) => {
    return format(new Date(timestamp), 'MMMM d, yyyy');
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: Record<string, any[]> = {};
    
    messages.forEach(message => {
      const date = formatMessageDate(message.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Chat with {otherUserName}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(messageGroups).map(([date, dateMessages]) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Separator className="flex-grow" />
                    <span className="text-xs text-muted-foreground">{date}</span>
                    <Separator className="flex-grow" />
                  </div>
                  
                  {dateMessages.map((message) => {
                    const isCurrentUser = message.sender_id === user?.id;
                    
                    return (
                      <div 
                        key={message.id} 
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} gap-2`}
                      >
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.profiles?.avatar_url || ''} alt={message.profiles?.full_name || 'User'} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-[70%] ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'} p-3 rounded-lg`}>
                          <p className="whitespace-pre-wrap break-words">
                            {message.message}
                          </p>
                          <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-secondary-foreground/70'}`}>
                            {formatMessageTime(message.created_at)}
                          </p>
                        </div>
                        
                        {isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={user?.user_metadata?.full_name || 'You'} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="resize-none min-h-[80px]"
          />
          <Button type="submit" className="self-end" disabled={sending || !newMessage.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
