
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { JobHeader } from './shared/JobHeader';
import { Job } from '@/lib/supabase';

interface JobDetailHeaderProps {
  job: Job;
}

export function JobDetailHeader({ job }: JobDetailHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <>
      <Button variant="outline" onClick={() => navigate('/jobs')} className="mb-6">
        Back to Jobs
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <JobHeader job={job} />
        </CardHeader>
      </Card>
    </>
  );
}
