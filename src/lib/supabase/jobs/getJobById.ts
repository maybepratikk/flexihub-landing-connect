
import { supabase } from '../client';

export async function getJobById(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, profiles(*)')
      .eq('id', jobId)
      .single();
    
    if (error) {
      console.error('Error fetching job with profiles:', error);
      
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (jobError) {
        console.error('Error fetching job without profiles:', jobError);
        return null;
      }
      
      return jobData;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in getJobById:', error);
    return null;
  }
}
