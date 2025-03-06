
import { supabase } from './client';
import { createContract } from './contracts';

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

// Update project inquiry status (accept/reject) and create contract if accepted
export async function updateInquiryStatus(inquiryId: string, status: 'accepted' | 'rejected') {
  try {
    console.log(`Updating inquiry ${inquiryId} status to ${status}`);
    
    // First, get the full inquiry details with profiles
    const { data: inquiryDetails, error: inquiryError } = await supabase
      .from('project_inquiries_with_profiles')
      .select('*')
      .eq('id', inquiryId)
      .single();
    
    if (inquiryError) {
      console.error('Error fetching inquiry details:', inquiryError);
      return null;
    }
    
    console.log("Retrieved inquiry details:", inquiryDetails);
    
    // Update the inquiry status
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
    
    // If inquiry was accepted, create a contract
    if (status === 'accepted' && inquiryDetails) {
      console.log('Inquiry accepted, creating contract');
      
      // Default hourly rate if not specified
      const defaultRate = 25;
      
      try {
        // Create a new contract with proper error handling
        const contractData = {
          freelancer_id: inquiryDetails.freelancer_id,
          client_id: inquiryDetails.client_id,
          rate: defaultRate,
          status: 'active' as const,
          // We'll create a dummy/virtual job for this inquiry
          job_id: null
        };
        
        const newContract = await createContract(contractData);
        console.log('Contract created from inquiry:', newContract);
        
        if (!newContract) {
          console.error('Failed to create contract from inquiry');
          return data;
        }
        
        // Create an initial message in the chat
        if (newContract.id) {
          try {
            // Send welcome message to start the conversation
            const welcomeMessage = `Hello! Let's discuss the project: ${inquiryDetails.project_description}`;
            
            const { data: messageData, error: messageError } = await supabase
              .from('chat_messages')
              .insert({
                contract_id: newContract.id,
                sender_id: inquiryDetails.client_id, // Message is from the client
                message: welcomeMessage,
                read: false
              })
              .select()
              .maybeSingle();
              
            if (messageError) {
              console.error('Error creating initial chat message:', messageError);
            } else {
              console.log('Initial chat message created:', messageData);
            }
          } catch (chatErr) {
            console.error('Exception creating initial chat message:', chatErr);
          }
        }
        
        // Return both the updated inquiry and the new contract
        return {
          ...data,
          contract: newContract
        };
      } catch (contractErr) {
        console.error('Exception creating contract from inquiry:', contractErr);
        return data;
      }
    }
    
    return data;
  } catch (err) {
    console.error('Exception in updateInquiryStatus:', err);
    return null;
  }
}
