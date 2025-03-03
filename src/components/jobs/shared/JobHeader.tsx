
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Job } from '@/lib/supabase';

interface JobHeaderProps {
  job: Job;
  compact?: boolean;
}

export function JobHeader({ job, compact = false }: JobHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className={compact ? "text-xl font-bold truncate" : "text-2xl font-bold"}>
          {job.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          Posted {job.created_at && formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </p>
      </div>
      <Badge variant={job.budget_type === 'fixed' ? 'outline' : 'default'}>
        {job.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}
      </Badge>
    </div>
  );
}
