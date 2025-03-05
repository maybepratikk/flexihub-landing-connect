
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
import { Send, Image, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { showMessageNotification } = useNotification();
  const { user } = useAuth();
  
  // Check if user is a freelancer
  const isFreelancer = user?.user_type === 'freelancer';
  
  useEffect(() => {
    localStorage.setItem('currentUserId', currentUserId);
  }, [currentUserId]);
  
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const chatMessages = await getChatMessages(contractId);
        setMessages(chatMessages);
        
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
    
    const setupSubscription = async () => {
      try {
        const subscription = await subscribeToContractMessages(contractId, (newMessage) => {
          console.log("New message received via realtime:", newMessage);
          
          if (newMessage) {
            setMessages(prevMessages => {
              const exists = prevMessages.some(m => m.id === newMessage.id);
              if (exists) return prevMessages;
              
              return [...prevMessages, newMessage];
            });
            
            if (newMessage.sender_id !== currentUserId) {
              markMessagesAsRead(contractId, currentUserId);
              showMessageNotification(newMessage);
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
      if (unsubscribe) {
        unsubscribe.then(unsub => {
          if (unsub) unsub();
        });
      }
    };
  }, [contractId, currentUserId, toast, showMessageNotification]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || sending) return;
    
    try {
      setSending(true);
      const messageText = newMessage.trim();
      setNewMessage('');
      
      // Clear image preview after sending
      const imageToSend = selectedImage;
      setSelectedImage(null);
      setPreviewUrl(null);
      
      const sentMessage = await sendChatMessage(contractId, currentUserId, messageText, imageToSend);
      
      if (!sentMessage) {
        throw new Error("Failed to send message");
      }
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      
      {previewUrl && (
        <div className="p-2 border-t">
          <div className="relative inline-block">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="h-20 w-auto rounded-md object-cover"
            />
            <button
              className="absolute top-0 right-0 bg-foreground/10 hover:bg-foreground/20 rounded-full p-0.5 transform translate-x-1/2 -translate-y-1/2"
              onClick={clearSelectedImage}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
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
          
          {isFreelancer && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={handleImageButtonClick}
                disabled={sending}
                title="Send an image"
              >
                <Image className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={(!newMessage.trim() && !selectedImage) || sending}
          >
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
          {message.image_url && (
            <a href={message.image_url} target="_blank" rel="noopener noreferrer" className="block mb-2">
              <img 
                src={message.image_url} 
                alt="Shared image" 
                className="rounded-md max-w-full max-h-60 object-contain"
              />
            </a>
          )}
          
          {message.message && (
            <div className="break-words whitespace-pre-wrap">{message.message}</div>
          )}
          
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
