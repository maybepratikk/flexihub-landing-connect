
import { Job } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onClick(job)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{job.title}</CardTitle>
          <Badge variant={job.budget_type === 'fixed' ? 'outline' : 'default'}>
            {job.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          {job.created_at && formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {truncateDescription(job.description)}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills_required.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills_required.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{job.skills_required.length - 4} more
            </Badge>
          )}
        </div>
        <div className="flex justify-between text-sm">
          <span>
            Budget: ${job.budget_min} - ${job.budget_max}
            {job.budget_type === 'hourly' && '/hr'}
          </span>
          {job.experience_level && (
            <span>
              {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)} level
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-end">
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation();
          onClick(job);
        }}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
