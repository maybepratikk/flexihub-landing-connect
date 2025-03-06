
import { supabase } from '../client';
import { ProjectSubmission } from '../types';

// Submit a project for a contract
export async function submitProject(submission: {
  contract_id: string;
  freelancer_id: string;
  client_id: string;
  submission_notes?: string;
  submission_files?: string[];
}): Promise<ProjectSubmission | null> {
  console.log("Submitting project for contract:", submission.contract_id);
  
  try {
    // First update the contract status to submitted
    const { error: contractError } = await supabase
      .from('contracts')
      .update({ 
        status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', submission.contract_id);
    
    if (contractError) {
      console.error('Error updating contract status:', contractError);
      throw contractError;
    }
    
    // Then create a project submission record
    const { data, error } = await supabase
      .from('project_submissions')
      .insert({
        contract_id: submission.contract_id,
        freelancer_id: submission.freelancer_id,
        client_id: submission.client_id,
        submission_notes: submission.submission_notes,
        submission_files: submission.submission_files,
        status: 'pending',
        submission_date: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error submitting project:', error);
      throw error;
    }
    
    console.log('Project submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in submitProject:', error);
    throw error;
  }
}
