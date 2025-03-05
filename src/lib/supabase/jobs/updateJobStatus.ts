
import { supabase } from '../client';

export async function updateJobStatus(jobId: string, status: 'open' | 'in_progress' | 'completed' | 'cancelled') {
  try {
    console.log(`====== UPDATING JOB STATUS ======`);
    console.log(`Job ID: ${jobId}, New Status: ${status}`);
    
    if (!jobId) {
      throw new Error('Job ID is required');
    }
    
    // Get current job status for logging
    const { data: currentJob } = await supabase
      .from('jobs')
      .select('status, title, id')
      .eq('id', jobId)
      .maybeSingle();
      
    console.log(`Current job status: ${currentJob?.status}, title: ${currentJob?.title}, id: ${currentJob?.id}`);
    
    // If this is the "Testing @1 am" job, use the direct update function
    if (currentJob?.title === "Testing @1 am") {
      console.log("Using direct update function for 'Testing @1 am' job");
      return await updateJobStatusDirectly(jobId, status);
    }
    
    // Update the job status
    const { data, error } = await supabase
      .from('jobs')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating job status:', error);
      return null;
    }
    
    console.log('Job status updated successfully:', data);
    
    // Verify the update by fetching the job again
    const { data: verifiedJob } = await supabase
      .from('jobs')
      .select('status, title, id')
      .eq('id', jobId)
      .maybeSingle();
      
    console.log(`Verified job status: ${verifiedJob?.status}, title: ${verifiedJob?.title}, id: ${verifiedJob?.id}`);
    console.log(`====== JOB STATUS UPDATE COMPLETE ======`);
    
    return data;
  } catch (error) {
    console.error('Exception in updateJobStatus:', error);
    return null;
  }
}

export async function updateJobStatusDirectly(jobId: string, status: 'open' | 'in_progress' | 'completed' | 'cancelled') {
  console.log(`Directly updating job ${jobId} status to ${status}`);
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating job ${jobId} status to ${status}:`, error);
      throw error;
    }
    
    console.log(`Job ${jobId} status updated to ${status}:`, data);
    
    // Verify the job status after update
    const { data: verification } = await supabase
      .from('jobs')
      .select('status')
      .eq('id', jobId)
      .single();
    
    console.log(`Job ${jobId} status verification:`, verification);
    
    return data;
  } catch (error) {
    console.error('Error in updateJobStatusDirectly:', error);
    throw error;
  }
}
