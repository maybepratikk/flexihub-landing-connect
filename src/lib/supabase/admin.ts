
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
      .select('*, profiles:client_id(*)');
    
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
      .select(`
        *,
        job:job_id(*),
        freelancer:freelancer_id(*)
      `);
    
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
      .select(`
        *,
        client:client_id(*),
        freelancer:freelancer_id(*),
        job:job_id(*)
      `);
    
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

// Check if a user has admin privileges
export async function checkAdminStatus(userId: string) {
  try {
    const { data, error } = await supabase
      .from('admin_access')
      .select('access_level')
      .eq('admin_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking admin status:', error);
      return { isAdmin: false, accessLevel: null };
    }
    
    return {
      isAdmin: !!data,
      accessLevel: data?.access_level || null
    };
  } catch (err) {
    console.error('Exception in checkAdminStatus:', err);
    return { isAdmin: false, accessLevel: null };
  }
}

// Create a test admin user (for development purposes)
export async function createTestAdmin(email: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('admin_access')
      .insert([
        { admin_id: userId, access_level: 'standard' }
      ])
      .select();
      
    if (error) {
      console.error('Error creating test admin:', error);
      return false;
    }
    
    console.log(`Admin privileges granted to ${email}`);
    return true;
  } catch (err) {
    console.error('Exception in createTestAdmin:', err);
    return false;
  }
}
