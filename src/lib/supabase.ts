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

// Updated Job type to include profiles
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
  duration?: 'short' | 'medium' | 'long' | null;
  experience_level?: 'entry' | 'intermediate' | 'expert' | null;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  // Add profiles property to match what's returned from the database
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
};

// Updated JobApplication type to include profiles, freelancer_profiles, and contact info
export type JobApplication = {
  id: string;
  job_id: string;
  freelancer_id: string;
  cover_letter?: string;
  pitch?: string;
  proposed_rate?: number;
  contact_phone?: string;
  contact_email?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  updated_at?: string;
  // Add profiles property to match what's returned from the database
  profiles?: {
    full_name?: string;
    avatar_url?: string;
    id?: string;
  };
  // Add freelancer_profiles property to match what's returned from the database
  freelancer_profiles?: {
    bio?: string;
    skills?: string[];
    years_experience?: number;
    portfolio_links?: string[];
  };
  // Add jobs property for embedded job data
  jobs?: {
    title?: string;
    budget_type?: string;
    status?: string;
    id?: string;
  };
};

// Updated Contract type to include jobs and profiles
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
  // Add profiles property to match what's returned from the database
  profiles?: {
    client_id?: {
      id?: string;
      full_name?: string;
      avatar_url?: string;
    };
    freelancer_id?: {
      id?: string;
      full_name?: string;
      avatar_url?: string;
    };
  };
  // Add jobs property to match what's returned from the database
  jobs?: {
    title?: string;
    description?: string;
    budget_type?: 'fixed' | 'hourly';
    id?: string;
  };
};

// Updated ChatMessage type to include profiles
export type ChatMessage = {
  id: string;
  contract_id: string;
  sender_id: string;
  message: string;
  created_at?: string;
  read: boolean;
  // Add profiles property to match what's returned from the database
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
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
  try {
    // First attempt to get the job with profiles
    const { data, error } = await supabase
      .from('jobs')
      .select('*, profiles(*)')
      .eq('id', jobId)
      .single();
    
    if (error) {
      console.error('Error fetching job with profiles:', error);
      
      // If that fails, try to fetch just the job without the join
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

// Enhanced function to apply for a job with a pitch and contact info
export async function applyForJobWithPitch(application: Omit<JobApplication, 'id' | 'status' | 'created_at' | 'updated_at'>) {
  console.log("Applying for job with data:", application);
  
  try {
    // Validate required fields
    if (!application.job_id) {
      throw new Error('Job ID is required');
    }
    
    if (!application.freelancer_id) {
      throw new Error('Freelancer ID is required');
    }
    
    if (!application.pitch) {
      throw new Error('Pitch is required');
    }

    // Log the application data that will be inserted
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

// Enhanced function to get applications for a job with more detailed info
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

// Enhanced function to get freelancer's applications with job details
export async function getFreelancerApplications(freelancerId: string) {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*, jobs!inner(*)')
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching freelancer applications:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Exception in getFreelancerApplications:', error);
    return [];
  }
}

// Enhanced function to update application status
export async function updateApplicationStatus(applicationId: string, status: 'pending' | 'accepted' | 'rejected') {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ 
        status,
        updated_at: new Date().toISOString() // Update the timestamp
      })
      .eq('id', applicationId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating application status:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in updateApplicationStatus:', error);
    return null;
  }
}

// Enhanced function to create a contract
export async function createContract(contractData: Omit<Contract, 'id' | 'created_at' | 'updated_at'>) {
  try {
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
  } catch (error) {
    console.error('Exception in createContract:', error);
    return null;
  }
}

// Enhanced function to get contracts for a client
export async function getClientContracts(clientId: string) {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        jobs(*),
        profiles!contracts_freelancer_id_fkey(id, full_name, avatar_url)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching client contracts:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Exception in getClientContracts:', error);
    return [];
  }
}

// Enhanced function to get contracts for a freelancer
export async function getFreelancerContracts(freelancerId: string) {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, jobs!inner(*), profiles!inner(id, full_name, avatar_url)')
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching freelancer contracts:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Exception in getFreelancerContracts:', error);
    return [];
  }
}

// Function to get a specific application
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

// Function to get a specific contract
export async function getContractById(contractId: string) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*, jobs!inner(*), profiles!freelancer_id(id, full_name, avatar_url), profiles!client_id(id, full_name, avatar_url)')
    .eq('id', contractId)
    .single();
  
  if (error) {
    console.error('Error fetching contract:', error);
    return null;
  }
  
  return data;
}

// Function to send a chat message
export async function sendChatMessage(contractId: string, senderId: string, message: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      contract_id: contractId,
      sender_id: senderId,
      message,
      read: false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error sending chat message:', error);
    return null;
  }
  
  return data;
}

// Function to get chat messages for a contract
export async function getChatMessages(contractId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, profiles!inner(full_name, avatar_url)')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
  
  return data;
}

// Function to mark messages as read
export async function markMessagesAsRead(contractId: string, userId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .update({ read: true })
    .eq('contract_id', contractId)
    .neq('sender_id', userId);
  
  if (error) {
    console.error('Error marking messages as read:', error);
    return null;
  }
  
  return data;
}

// Function to check if a user has applied to a job
export async function hasAppliedToJob(jobId: string, freelancerId: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('id, status')
    .eq('job_id', jobId)
    .eq('freelancer_id', freelancerId)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking application status:', error);
    return null;
  }
  
  return data;
}

// Enhanced function to update a job's status
export async function updateJobStatus(jobId: string, status: 'open' | 'in_progress' | 'completed' | 'cancelled') {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({ 
        status,
        updated_at: new Date().toISOString() // Update the timestamp
      })
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating job status:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in updateJobStatus:', error);
    return null;
  }
}
