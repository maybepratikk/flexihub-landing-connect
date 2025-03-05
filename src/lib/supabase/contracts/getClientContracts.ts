
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
    
    // Ensure we return unique contracts by ID
    if (data && data.length > 0) {
      const uniqueContracts = Array.from(
        new Map(data.map(contract => [contract.id, contract])).values()
      );
      
      if (uniqueContracts.length !== data.length) {
        console.log(`Deduplicated ${data.length - uniqueContracts.length} contracts from database query`);
      }
      
      console.log(`Retrieved ${uniqueContracts.length} unique contracts for client ${clientId}`);
      return uniqueContracts;
    }
    
    console.log(`Retrieved ${data?.length || 0} contracts for client ${clientId}`);
    return data || [];
  } catch (error) {
    console.error('Error in getClientContracts:', error);
    return [];
  }
}
