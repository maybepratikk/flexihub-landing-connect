
import { supabase } from '../client';
import { Payment } from '../types';

// Create a payment for a contract
export async function createPayment(payment: {
  contract_id: string;
  client_id: string;
  freelancer_id: string;
  amount: number;
}): Promise<Payment | null> {
  console.log("Creating payment for contract:", payment.contract_id);
  
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        contract_id: payment.contract_id,
        client_id: payment.client_id,
        freelancer_id: payment.freelancer_id,
        amount: payment.amount,
        status: 'pending' // Initial status
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
    
    console.log('Payment created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createPayment:', error);
    throw error;
  }
}
