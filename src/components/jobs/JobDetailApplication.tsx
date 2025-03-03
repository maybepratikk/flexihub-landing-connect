
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { JobApplyForm, ApplicationFormData } from './shared/JobApplyForm';
import { useState } from 'react';

interface JobDetailApplicationProps {
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onCancel: () => void;
  budgetType: 'fixed' | 'hourly';
  userEmail?: string;
}

export function JobDetailApplication({ onSubmit, onCancel, budgetType, userEmail }: JobDetailApplicationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);
      console.log("JobDetailApplication - submitting form data:", data);
      await onSubmit(data);
    } catch (error) {
      console.error("Error in JobDetailApplication submit:", error);
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
        />
      </CardContent>
    </Card>
  );
}
