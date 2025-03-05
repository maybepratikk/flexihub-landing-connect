
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
  console.log('Fetching freelancers with filters:', filters);
  
  try {
    // First, fetch all profiles that are freelancers
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'freelancer');
    
    if (profilesError) {
      console.error('Error fetching freelancer profiles:', profilesError);
      throw new Error(`Failed to fetch freelancer profiles: ${profilesError.message}`);
    }
    
    if (!profilesData || profilesData.length === 0) {
      console.log('No freelancer profiles found in the database.');
      return [];
    }
    
    console.log(`Found ${profilesData.length} freelancer profiles`);
    
    // Extract the IDs of all freelancer profiles
    const freelancerIds = profilesData.map(profile => profile.id);
    
    // Now fetch all corresponding freelancer_profiles
    let query = supabase
      .from('freelancer_profiles')
      .select('*');
    
    // Add in filter logic
    if (freelancerIds.length > 0) {
      query = query.in('id', freelancerIds);
    }
    
    // Apply hourly rate filter if provided
    if (filters.hourlyRate.min !== undefined) {
      query = query.gte('hourly_rate', filters.hourlyRate.min);
    }
    if (filters.hourlyRate.max !== undefined) {
      query = query.lte('hourly_rate', filters.hourlyRate.max);
    }
    
    // Apply availability filter if provided
    if (filters.availability) {
      query = query.eq('availability', filters.availability);
    }
    
    // Apply skills filter if provided
    if (filters.skills && filters.skills.length > 0) {
      // Use the containedBy operator for array overlap
      // This is a more reliable way to check if the skills array contains any of the filter skills
      const skillsConditions = filters.skills.map((skill, index) => 
        `skills[${index}].ilike.%${skill}%`
      );
      
      if (skillsConditions.length > 0) {
        query = query.or(skillsConditions.join(','));
      }
    }
    
    const { data: freelancerProfilesData, error: freelancerProfilesError } = await query;
    
    if (freelancerProfilesError) {
      console.error('Error fetching freelancer_profiles:', freelancerProfilesError);
      throw new Error(`Failed to fetch freelancer_profiles: ${freelancerProfilesError.message}`);
    }
    
    if (!freelancerProfilesData || freelancerProfilesData.length === 0) {
      console.log('No freelancer_profiles data found.');
      return [];
    }
    
    console.log(`Found ${freelancerProfilesData.length} freelancer_profiles`);
    
    // Now join the data from profiles and freelancer_profiles
    const combinedData = freelancerProfilesData.map(freelancerProfile => {
      const matchingProfile = profilesData.find(profile => profile.id === freelancerProfile.id);
      return {
        ...matchingProfile,
        freelancer_profiles: freelancerProfile
      };
    });
    
    // Apply search filter if provided
    let filteredData = combinedData;
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase();
      filteredData = combinedData.filter(data => 
        (data.full_name && data.full_name.toLowerCase().includes(searchTerm)) ||
        (data.freelancer_profiles && 
         data.freelancer_profiles.bio && 
         data.freelancer_profiles.bio.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply experience filter if provided
    if (filters.experience) {
      if (filters.experience === 'entry') {
        filteredData = filteredData.filter(data => 
          data.freelancer_profiles && 
          data.freelancer_profiles.years_experience !== null && 
          data.freelancer_profiles.years_experience < 3
        );
      } else if (filters.experience === 'intermediate') {
        filteredData = filteredData.filter(data => 
          data.freelancer_profiles && 
          data.freelancer_profiles.years_experience !== null && 
          data.freelancer_profiles.years_experience >= 3 && 
          data.freelancer_profiles.years_experience < 6
        );
      } else if (filters.experience === 'expert') {
        filteredData = filteredData.filter(data => 
          data.freelancer_profiles && 
          data.freelancer_profiles.years_experience !== null && 
          data.freelancer_profiles.years_experience >= 6
        );
      }
    }
    
    console.log(`Returning ${filteredData.length} freelancers after applying all filters`);
    return filteredData;
    
  } catch (error) {
    console.error('Error in getFreelancers:', error);
    throw error;
  }
}
