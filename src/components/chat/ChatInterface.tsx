
import { useState, useEffect, useRef } from 'react';
import { supabase, sendChatMessage, getChatMessages, markMessagesAsRead, ChatMessage } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatInterfaceProps {
  contractId: string;
  currentUserId: string;
  otherPartyName: string;
}

export function ChatInterface({ contractId, currentUserId, otherPartyName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const chatMessages = await getChatMessages(contractId);
      setMessages(chatMessages);
      setLoading(false);
      
      // Mark all messages from the other party as read
      await markMessagesAsRead(contractId, currentUserId);
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('chat_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `contract_id=eq.${contractId}`
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // If message is from the other party, mark it as read
        if (newMessage.sender_id !== currentUserId) {
          markMessagesAsRead(contractId, currentUserId);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [contractId, currentUserId]);
  
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
    if (!newMessage.trim()) return;
    
    try {
      await sendChatMessage(contractId, currentUserId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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
          />
          <Button size="icon" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
