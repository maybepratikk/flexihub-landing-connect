
import { supabase } from './client';

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, client_profiles(*), freelancer_profiles(*)');
  
  if (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
  
  return data || [];
}

export async function getAllJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, profiles!jobs_client_id_fkey(full_name, avatar_url)');
  
  if (error) {
    console.error('Error fetching all jobs:', error);
    throw error;
  }
  
  return data || [];
}

export async function getAllApplications() {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      profiles!job_applications_freelancer_id_fkey(full_name, avatar_url),
      freelancer_profiles!job_applications_freelancer_id_fkey(*),
      jobs(title, status, budget_type)
    `);
  
  if (error) {
    console.error('Error fetching all applications:', error);
    throw error;
  }
  
  return data || [];
}

export async function getAllContracts() {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      freelancer:profiles!contracts_freelancer_id_fkey(id, full_name, avatar_url, email),
      client:profiles!contracts_client_id_fkey(id, full_name, avatar_url, email),
      jobs(id, title, description, status, budget_type)
    `);
  
  if (error) {
    console.error('Error fetching all contracts:', error);
    throw error;
  }
  
  return data || [];
}
