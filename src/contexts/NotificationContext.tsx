
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProjectInquiry } from '@/lib/supabase/types';
import { getFreelancerInquiries } from '@/lib/supabase/inquiries';

type NotificationContextType = {
  showInquiryNotification: (inquiry: ProjectInquiry) => void;
  showMessageNotification: (message: any) => void;
  hideNotification: () => void;
  latestInquiry: ProjectInquiry | null;
  inquiryVisible: boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [latestInquiry, setLatestInquiry] = useState<ProjectInquiry | null>(null);
  const [inquiryVisible, setInquiryVisible] = useState(false);

  const showInquiryNotification = (inquiry: ProjectInquiry) => {
    setLatestInquiry(inquiry);
    setInquiryVisible(true);
  };
  
  const showMessageNotification = (message: any) => {
    // Handle message notifications
    toast({
      title: "New Message",
      description: `${message.profiles?.full_name || 'Someone'} sent you a message`,
    });
  };

  const hideNotification = () => {
    setInquiryVisible(false);
    setTimeout(() => {
      setLatestInquiry(null);
    }, 300);
  };

  useEffect(() => {
    if (!user || user.user_type !== 'freelancer') return;

    // Initial fetch of pending inquiries
    const fetchPendingInquiries = async () => {
      try {
        const inquiries = await getFreelancerInquiries(user.id);
        const pendingInquiries = inquiries.filter(
          (inquiry: ProjectInquiry) => inquiry.status === 'pending'
        );
        
        if (pendingInquiries.length > 0) {
          // Show the most recent pending inquiry
          showInquiryNotification(pendingInquiries[0]);
        }
      } catch (error) {
        console.error('Error fetching pending inquiries:', error);
      }
    };

    fetchPendingInquiries();

    // Set up real-time subscription for new inquiries
    const inquirySubscription = supabase
      .channel('project_inquiries_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_inquiries',
          filter: `freelancer_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('New inquiry received:', payload);
          
          // Fetch the complete inquiry with profile information
          try {
            const { data, error } = await supabase
              .from('project_inquiries_with_profiles')
              .select('*')
              .eq('id', payload.new.id)
              .single();
            
            if (error) {
              console.error('Error fetching inquiry details:', error);
              return;
            }
            
            if (data) {
              showInquiryNotification(data);
              
              // Also show a toast
              toast({
                title: "New Project Inquiry",
                description: `${data.client_name || 'A client'} has sent you a project inquiry.`,
              });
            }
          } catch (error) {
            console.error('Error processing new inquiry notification:', error);
          }
        }
      )
      .subscribe();
      
    // Set up real-time subscription for inquiry status changes  
    const inquiryStatusSubscription = supabase
      .channel('project_inquiries_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'project_inquiries',
          filter: `client_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('Inquiry status changed:', payload);
          
          // If an inquiry was accepted, notify the client
          if (payload.new.status === 'accepted') {
            try {
              const { data, error } = await supabase
                .from('project_inquiries_with_profiles')
                .select('*')
                .eq('id', payload.new.id)
                .single();
                
              if (error) {
                console.error('Error fetching inquiry details:', error);
                return;
              }
              
              if (data) {
                toast({
                  title: "Inquiry Accepted",
                  description: `${data.freelancer_name || 'A freelancer'} has accepted your project inquiry. You can now chat with them.`,
                });
              }
            } catch (error) {
              console.error('Error processing inquiry status change notification:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inquirySubscription);
      supabase.removeChannel(inquiryStatusSubscription);
    };
  }, [user, toast]);

  return (
    <NotificationContext.Provider
      value={{
        showInquiryNotification,
        showMessageNotification,
        hideNotification,
        latestInquiry,
        inquiryVisible,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
