
import { supabase } from './client';

// Create a new project inquiry
export async function createProjectInquiry(inquiryData: {
  client_id: string;
  freelancer_id: string;
  project_description: string;
}) {
  try {
    console.log("Creating project inquiry:", inquiryData);
    
    const { data, error } = await supabase
      .from('project_inquiries')
      .insert(inquiryData)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error creating project inquiry:', error);
      return null;
    }
    
    console.log("Project inquiry created:", data);
    return data;
  } catch (err) {
    console.error('Exception in createProjectInquiry:', err);
    return null;
  }
}

// Get project inquiries for a freelancer
export async function getFreelancerInquiries(freelancerId: string) {
  try {
    console.log("Fetching inquiries for freelancer:", freelancerId);
    
    const { data, error } = await supabase
      .from('project_inquiries_with_profiles')
      .select('*')
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching freelancer inquiries:', error);
      return [];
    }
    
    console.log("Fetched freelancer inquiries:", data);
    return data;
  } catch (err) {
    console.error('Exception in getFreelancerInquiries:', err);
    return [];
  }
}

// Get project inquiries for a client
export async function getClientInquiries(clientId: string) {
  try {
    console.log("Fetching inquiries for client:", clientId);
    
    const { data, error } = await supabase
      .from('project_inquiries_with_profiles')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching client inquiries:', error);
      return [];
    }
    
    console.log("Fetched client inquiries:", data);
    return data;
  } catch (err) {
    console.error('Exception in getClientInquiries:', err);
    return [];
  }
}

// Update project inquiry status (accept/reject)
export async function updateInquiryStatus(inquiryId: string, status: 'accepted' | 'rejected') {
  try {
    console.log(`Updating inquiry ${inquiryId} status to ${status}`);
    
    const { data, error } = await supabase
      .from('project_inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', inquiryId)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error updating inquiry status:', error);
      return null;
    }
    
    console.log("Inquiry status updated:", data);
    return data;
  } catch (err) {
    console.error('Exception in updateInquiryStatus:', err);
    return null;
  }
}
