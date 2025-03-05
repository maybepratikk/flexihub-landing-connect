
import { supabase } from './client';

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
  
  return data || [];
}

export async function getAllJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*');
  
  if (error) {
    console.error('Error fetching all jobs:', error);
    return [];
  }
  
  return data || [];
}

export async function getAllApplications() {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*');
  
  if (error) {
    console.error('Error fetching all applications:', error);
    return [];
  }
  
  return data || [];
}

export async function getAllContracts() {
  const { data, error } = await supabase
    .from('contracts')
    .select('*');
  
  if (error) {
    console.error('Error fetching all contracts:', error);
    return [];
  }
  
  return data || [];
}
