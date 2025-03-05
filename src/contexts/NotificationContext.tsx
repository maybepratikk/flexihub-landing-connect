
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMessage } from '@/lib/supabase/types';
import { MessageNotification } from '@/components/notifications/MessageNotification';

interface NotificationContextType {
  showMessageNotification: (message: ChatMessage) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [activeNotification, setActiveNotification] = useState<ChatMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showMessageNotification = (message: ChatMessage) => {
    // Don't show notification for messages sent by the current user
    if (message.sender_id === localStorage.getItem('currentUserId')) return;
    
    setActiveNotification(message);
    setIsVisible(true);
    
    // Auto-hide notification after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setActiveNotification(null), 300); // Wait for animation to complete
    }, 5000);
    
    return () => clearTimeout(timer);
  };

  const hideNotification = () => {
    setIsVisible(false);
    setTimeout(() => setActiveNotification(null), 300); // Wait for animation to complete
  };

  return (
    <NotificationContext.Provider value={{ showMessageNotification }}>
      {children}
      {activeNotification && (
        <MessageNotification 
          message={activeNotification} 
          isVisible={isVisible} 
          onClose={hideNotification} 
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
