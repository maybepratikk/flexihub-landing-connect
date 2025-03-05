
import { supabase } from './client';
import type { ChatMessage } from './types';

export async function sendChatMessage(contractId: string, senderId: string, message: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      contract_id: contractId,
      sender_id: senderId,
      message,
      read: false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error sending chat message:', error);
    return null;
  }
  
  return data;
}

export async function getChatMessages(contractId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, profiles!inner(full_name, avatar_url)')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
  
  return data;
}

export async function markMessagesAsRead(contractId: string, userId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .update({ read: true })
    .eq('contract_id', contractId)
    .neq('sender_id', userId);
  
  if (error) {
    console.error('Error marking messages as read:', error);
    return null;
  }
  
  return data;
}

export async function subscribeToContractMessages(
  contractId: string, 
  callback: (message: ChatMessage) => void
) {
  return supabase
    .channel(`contract-messages-${contractId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `contract_id=eq.${contractId}`
      }, 
      (payload) => {
        // Cast payload.new to ChatMessage type
        callback(payload.new as ChatMessage);
      }
    )
    .subscribe();
}

export async function getUnreadMessageCount(contractId: string, userId: string) {
  const { count, error } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('contract_id', contractId)
    .eq('read', false)
    .neq('sender_id', userId);
  
  if (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
  
  return count || 0;
}
