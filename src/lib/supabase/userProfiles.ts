
import { supabase } from './client';
import type { User, FreelancerProfile, ClientProfile } from './types';

export async function getUserProfile(userId: string) {
  try {
    console.log("Fetching user profile for:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        freelancer_profile:freelancer_profiles(*),
        client_profile:client_profiles(*)
      `)
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    console.log("User profile fetched:", data);
    return data;
  } catch (err) {
    console.error('Exception in getUserProfile:', err);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  try {
    console.log("Updating user profile for:", userId, "with updates:", updates);
    
    // Check if we need to update the freelancer_profile
    if (updates.freelancer_profile) {
      console.log("Updating freelancer profile");
      const { data: freelancerData, error: freelancerError } = await supabase
        .from('freelancer_profiles')
        .upsert({
          ...updates.freelancer_profile,
          id: userId
        })
        .select()
        .maybeSingle();
      
      if (freelancerError) {
        console.error('Error updating freelancer profile:', freelancerError);
        return null;
      }
      
      console.log("Freelancer profile updated:", freelancerData);
    }
    
    // Check if we need to update the client_profile
    if (updates.client_profile) {
      console.log("Updating client profile");
      const { data: clientData, error: clientError } = await supabase
        .from('client_profiles')
        .upsert({
          ...updates.client_profile,
          id: userId
        })
        .select()
        .maybeSingle();
      
      if (clientError) {
        console.error('Error updating client profile:', clientError);
        return null;
      }
      
      console.log("Client profile updated:", clientData);
    }
    
    // Update the profiles table if needed
    const profileUpdates: any = {};
    if (updates.full_name) profileUpdates.full_name = updates.full_name;
    if (updates.avatar_url) profileUpdates.avatar_url = updates.avatar_url;
    
    if (Object.keys(profileUpdates).length > 0) {
      console.log("Updating main profile with:", profileUpdates);
      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId)
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error updating main profile:', error);
        return null;
      }
      
      console.log("Main profile updated:", data);
    }
    
    // Fetch the updated profile to return
    return getUserProfile(userId);
  } catch (err) {
    console.error('Exception in updateUserProfile:', err);
    return null;
  }
}

export async function createUserProfile(profile: any) {
  try {
    console.log("Creating user profile:", profile);
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    console.log("User profile created:", data);
    return data;
  } catch (err) {
    console.error('Exception in createUserProfile:', err);
    return null;
  }
}
