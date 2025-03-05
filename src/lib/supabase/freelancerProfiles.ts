
import { supabase } from './client';
import type { FreelancerProfile } from './types';
import { mockFreelancers } from '@/lib/mock/freelancers';

export async function getFreelancerProfile(userId: string) {
  try {
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
  } catch (error) {
    console.error('Unexpected error fetching freelancer profile:', error);
    return null;
  }
}

export async function updateFreelancerProfile(userId: string, updates: Partial<FreelancerProfile>) {
  try {
    const { data, error } = await supabase
      .from('freelancer_profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating freelancer profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error updating freelancer profile:', error);
    return null;
  }
}

export async function getFreelancers(filters: {
  skills: string[];
  experience?: 'entry' | 'intermediate' | 'expert';
  hourlyRate: { min?: number; max?: number };
  availability?: string;
  search: string;
}) {
  console.log('Getting freelancers with filters:', filters);
  
  try {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        freelancer_profile:freelancer_profiles(*)
      `)
      .eq('user_type', 'freelancer');
    
    const { data: profiles, error: profilesError } = await query;
    
    if (profilesError) {
      console.error('Error fetching freelancer profiles:', profilesError);
      console.log('Falling back to mock data due to query error');
      return mockFreelancers;
    }
    
    console.log(`Found ${profiles?.length || 0} freelancer profiles`, profiles);
    
    if (!profiles || profiles.length === 0) {
      console.log('No freelancer profiles found in database, using mock data');
      return mockFreelancers;
    }
    
    // Filter out any profiles without freelancer_profile data
    let filteredData = profiles?.filter(profile => profile.freelancer_profile) || [];
    
    if (filteredData.length === 0) {
      console.log('No freelancer profiles with complete data found, using mock data');
      return mockFreelancers;
    }
    
    // Apply filters to the results
    // Filter by skills if provided
    if (filters.skills && filters.skills.length > 0) {
      filteredData = filteredData.filter(item => {
        const profileSkills = item.freelancer_profile?.skills || [];
        return filters.skills.some(skill => 
          profileSkills.some((profileSkill: string) => 
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
        (item.freelancer_profile?.bio && item.freelancer_profile.bio.toLowerCase().includes(searchTerm)) ||
        (item.freelancer_profile?.skills && item.freelancer_profile.skills.some((skill: string) => 
          skill.toLowerCase().includes(searchTerm)
        ))
      );
    }
    
    console.log(`Returning ${filteredData.length} freelancers after applying filters`);
    return filteredData;
    
  } catch (error) {
    console.error('Error in getFreelancers:', error);
    console.log('Falling back to mock data due to exception');
    return mockFreelancers;
  }
}
