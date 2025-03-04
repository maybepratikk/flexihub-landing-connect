
import { supabase } from './client';
import type { JobApplication } from './types';

export async function applyForJobWithPitch(application: Omit<JobApplication, 'id' | 'status' | 'created_at' | 'updated_at'>) {
  console.log("Applying for job with data:", application);
  
  try {
    if (!application.job_id) {
      throw new Error('Job ID is required');
    }
    
    if (!application.freelancer_id) {
      throw new Error('Freelancer ID is required');
    }
    
    if (!application.pitch) {
      throw new Error('Pitch is required');
    }

    console.log("Inserting application with data:", {
      ...application,
      status: 'pending'
    });
    
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        ...application,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned from application insert');
      throw new Error('No data returned from application insert');
    }
    
    console.log('Application submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception in applyForJobWithPitch:', error);
    throw error;
  }
}

export async function getJobApplications(jobId: string) {
  try {
    console.log("Getting applications for job:", jobId);
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        profiles:freelancer_id(id, full_name, avatar_url)
      `)
      .eq('job_id', jobId);
    
    if (error) {
      console.error('Error fetching job applications:', error);
      return [];
    }
    
    console.log("Fetched applications:", data);
    return data;
  } catch (error) {
    console.error('Exception in getJobApplications:', error);
    return [];
  }
}

export async function getFreelancerApplications(userId: string) {
  console.log(`Getting applications for freelancer: ${userId}`);
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs:job_id(
          id, 
          title, 
          description, 
          budget_type, 
          status, 
          budget_min, 
          budget_max, 
          client_id,
          category,
          duration
        ),
        profiles:jobs!job_id(client_id(id, full_name, avatar_url, email))
      `)
      .eq('freelancer_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching freelancer applications:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} applications for freelancer ${userId}:`, data);
    return data || [];
  } catch (error) {
    console.error('Error in getFreelancerApplications:', error);
    return [];
  }
}

export async function hasAppliedToJob(jobId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('id, status')
      .eq('job_id', jobId)
      .eq('freelancer_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`User ${userId} has not applied to job ${jobId}`);
        return null;
      }
      console.error('Error checking job application:', error);
      throw error;
    }
    
    console.log(`Application status for job ${jobId} by user ${userId}:`, data);
    return data;
  } catch (error) {
    console.error('Error in hasAppliedToJob:', error);
    throw error;
  }
}

export async function updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected') {
  console.log(`Updating application ${applicationId} status to ${status}`);
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select(`
        *,
        jobs:job_id (*)
      `)
      .single();
    
    if (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
    
    console.log(`Successfully updated application ${applicationId} to ${status}:`, data);
    
    // After update, verify that the application is still retrievable
    await verifyApplicationExists(applicationId);
    
    return data;
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    throw error;
  }
}

export async function verifyApplicationExists(applicationId: string) {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('id', applicationId)
      .single();
    
    if (error) {
      console.error(`Verification failed: Application ${applicationId} not found after update:`, error);
    } else {
      console.log(`Verification successful: Application ${applicationId} still exists after update:`, data);
    }
    
    return data;
  } catch (error) {
    console.error('Error in verifyApplicationExists:', error);
    return null;
  }
}

export async function getApplicationById(applicationId: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*, profiles!inner(*), freelancer_profiles!inner(*)')
    .eq('id', applicationId)
    .single();
  
  if (error) {
    console.error('Error fetching application:', error);
    return null;
  }
  
  return data;
}
