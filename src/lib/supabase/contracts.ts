
import { supabase } from './client';
import { Contract } from './types';

// Get all contracts for a freelancer
export async function getFreelancerContracts(freelancerId: string) {
  console.log(`Getting contracts for freelancer: ${freelancerId}`);
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        jobs:job_id(*),
        client:profiles!client_id(id, full_name, avatar_url, email)
      `)
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching freelancer contracts:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} contracts for freelancer ${freelancerId}:`, data);
    
    // If job details are missing in any contract, try to fetch them separately
    if (data && data.length > 0) {
      const enhancedData = await Promise.all(data.map(async (contract) => {
        // If job details are missing, try to fetch them
        if (!contract.jobs && contract.job_id) {
          console.log(`Fetching missing job details for contract ${contract.id} with job_id ${contract.job_id}`);
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', contract.job_id)
            .maybeSingle();
            
          if (jobError) {
            console.error(`Error fetching job details for job_id ${contract.job_id}:`, jobError);
          } else if (jobData) {
            console.log(`Retrieved job details for contract ${contract.id}:`, jobData);
            contract.jobs = jobData;
          }
        }
        return contract;
      }));
      
      console.log(`Enhanced contracts data for freelancer ${freelancerId}:`, enhancedData);
      return enhancedData;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getFreelancerContracts:', error);
    return [];
  }
}

// Get all contracts for a client
export async function getClientContracts(clientId: string) {
  console.log(`Getting contracts for client: ${clientId}`);
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        jobs:job_id(*),
        profiles:freelancer_id(id, full_name, avatar_url, email),
        freelancer_profiles:freelancer_id(*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching client contracts:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} contracts for client ${clientId}:`, data);
    return data || [];
  } catch (error) {
    console.error('Error in getClientContracts:', error);
    return [];
  }
}

// Get contract by ID
export async function getContractById(contractId: string) {
  console.log(`Getting contract by ID: ${contractId}`);
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        jobs:job_id(*),
        client:profiles!client_id(id, full_name, avatar_url, email),
        freelancer:profiles!freelancer_id(id, full_name, avatar_url, email)
      `)
      .eq('id', contractId)
      .single();
    
    if (error) {
      console.error(`Error fetching contract with ID ${contractId}:`, error);
      
      // If we get an error on the join, try a simpler query
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
        const { data: jobData } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', fallbackData.job_id)
          .maybeSingle();
          
        console.log(`Job data for contract ${contractId}:`, jobData);
        
        if (jobData) {
          fallbackData.jobs = jobData;
        }
        
        // Fetch client profile
        if (fallbackData.client_id) {
          const { data: clientData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email')
            .eq('id', fallbackData.client_id)
            .maybeSingle();
            
          if (clientData) {
            fallbackData.client = clientData;
          }
        }
        
        // Fetch freelancer profile
        if (fallbackData.freelancer_id) {
          const { data: freelancerData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email')
            .eq('id', fallbackData.freelancer_id)
            .maybeSingle();
            
          if (freelancerData) {
            fallbackData.freelancer = freelancerData;
          }
        }
      }
      
      return fallbackData;
    }
    
    console.log(`Retrieved contract ${contractId}:`, data);
    return data;
  } catch (error) {
    console.error('Error in getContractById:', error);
    return null;
  }
}

// Create a new contract
export async function createContract(contractData: {
  job_id: string;
  freelancer_id: string;
  client_id: string;
  rate: number;
  start_date?: string;
  status?: 'active' | 'completed' | 'terminated';
}) {
  console.log("Creating contract with data:", contractData);
  
  try {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        job_id: contractData.job_id,
        freelancer_id: contractData.freelancer_id,
        client_id: contractData.client_id,
        rate: contractData.rate,
        status: contractData.status || 'active',
        start_date: contractData.start_date || new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
    
    console.log('Contract created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createContract:', error);
    throw error;
  }
}

// Update contract status
export async function updateContractStatus(
  contractId: string, 
  status: 'active' | 'completed' | 'terminated'
) {
  console.log(`Updating contract ${contractId} status to ${status}`);
  
  const updates: any = { 
    status, 
    updated_at: new Date().toISOString() 
  };
  
  // Add end date if the contract is being completed or cancelled
  if (status === 'completed' || status === 'terminated') {
    updates.end_date = new Date().toISOString();
  }
  
  try {
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating contract ${contractId} status:`, error);
      throw error;
    }
    
    console.log(`Contract ${contractId} status updated to ${status}:`, data);
    return data;
  } catch (error) {
    console.error('Error in updateContractStatus:', error);
    throw error;
  }
}
