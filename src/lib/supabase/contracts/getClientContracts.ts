
import { supabase } from '../client';

// Get all contracts for a client
export async function getClientContracts(clientId: string) {
  console.log(`Getting contracts for client: ${clientId}`);
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        jobs:job_id(*),
        profiles:freelancer_id(id, full_name, avatar_url, email),
        freelancer_profiles:freelancer_id(*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching client contracts:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} contracts for client ${clientId}:`, data);
    return data || [];
  } catch (error) {
    console.error('Error in getClientContracts:', error);
    return [];
  }
}
