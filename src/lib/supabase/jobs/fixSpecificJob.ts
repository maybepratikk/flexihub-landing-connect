
import { supabase } from '../client';

export async function fixSpecificJob(jobTitle: string) {
  console.log(`Fixing specific job with title: ${jobTitle}`);
  try {
    // First, find the job
    const { data: job, error: findError } = await supabase
      .from('jobs')
      .select('id, status')
      .eq('title', jobTitle)
      .single();
    
    if (findError) {
      console.error(`Error finding job with title ${jobTitle}:`, findError);
      return null;
    }
    
    if (!job) {
      console.log(`No job found with title: ${jobTitle}`);
      return null;
    }
    
    console.log(`Found job with title ${jobTitle}:`, job);
    
    // If job is not already in_progress, update it
    if (job.status !== 'in_progress') {
      console.log(`Updating job ${job.id} status to in_progress`);
      const { data, error } = await supabase
        .from('jobs')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', job.id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating job ${job.id} status:`, error);
        return null;
      }
      
      console.log(`Successfully updated job ${job.id} status to in_progress:`, data);
      return data;
    } else {
      console.log(`Job ${job.id} already has status in_progress`);
      return job;
    }
  } catch (error) {
    console.error(`Error in fixSpecificJob for ${jobTitle}:`, error);
    return null;
  }
}
