
import { supabase } from '../client';

// Check if a contract already exists for a specific job and freelancer
export async function checkExistingContract(jobId: string, freelancerId: string) {
  console.log(`Checking if contract exists for job ${jobId} and freelancer ${freelancerId}`);
  
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('id')
      .eq('job_id', jobId)
      .eq('freelancer_id', freelancerId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking for existing contract:', error);
      throw error;
    }
    
    console.log(`Contract check result:`, data);
    return data; // Will be null if no contract exists
  } catch (error) {
    console.error('Exception in checkExistingContract:', error);
    return null;
  }
}
