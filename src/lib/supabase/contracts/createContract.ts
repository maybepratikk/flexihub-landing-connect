
import { supabase } from '../client';

// Create a new contract
export async function createContract(contractData: {
  job_id: string;
  freelancer_id: string;
  client_id: string;
  rate: number;
  start_date?: string;
  status?: 'active' | 'completed' | 'terminated';
}) {
  console.log("Creating contract with data:", contractData);
  
  try {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        job_id: contractData.job_id,
        freelancer_id: contractData.freelancer_id,
        client_id: contractData.client_id,
        rate: contractData.rate,
        status: contractData.status || 'active',
        start_date: contractData.start_date || new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
    
    console.log('Contract created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createContract:', error);
    throw error;
  }
}
