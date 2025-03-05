
import { supabase } from './client';
import type { FreelancerProfile } from './types';

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

export async function getFreelancers(filters: {
  skills: string[];
  experience?: 'entry' | 'intermediate' | 'expert';
  hourlyRate: { min?: number; max?: number };
  availability?: string;
  search: string;
}) {
  console.log('Getting freelancers with filters:', filters);
  
  try {
    // Check if there are any freelancer profiles at all
    const { data: freelancerProfiles, error: fpError } = await supabase
      .from('freelancer_profiles')
      .select('id');
    
    if (fpError) {
      console.error('Error checking freelancer profiles:', fpError);
      throw new Error('Failed to check freelancer profiles');
    }
    
    // If there are no freelancer profiles, create some demo data
    if (!freelancerProfiles || freelancerProfiles.length === 0) {
      console.log('No freelancer profiles found. Creating demo data...');
      await createDemoFreelancers();
    }
    
    // Get all profiles that are freelancers
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'freelancer');
    
    if (profilesError) {
      console.error('Error fetching freelancer profiles:', profilesError);
      throw new Error('Failed to fetch freelancers');
    }
    
    // For each profile, get their freelancer profile data
    const result = [];
    for (const profile of profiles || []) {
      const { data: freelancerProfile, error: fpError } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('id', profile.id)
        .single();
      
      if (fpError && fpError.code !== 'PGRST116') {
        console.error(`Error fetching freelancer profile for ${profile.id}:`, fpError);
        continue;
      }
      
      // Combine the profile and freelancer_profile data
      const combinedProfile = {
        ...profile,
        freelancer_profile: freelancerProfile || null
      };
      
      result.push(combinedProfile);
    }
    
    console.log(`Found ${result.length} freelancer profiles`);
    
    // Apply filters to the results
    let filteredData = result;
    
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
    
    console.log(`Returning ${filteredData.length} freelancers after applying filters`);
    return filteredData;
    
  } catch (error) {
    console.error('Error in getFreelancers:', error);
    throw error;
  }
}

// Helper function to create demo freelancer data
async function createDemoFreelancers() {
  try {
    // Create some demo freelancer profiles
    const demoFreelancers = [
      {
        full_name: "John Smith",
        email: "john.smith@example.com",
        user_type: "freelancer",
        avatar_url: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      {
        full_name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        user_type: "freelancer",
        avatar_url: "https://randomuser.me/api/portraits/women/2.jpg"
      },
      {
        full_name: "David Lee",
        email: "david.lee@example.com",
        user_type: "freelancer",
        avatar_url: "https://randomuser.me/api/portraits/men/3.jpg"
      },
      {
        full_name: "Emily Chen",
        email: "emily.chen@example.com",
        user_type: "freelancer",
        avatar_url: "https://randomuser.me/api/portraits/women/4.jpg"
      },
      {
        full_name: "Michael Rodriguez",
        email: "michael.rodriguez@example.com",
        user_type: "freelancer",
        avatar_url: "https://randomuser.me/api/portraits/men/5.jpg"
      }
    ];
    
    for (const demoFreelancer of demoFreelancers) {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', demoFreelancer.email)
        .single();
      
      if (existingProfile) {
        console.log(`Profile for ${demoFreelancer.email} already exists, skipping`);
        continue;
      }
      
      // Insert the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert(demoFreelancer)
        .select('id')
        .single();
      
      if (profileError) {
        console.error(`Error creating demo profile for ${demoFreelancer.email}:`, profileError);
        continue;
      }
      
      console.log(`Created demo profile for ${demoFreelancer.email} with ID ${profile.id}`);
      
      // Create corresponding freelancer profile
      const skills = ["JavaScript", "React", "CSS", "HTML", "Node.js", "TypeScript"].sort(() => 0.5 - Math.random()).slice(0, 3);
      const freelancerProfile = {
        id: profile.id,
        bio: `Experienced ${skills.join(", ")} developer with a passion for creating beautiful and functional web applications.`,
        hourly_rate: Math.floor(Math.random() * 50) + 30,
        skills,
        years_experience: Math.floor(Math.random() * 10) + 1,
        availability: ["Full-time", "Part-time", "Contract", "Hourly"][Math.floor(Math.random() * 4)],
        education: "Bachelor's in Computer Science",
        portfolio_links: [`https://github.com/${demoFreelancer.full_name.split(' ')[0].toLowerCase()}`]
      };
      
      const { error: fpError } = await supabase
        .from('freelancer_profiles')
        .insert(freelancerProfile);
      
      if (fpError) {
        console.error(`Error creating freelancer profile for ${demoFreelancer.email}:`, fpError);
        continue;
      }
      
      console.log(`Created freelancer profile for ${demoFreelancer.email}`);
    }
    
    console.log('Demo freelancer data creation completed');
  } catch (error) {
    console.error('Error creating demo freelancers:', error);
  }
}
