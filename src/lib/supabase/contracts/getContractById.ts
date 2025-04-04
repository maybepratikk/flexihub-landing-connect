
import { supabase } from '../client';

// Get contract by ID
export async function getContractById(contractId: string) {
  console.log(`Getting contract by ID: ${contractId}`);
  try {
    // First attempt with all joins in a single query
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        jobs:job_id(id, title, description, budget_type),
        client:profiles!client_id(id, full_name, avatar_url, email),
        freelancer:profiles!freelancer_id(id, full_name, avatar_url, email)
      `)
      .eq('id', contractId)
      .single();
    
    if (error) {
      console.error(`Error fetching contract with ID ${contractId}:`, error);
      
      // If the join fails, try a simpler query to get the basic contract
      console.log(`Attempting fallback query for contract ${contractId}`);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('contracts')
        .select(`*`)
        .eq('id', contractId)
        .single();
        
      if (fallbackError) {
        console.error(`Fallback query also failed for contract ${contractId}:`, fallbackError);
        return null;
      }
      
      console.log(`Retrieved basic contract ${contractId} without joins:`, fallbackData);
      
      // If we got the basic contract, try to fetch job details separately
      if (fallbackData && fallbackData.job_id) {
        console.log(`Fetching job details separately for job_id ${fallbackData.job_id}`);
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('id, title, description, budget_type')
          .eq('id', fallbackData.job_id)
          .maybeSingle();
          
        if (jobError) {
          console.error(`Error fetching job details for job_id ${fallbackData.job_id}:`, jobError);
        } else {
          console.log(`Job data for contract ${contractId}:`, jobData);
          if (jobData) {
            fallbackData.jobs = jobData;
          }
        }
        
        // Fetch client profile
        if (fallbackData.client_id) {
          console.log(`Fetching client profile for ${fallbackData.client_id}`);
          const { data: clientData, error: clientError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email')
            .eq('id', fallbackData.client_id)
            .maybeSingle();
            
          if (clientError) {
            console.error(`Error fetching client profile:`, clientError);
          } else if (clientData) {
            console.log(`Client data:`, clientData);
            fallbackData.client = clientData;
          }
        }
        
        // Fetch freelancer profile
        if (fallbackData.freelancer_id) {
          console.log(`Fetching freelancer profile for ${fallbackData.freelancer_id}`);
          const { data: freelancerData, error: freelancerError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email')
            .eq('id', fallbackData.freelancer_id)
            .maybeSingle();
            
          if (freelancerError) {
            console.error(`Error fetching freelancer profile:`, freelancerError);
          } else if (freelancerData) {
            console.log(`Freelancer data:`, freelancerData);
            fallbackData.freelancer = freelancerData;
          }
        }
      }
      
      return fallbackData;
    }
    
    console.log(`Retrieved contract ${contractId} with joins:`, data);
    return data;
  } catch (error) {
    console.error('Error in getContractById:', error);
    return null;
  }
}
