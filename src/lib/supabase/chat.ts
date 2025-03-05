
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
  // Only mark messages as read that were sent by the other party
  const { error } = await supabase
    .from('chat_messages')
    .update({ read: true })
    .eq('contract_id', contractId)
    .neq('sender_id', userId)
    .eq('read', false); // Only update messages that aren't already read
  
  if (error) {
    console.error('Error marking messages as read:', error);
    return null;
  }
  
  return true;
}

export async function subscribeToContractMessages(
  contractId: string, 
  callback: (message: ChatMessage) => void
) {
  // Set up a channel specifically for this contract's messages
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
        // Pass the new message data to the callback
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

export async function getContractsWithMessages(userId: string) {
  // Get all contracts where the user is either client or freelancer
  const { data: contracts, error: contractsError } = await supabase
    .from('contracts')
    .select(`
      *,
      client:profiles!contracts_client_id_fkey(id, full_name, avatar_url),
      freelancer:profiles!contracts_freelancer_id_fkey(id, full_name, avatar_url),
      jobs(title)
    `)
    .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (contractsError) {
    console.error('Error fetching contracts:', contractsError);
    return [];
  }
  
  // For each contract, get the last message
  const contractsWithLastMessage = await Promise.all(
    contracts.map(async (contract) => {
      const { data: lastMessage, error: messageError } = await supabase
        .from('chat_messages')
        .select('message, created_at, sender_id')
        .eq('contract_id', contract.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (messageError && messageError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        console.error(`Error fetching last message for contract ${contract.id}:`, messageError);
      }
      
      return {
        ...contract,
        last_message: lastMessage || null
      };
    })
  );
  
  return contractsWithLastMessage;
}
