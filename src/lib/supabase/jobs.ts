
import { supabase } from './client';
import type { Job } from './types';

export async function createJob(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>) {
  console.log("Creating job with data in supabase:", jobData);
  
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating job:', error);
    return null;
  }
  
  return data;
}

export async function getJobs(filters?: {
  category?: string;
  experience_level?: string;
  skills?: string[];
  search?: string;
}) {
  let query = supabase
    .from('jobs')
    .select('*, profiles(*)')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  
  if (filters) {
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.experience_level) {
      query = query.eq('experience_level', filters.experience_level);
    }
    
    if (filters.skills && filters.skills.length > 0) {
      query = query.overlaps('skills_required', filters.skills);
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
  
  return data;
}

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
