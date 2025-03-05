
import { supabase } from '../client';

export async function getClientJobs(clientId: string) {
  try {
    console.log("Getting jobs for client:", clientId);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching client jobs:', error);
      return [];
    }
    
    console.log("Fetched client jobs:", data);
    return data;
  } catch (error) {
    console.error('Exception in getClientJobs:', error);
    return [];
  }
}
