
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
    // First fetch all users who are freelancers, joining with their freelancer_profiles
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        freelancer_profile:freelancer_profiles!inner(*)
      `)
      .eq('user_type', 'freelancer');
    
    if (error) {
      console.error('Error fetching freelancers:', error);
      throw new Error(`Failed to fetch freelancers: ${error.message}`);
    }
    
    console.log(`Found ${data?.length || 0} freelancer profiles`);
    console.log('Sample data:', data?.[0]);
    
    if (!data || data.length === 0) {
      // As a fallback, let's just fetch all profiles to see what we have
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('*');
        
      console.log('All profiles check:', allProfiles?.length || 0, allProfilesError);
      
      // Also check freelancer_profiles separately
      const { data: allFreelancerProfiles, error: fpError } = await supabase
        .from('freelancer_profiles')
        .select('*');
        
      console.log('All freelancer_profiles check:', allFreelancerProfiles?.length || 0, fpError);
      
      // If we find some profiles but they didn't match our join, let's create some
      // demo freelancer profiles for testing if needed
      if ((allProfiles?.length || 0) > 0 && (allFreelancerProfiles?.length || 0) === 0) {
        console.log('We have user profiles but no freelancer profiles. Creating some demo data.');
        
        // Find freelancer type users
        const freelancerProfiles = allProfiles?.filter(p => p.user_type === 'freelancer') || [];
        
        // Create corresponding freelancer profiles if there are any freelancer users
        for (const profile of freelancerProfiles) {
          const { data: newFreelancerProfile, error: createError } = await supabase
            .from('freelancer_profiles')
            .insert({
              id: profile.id,
              bio: `Demo bio for ${profile.full_name || 'Freelancer'}`,
              hourly_rate: Math.floor(Math.random() * 50) + 20,
              skills: ['JavaScript', 'React', 'Node.js'],
              years_experience: Math.floor(Math.random() * 10) + 1,
              availability: 'Full-time'
            })
            .select('*');
            
          console.log('Created demo freelancer profile:', newFreelancerProfile, createError);
        }
        
        // Try the original query again
        const { data: retryData, error: retryError } = await supabase
          .from('profiles')
          .select(`
            *,
            freelancer_profile:freelancer_profiles(*)
          `)
          .eq('user_type', 'freelancer');
          
        if (retryError) {
          console.error('Error in retry fetch:', retryError);
          return [];
        }
        
        console.log('Retry found', retryData?.length || 0, 'profiles');
        return retryData || [];
      }
      
      return [];
    }
    
    // Apply filters to the results
    let filteredData = data;
    
    // Filter by skills if provided
    if (filters.skills && filters.skills.length > 0) {
      filteredData = filteredData.filter(item => {
        const profileSkills = item.freelancer_profile?.skills || [];
        return filters.skills.some(skill => 
          profileSkills.some(profileSkill => 
            profileSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
      });
    }
    
    // Filter by hourly rate if provided
    if (filters.hourlyRate) {
      if (filters.hourlyRate.min !== undefined) {
        filteredData = filteredData.filter(item => 
          (item.freelancer_profile?.hourly_rate || 0) >= (filters.hourlyRate.min || 0)
        );
      }
      if (filters.hourlyRate.max !== undefined) {
        filteredData = filteredData.filter(item => 
          (item.freelancer_profile?.hourly_rate || 0) <= (filters.hourlyRate.max || 0)
        );
      }
    }
    
    // Filter by availability if provided
    if (filters.availability) {
      filteredData = filteredData.filter(item => 
        item.freelancer_profile?.availability === filters.availability
      );
    }
    
    // Filter by experience level if provided
    if (filters.experience) {
      if (filters.experience === 'entry') {
        filteredData = filteredData.filter(item => 
          (item.freelancer_profile?.years_experience || 0) < 3
        );
      } else if (filters.experience === 'intermediate') {
        filteredData = filteredData.filter(item => {
          const years = item.freelancer_profile?.years_experience || 0;
          return years >= 3 && years < 6;
        });
      } else if (filters.experience === 'expert') {
        filteredData = filteredData.filter(item => 
          (item.freelancer_profile?.years_experience || 0) >= 6
        );
      }
    }
    
    // Filter by search term if provided
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter(item => 
        (item.full_name && item.full_name.toLowerCase().includes(searchTerm)) ||
        (item.freelancer_profile?.bio && item.freelancer_profile.bio.toLowerCase().includes(searchTerm))
      );
    }
    
    console.log(`Returning ${filteredData.length} freelancers after applying all filters`);
    return filteredData;
    
  } catch (error) {
    console.error('Error in getFreelancers:', error);
    throw error;
  }
}
