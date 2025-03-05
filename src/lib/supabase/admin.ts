
import { supabase } from './client';

export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getAllUsers:', err);
    return [];
  }
}

export async function getAllJobs() {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, client:client_id(*)');
    
    if (error) {
      console.error('Error fetching all jobs:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getAllJobs:', err);
    return [];
  }
}

export async function getAllApplications() {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*, job:job_id(*), freelancer:freelancer_id(*)');
    
    if (error) {
      console.error('Error fetching all applications:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getAllApplications:', err);
    return [];
  }
}

export async function getAllContracts() {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, client:client_id(*), freelancer:freelancer_id(*), job:job_id(*)');
    
    if (error) {
      console.error('Error fetching all contracts:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getAllContracts:', err);
    return [];
  }
}
