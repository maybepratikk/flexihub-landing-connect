
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { JobApplyForm, ApplicationFormData } from './shared/JobApplyForm';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface JobDetailApplicationProps {
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onCancel: () => void;
  budgetType: 'fixed' | 'hourly';
  userEmail?: string;
}

export function JobDetailApplication({ onSubmit, onCancel, budgetType, userEmail }: JobDetailApplicationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);
      console.log("JobDetailApplication - submitting form data:", data);
      await onSubmit(data);
      console.log("JobDetailApplication - form submitted successfully");
      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully. You can track its status on your dashboard.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error in JobDetailApplication submit:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
      throw error; // Rethrow the error to be handled by the form
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for this Job</CardTitle>
        <CardDescription>Please complete the application form below.</CardDescription>
      </CardHeader>
      <CardContent>
        <JobApplyForm 
          onSubmit={handleSubmit} 
          onCancel={onCancel} 
          budgetType={budgetType}
          defaultEmail={userEmail || ''}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}
