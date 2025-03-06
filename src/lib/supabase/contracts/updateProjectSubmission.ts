
import { supabase } from '../client';
import { updateJobStatus } from '../jobs/updateJobStatus';
import { updateContractStatus } from './updateContractStatus';
import { ProjectSubmission } from '../types';

// Update a project submission status
export async function updateProjectSubmission(
  submissionId: string,
  status: 'pending' | 'accepted' | 'rejected',
  feedback?: string
): Promise<ProjectSubmission | null> {
  console.log(`Updating project submission ${submissionId} status to ${status}`);
  
  try {
    // First, get the submission to get the contract ID
    const { data: submission, error: getError } = await supabase
      .from('project_submissions')
      .select('*, contracts(*)')
      .eq('id', submissionId)
      .single();
    
    if (getError) {
      console.error('Error fetching submission details:', getError);
      throw getError;
    }
    
    // Update the submission status
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (feedback) {
      updates.feedback = feedback;
    }
    
    const { data, error } = await supabase
      .from('project_submissions')
      .update(updates)
      .eq('id', submissionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project submission:', error);
      throw error;
    }
    
    // If accepted, update the contract and job status
    if (status === 'accepted') {
      console.log('Project accepted, updating contract and job status');
      
      // Update contract status to completed
      const contractId = submission.contract_id;
      await updateContractStatus(contractId, 'completed');
      
      // Update job status to completed
      const jobId = submission.contracts.job_id;
      await updateJobStatus(jobId, 'completed');
      
      console.log(`Contract ${contractId} and associated job marked as completed`);
    }
    
    // If rejected, revert contract status to active
    if (status === 'rejected') {
      console.log('Project rejected, reverting contract status to active');
      
      // Update contract status back to active
      const contractId = submission.contract_id;
      await updateContractStatus(contractId, 'active');
      
      console.log(`Contract ${contractId} reverted to active status`);
    }
    
    console.log('Project submission updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateProjectSubmission:', error);
    throw error;
  }
}
