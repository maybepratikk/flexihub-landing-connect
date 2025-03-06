
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Contract, createPayment } from '@/lib/supabase';

interface PaymentFormProps {
  contract: Contract;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ 
  contract, 
  onPaymentSuccess, 
  onCancel 
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // This is a placeholder for a real payment integration
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // This would integrate with a real payment provider in production
      // For now, we're just creating a payment record
      const payment = await createPayment({
        contract_id: contract.id,
        client_id: contract.client_id,
        freelancer_id: contract.freelancer_id,
        amount: contract.rate
      });
      
      if (payment) {
        toast({
          title: "Payment Initiated",
          description: "Your payment is being processed.",
          variant: "default",
        });
        onPaymentSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Complete payment for the accepted project submission
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Project Details</h3>
              <p className="text-sm">
                <span className="font-medium">Project:</span> {contract.jobs?.title || 'Project'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Freelancer:</span> {contract.freelancer?.full_name || 'Freelancer'}
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-2">Payment Amount</h3>
              <p className="text-xl font-bold">${contract.rate}</p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-2">Payment Method</h3>
              
              {/* This would be replaced with a real payment form */}
              <div className="space-y-2">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                    Card Number
                  </label>
                  <Input 
                    id="cardNumber" 
                    placeholder="1234 5678 9012 3456" 
                    className="w-full" 
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium mb-1">
                      Expiry Date
                    </label>
                    <Input 
                      id="expiry" 
                      placeholder="MM/YY" 
                      className="w-full" 
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium mb-1">
                      CVC
                    </label>
                    <Input 
                      id="cvc" 
                      placeholder="123" 
                      className="w-full" 
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Submit Payment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
