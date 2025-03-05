
import { supabase } from './client';
import type { User, FreelancerProfile, ClientProfile } from './types';

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

export async function getFreelancers(filters: {
  skills: string[];
  experience?: 'entry' | 'intermediate' | 'expert';
  hourlyRate: { min?: number; max?: number };
  availability?: string;
  search: string;
}) {
  // Start with a base query to get all freelancer profiles
  let query = supabase
    .from('profiles')
    .select(`
      *,
      freelancer_profiles(*)
    `)
    .eq('user_type', 'freelancer');

  // Apply filters only if they are provided and not empty
  if (filters.skills && filters.skills.length > 0) {
    // Use a contains operator to check if any of the skills match
    query = query.or(filters.skills.map(skill => 
      `freelancer_profiles.skills.cs.{${skill}}`
    ).join(','));
  }

  // Apply hourly rate filter if provided
  if (filters.hourlyRate.min !== undefined) {
    query = query.gte('freelancer_profiles.hourly_rate', filters.hourlyRate.min);
  }
  if (filters.hourlyRate.max !== undefined) {
    query = query.lte('freelancer_profiles.hourly_rate', filters.hourlyRate.max);
  }

  // Apply availability filter if provided
  if (filters.availability) {
    query = query.eq('freelancer_profiles.availability', filters.availability);
  }

  // Apply search filter if provided
  if (filters.search && filters.search.trim() !== '') {
    query = query.or(`full_name.ilike.%${filters.search}%, freelancer_profiles.bio.ilike.%${filters.search}%`);
  }

  console.log('Final query:', query);
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching freelancers:', error);
    throw new Error(`Failed to fetch freelancers: ${error.message}`);
  }

  // Filter out any profiles that don't have freelancer_profiles data
  const validFreelancers = data?.filter(profile => 
    profile.freelancer_profiles && Object.keys(profile.freelancer_profiles).length > 0
  ) || [];

  console.log('Fetched freelancers:', validFreelancers.length);
  return validFreelancers;
}
