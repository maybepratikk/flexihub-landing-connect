
import { supabase } from '../client';

// Update contract status
export async function updateContractStatus(
  contractId: string, 
  status: 'active' | 'completed' | 'terminated'
) {
  console.log(`Updating contract ${contractId} status to ${status}`);
  
  const updates: any = { 
    status, 
    updated_at: new Date().toISOString() 
  };
  
  // Add end date if the contract is being completed or cancelled
  if (status === 'completed' || status === 'terminated') {
    updates.end_date = new Date().toISOString();
  }
  
  try {
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating contract ${contractId} status:`, error);
      throw error;
    }
    
    console.log(`Contract ${contractId} status updated to ${status}:`, data);
    return data;
  } catch (error) {
    console.error('Error in updateContractStatus:', error);
    throw error;
  }
}
