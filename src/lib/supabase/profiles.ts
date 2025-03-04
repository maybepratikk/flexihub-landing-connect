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
  let query = supabase
    .from('profiles')
    .select(`
      *,
      freelancer_profiles(*)
    `)
    .eq('user_type', 'freelancer')
    .not('freelancer_profiles', 'is', null);

  // Apply skills filter if provided
  if (filters.skills && filters.skills.length > 0) {
    query = query.contains('freelancer_profiles.skills', filters.skills);
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
  if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%, freelancer_profiles.bio.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching freelancers:', error);
    return [];
  }

  return data || [];
}
