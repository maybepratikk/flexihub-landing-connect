
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { JobApplyForm, ApplicationFormData } from './shared/JobApplyForm';

interface JobDetailApplicationProps {
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onCancel: () => void;
  budgetType: 'fixed' | 'hourly';
  userEmail?: string;
}

export function JobDetailApplication({ onSubmit, onCancel, budgetType, userEmail }: JobDetailApplicationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for this Job</CardTitle>
        <CardDescription>Please complete the application form below.</CardDescription>
      </CardHeader>
      <CardContent>
        <JobApplyForm 
          onSubmit={onSubmit} 
          onCancel={onCancel} 
          budgetType={budgetType}
          defaultEmail={userEmail || ''}
        />
      </CardContent>
    </Card>
  );
}
