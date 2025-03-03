
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function FreelancerEmptyState() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-xl font-semibold">Profile Not Found</h2>
      <p className="text-muted-foreground">
        Please complete your onboarding to access the dashboard.
      </p>
      <Button onClick={() => navigate('/onboarding')}>
        Complete Onboarding
      </Button>
    </div>
  );
}
