
import { supabase } from '../client';

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
