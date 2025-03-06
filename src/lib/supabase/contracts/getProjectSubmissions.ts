
import { supabase } from '../client';
import { ProjectSubmission } from '../types';

// Get project submissions by contract ID
export async function getProjectSubmissionsByContract(contractId: string): Promise<ProjectSubmission[]> {
  console.log(`Fetching project submissions for contract: ${contractId}`);
  
  try {
    const { data, error } = await supabase
      .from('project_submissions')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching project submissions:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data.length} project submissions for contract ${contractId}`);
    return data;
  } catch (error) {
    console.error('Error in getProjectSubmissionsByContract:', error);
    return [];
  }
}

// Get project submissions by freelancer ID
export async function getProjectSubmissionsByFreelancer(freelancerId: string): Promise<ProjectSubmission[]> {
  console.log(`Fetching project submissions for freelancer: ${freelancerId}`);
  
  try {
    const { data, error } = await supabase
      .from('project_submissions')
      .select('*')
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching freelancer project submissions:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data.length} project submissions for freelancer ${freelancerId}`);
    return data;
  } catch (error) {
    console.error('Error in getProjectSubmissionsByFreelancer:', error);
    return [];
  }
}

// Get project submissions by client ID
export async function getProjectSubmissionsByClient(clientId: string): Promise<ProjectSubmission[]> {
  console.log(`Fetching project submissions for client: ${clientId}`);
  
  try {
    const { data, error } = await supabase
      .from('project_submissions')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching client project submissions:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data.length} project submissions for client ${clientId}`);
    return data;
  } catch (error) {
    console.error('Error in getProjectSubmissionsByClient:', error);
    return [];
  }
}
