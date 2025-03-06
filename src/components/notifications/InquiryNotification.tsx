
import React from 'react';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ProjectInquiry } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface InquiryNotificationProps {
  inquiry: ProjectInquiry;
  isVisible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export function InquiryNotification({ 
  inquiry, 
  isVisible, 
  onClose,
  onAccept,
  onReject
}: InquiryNotificationProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 transform border border-border",
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-10 opacity-0 pointer-events-none"
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
            <AvatarImage 
              src={inquiry.client_avatar || ''} 
              alt={inquiry.client_name || 'Client'} 
            />
            <AvatarFallback>
              {inquiry.client_name?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              New Project Inquiry from {inquiry.client_name || 'Unknown client'}
            </p>
            <p className="text-sm text-gray-500 line-clamp-2 break-words mt-1">
              {inquiry.project_description}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {inquiry.created_at && formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
            </p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="default" onClick={onAccept}>
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={onReject}>
                Decline
              </Button>
            </div>
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
