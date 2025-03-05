
import { supabase } from './client';
import type { User } from './types';

export async function getUserProfile(userId: string) {
  try {
    console.log("Fetching user profile for:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
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
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception in updateUserProfile:', err);
    return null;
  }
}

export async function createUserProfile(profile: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception in createUserProfile:', err);
    return null;
  }
}
