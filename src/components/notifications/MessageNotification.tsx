
import React from 'react';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

interface MessageNotificationProps {
  message: ChatMessage;
  isVisible: boolean;
  onClose: () => void;
}

export function MessageNotification({ message, isVisible, onClose }: MessageNotificationProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 transform border border-border",
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-10 opacity-0 pointer-events-none"
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
            <AvatarImage 
              src={message.profiles?.avatar_url || ''} 
              alt={message.profiles?.full_name || 'User'} 
            />
            <AvatarFallback>
              {message.profiles?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {message.profiles?.full_name || 'Unknown user'}
            </p>
            <p className="text-sm text-gray-500 line-clamp-2 break-words">
              {message.message}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {message.created_at && formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
