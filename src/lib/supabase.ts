
import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ojpktmqthcvhxrawkeup.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcGt0bXF0aGN2aHhyYXdrZXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTI0NjYsImV4cCI6MjA1NjQ4ODQ2Nn0.hng1tROa-PrMLQbcRpRjFomJXIY79rrmiPS7ihpivPM';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  user_type?: 'freelancer' | 'client';
  created_at?: string;
};

export type FreelancerProfile = {
  id: string;
  bio?: string;
  hourly_rate?: number;
  skills?: string[];
  years_experience?: number;
  education?: string;
  portfolio_links?: string[];
  availability?: string;
  created_at?: string;
  updated_at?: string;
};

export type ClientProfile = {
  id: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  company_description?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
};

export type Job = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  skills_required: string[];
  budget_min?: number;
  budget_max?: number;
  budget_type: 'fixed' | 'hourly';
  duration?: 'short' | 'medium' | 'long';
  experience_level?: 'entry' | 'intermediate' | 'expert';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
};

export type JobApplication = {
  id: string;
  job_id: string;
  freelancer_id: string;
  cover_letter?: string;
  proposed_rate?: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  updated_at?: string;
};

export type Contract = {
  id: string;
  job_id: string;
  freelancer_id: string;
  client_id: string;
  rate: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'terminated';
  created_at?: string;
  updated_at?: string;
};

// Function to get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

// Function to update user profile
export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
  
  return data;
}

// Function to get freelancer profile
export async function getFreelancerProfile(userId: string) {
  const { data, error } = await supabase
    .from('freelancer_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching freelancer profile:', error);
    return null;
  }
  
  return data;
}

// Function to update freelancer profile
export async function updateFreelancerProfile(userId: string, updates: Partial<FreelancerProfile>) {
  const { data, error } = await supabase
    .from('freelancer_profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating freelancer profile:', error);
    return null;
  }
  
  return data;
}

// Function to get client profile
export async function getClientProfile(userId: string) {
  const { data, error } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching client profile:', error);
    return null;
  }
  
  return data;
}

// Function to update client profile
export async function updateClientProfile(userId: string, updates: Partial<ClientProfile>) {
  const { data, error } = await supabase
    .from('client_profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating client profile:', error);
    return null;
  }
  
  return data;
}

// Function to create a new job
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

// Function to get all jobs with optional filters
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
      // Filter jobs that have at least one of the requested skills
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

// Function to get a specific job by ID
export async function getJobById(jobId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, profiles!inner(full_name, avatar_url)')
    .eq('id', jobId)
    .single();
  
  if (error) {
    console.error('Error fetching job:', error);
    return null;
  }
  
  return data;
}

// Function to get jobs created by a client
export async function getClientJobs(clientId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching client jobs:', error);
    return [];
  }
  
  return data;
}

// Function to apply for a job
export async function applyForJob(application: Omit<JobApplication, 'id' | 'status' | 'created_at' | 'updated_at'>) {
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
    return null;
  }
  
  return data;
}

// Function to get applications for a job
export async function getJobApplications(jobId: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*, profiles!inner(full_name, avatar_url), freelancer_profiles!inner(*)')
    .eq('job_id', jobId);
  
  if (error) {
    console.error('Error fetching job applications:', error);
    return [];
  }
  
  return data;
}

// Function to get freelancer's applications
export async function getFreelancerApplications(freelancerId: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*, jobs!inner(*)')
    .eq('freelancer_id', freelancerId);
  
  if (error) {
    console.error('Error fetching freelancer applications:', error);
    return [];
  }
  
  return data;
}

// Function to update application status
export async function updateApplicationStatus(applicationId: string, status: 'pending' | 'accepted' | 'rejected') {
  const { data, error } = await supabase
    .from('job_applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating application status:', error);
    return null;
  }
  
  return data;
}

// Function to create a contract
export async function createContract(contractData: Omit<Contract, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('contracts')
    .insert(contractData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating contract:', error);
    return null;
  }
  
  return data;
}

// Function to get contracts for a client
export async function getClientContracts(clientId: string) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*, jobs!inner(*), profiles!freelancer_id(full_name, avatar_url)')
    .eq('client_id', clientId);
  
  if (error) {
    console.error('Error fetching client contracts:', error);
    return [];
  }
  
  return data;
}

// Function to get contracts for a freelancer
export async function getFreelancerContracts(freelancerId: string) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*, jobs!inner(*), profiles!client_id(full_name, avatar_url)')
    .eq('freelancer_id', freelancerId);
  
  if (error) {
    console.error('Error fetching freelancer contracts:', error);
    return [];
  }
  
  return data;
}
