import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ChatMessage } from '@/lib/supabase/types';
import { MessageNotification } from '@/components/notifications/MessageNotification';
import { InquiryNotification } from '@/components/notifications/InquiryNotification';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { updateInquiryStatus } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface NotificationContextType {
  recentApplications: any[];
  dismissNotification: (applicationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [lastMessageSeen, setLastMessageSeen] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showMessageNotification, setShowMessageNotification] = useState(false);
  const [currentInquiryIndex, setCurrentInquiryIndex] = useState(0);
  const [showInquiryNotification, setShowInquiryNotification] = useState(false);
  
  const handleNewApplicationStatus = useCallback((application: any) => {
    if (application && (application.status === 'accepted' || application.status === 'rejected')) {
      setRecentApplications(prev => {
        if (prev.some(app => app.id === application.id)) {
          return prev;
        }
        return [...prev, application];
      });
    }
  }, []);
  
  const handleNewChatMessage = useCallback((message: any) => {
    if (message.sender_id === user?.id) {
      return;
    }
    
    setRecentMessages(prev => {
      if (!prev.some(msg => msg.id === message.id)) {
        return [...prev, message];
      }
      return prev;
    });
    
    if (currentMessageIndex === 0) {
      setShowMessageNotification(true);
      
      setTimeout(() => {
        setShowMessageNotification(false);
      }, 5000);
    }
  }, [user?.id, currentMessageIndex]);
  
  const handleNewProjectInquiry = useCallback((inquiry: any) => {
    if (user?.user_metadata?.user_type !== 'freelancer') {
      return;
    }
    
    if (inquiry.freelancer_id === user?.id && inquiry.status === 'pending') {
      setRecentInquiries(prev => {
        if (!prev.some(inq => inq.id === inquiry.id)) {
          return [...prev, inquiry];
        }
        return prev;
      });
      
      if (currentInquiryIndex === 0) {
        setShowInquiryNotification(true);
        
        setTimeout(() => {
          setShowInquiryNotification(false);
        }, 5000);
      }
    }
  }, [user?.id, user?.user_metadata?.user_type, currentInquiryIndex]);
  
  useEffect(() => {
    if (!user) return;
    
    const applicationsChannel = supabase
      .channel('job_applications_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'job_applications',
          filter: `freelancer_id=eq.${user.id}`
        },
        (payload: any) => {
          supabase
            .from('job_applications')
            .select('*, jobs(*)')
            .eq('id', payload.new.id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                handleNewApplicationStatus(data);
              }
            });
        }
      )
      .subscribe();
    
    const messagesChannel = supabase
      .channel('chat_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload: any) => {
          supabase
            .from('chat_messages')
            .select('*, profiles(*)')
            .eq('id', payload.new.id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                handleNewChatMessage(data);
              }
            });
        }
      )
      .subscribe();
      
    const inquiriesChannel = supabase
      .channel('project_inquiries_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_inquiries'
        },
        (payload: any) => {
          supabase
            .from('project_inquiries_with_profiles')
            .select('*')
            .eq('id', payload.new.id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                handleNewProjectInquiry(data);
              }
            });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(applicationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(inquiriesChannel);
    };
  }, [user, handleNewApplicationStatus, handleNewChatMessage, handleNewProjectInquiry]);
  
  const handleCloseMessageNotification = useCallback(() => {
    setShowMessageNotification(false);
    
    if (currentMessageIndex < recentMessages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
      
      setTimeout(() => {
        setShowMessageNotification(true);
      }, 500);
    } else {
      setCurrentMessageIndex(0);
    }
  }, [currentMessageIndex, recentMessages.length]);
  
  const handleCloseInquiryNotification = useCallback(() => {
    setShowInquiryNotification(false);
    
    if (currentInquiryIndex < recentInquiries.length - 1) {
      setCurrentInquiryIndex(prev => prev + 1);
      
      setTimeout(() => {
        setShowInquiryNotification(true);
      }, 500);
    } else {
      setCurrentInquiryIndex(0);
    }
  }, [currentInquiryIndex, recentInquiries.length]);
  
  const handleAcceptInquiry = useCallback(async () => {
    if (recentInquiries.length === 0 || currentInquiryIndex >= recentInquiries.length) {
      return;
    }
    
    const inquiry = recentInquiries[currentInquiryIndex];
    try {
      const updated = await updateInquiryStatus(inquiry.id, 'accepted');
      if (updated) {
        toast({
          title: "Inquiry Accepted",
          description: "You've accepted the project inquiry. You can now chat with the client.",
        });
        
        setRecentInquiries(prev => 
          prev.map(inq => inq.id === inquiry.id ? { ...inq, status: 'accepted' } : inq)
        );
        
        handleCloseInquiryNotification();
        
        navigate(`/messages?client_id=${inquiry.client_id}`);
      }
    } catch (error) {
      console.error("Error accepting inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to accept the inquiry. Please try again.",
        variant: "destructive",
      });
    }
  }, [recentInquiries, currentInquiryIndex, handleCloseInquiryNotification, navigate]);
  
  const handleRejectInquiry = useCallback(async () => {
    if (recentInquiries.length === 0 || currentInquiryIndex >= recentInquiries.length) {
      return;
    }
    
    const inquiry = recentInquiries[currentInquiryIndex];
    try {
      const updated = await updateInquiryStatus(inquiry.id, 'rejected');
      if (updated) {
        toast({
          title: "Inquiry Rejected",
          description: "You've rejected the project inquiry.",
        });
        
        setRecentInquiries(prev => 
          prev.map(inq => inq.id === inquiry.id ? { ...inq, status: 'rejected' } : inq)
        );
        
        handleCloseInquiryNotification();
      }
    } catch (error) {
      console.error("Error rejecting inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to reject the inquiry. Please try again.",
        variant: "destructive",
      });
    }
  }, [recentInquiries, currentInquiryIndex, handleCloseInquiryNotification]);
  
  const dismissNotification = useCallback((applicationId: string) => {
    setRecentApplications(prev => prev.filter(app => app.id !== applicationId));
  }, []);

  const notificationToShow = showMessageNotification && recentMessages.length > 0 
    ? recentMessages[currentMessageIndex] 
    : null;
    
  const inquiryToShow = showInquiryNotification && recentInquiries.length > 0 && 
                        recentInquiries[currentInquiryIndex]?.status === 'pending'
    ? recentInquiries[currentInquiryIndex] 
    : null;

  return (
    <NotificationContext.Provider value={{ recentApplications, dismissNotification }}>
      {children}
      
      {notificationToShow && (
        <MessageNotification
          message={notificationToShow}
          isVisible={showMessageNotification}
          onClose={handleCloseMessageNotification}
        />
      )}
      
      {inquiryToShow && (
        <InquiryNotification
          inquiry={inquiryToShow}
          isVisible={showInquiryNotification}
          onClose={handleCloseInquiryNotification}
          onAccept={handleAcceptInquiry}
          onReject={handleRejectInquiry}
        />
      )}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
