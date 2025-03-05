
import { supabase } from '../client';

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
