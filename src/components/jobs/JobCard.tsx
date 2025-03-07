
import { Job } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
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
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col w-full" 
      onClick={() => onClick(job)}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <CardTitle className="text-xl md:text-2xl break-words">{job.title}</CardTitle>
          <Badge variant={job.budget_type === 'fixed' ? 'outline' : 'default'} className="whitespace-nowrap">
            {job.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">
            {job.created_at && formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4 line-clamp-3">
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
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-2">
          <span className="whitespace-nowrap">
            Budget: ${job.budget_min} - ${job.budget_max}
            {job.budget_type === 'hourly' && '/hr'}
          </span>
          {job.experience_level && (
            <span className="whitespace-nowrap">
              {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)} level
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t mt-auto justify-end">
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
