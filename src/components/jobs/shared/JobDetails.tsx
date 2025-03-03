
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { Job } from '@/lib/supabase';

interface JobDetailsProps {
  job: Job;
  compact?: boolean;
}

export function JobDetails({ job, compact = false }: JobDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className={`font-semibold mb-2 ${compact ? 'text-sm' : ''}`}>Description</h3>
        <p className={`whitespace-pre-line ${compact ? 'text-sm' : ''}`}>{job.description}</p>
      </div>

      <div>
        <h3 className={`font-semibold mb-2 ${compact ? 'text-sm' : ''}`}>Skills Required</h3>
        <div className="flex flex-wrap gap-2">
          {job.skills_required.map((skill, index) => (
            <Badge key={index} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      <div className={`grid ${compact ? 'grid-cols-2' : 'md:grid-cols-2'} gap-4`}>
        <div>
          <h3 className={`font-semibold mb-1 ${compact ? 'text-sm' : ''}`}>Budget</h3>
          <p className={compact ? 'text-sm' : ''}>
            ${job.budget_min} - ${job.budget_max} {job.budget_type === 'hourly' && '/hr'}
          </p>
        </div>
        <div>
          <h3 className={`font-semibold mb-1 ${compact ? 'text-sm' : ''}`}>Duration</h3>
          <p className={compact ? 'text-sm' : ''}>
            {job.duration ? job.duration.charAt(0).toUpperCase() + job.duration.slice(1) + ' term' : 'Not specified'}
          </p>
        </div>
        <div>
          <h3 className={`font-semibold mb-1 ${compact ? 'text-sm' : ''}`}>Experience Level</h3>
          <p className={compact ? 'text-sm' : ''}>
            {job.experience_level ? job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1) : 'Not specified'}
          </p>
        </div>
        <div>
          <h3 className={`font-semibold mb-1 ${compact ? 'text-sm' : ''}`}>Category</h3>
          <p className={compact ? 'text-sm' : ''}>{job.category}</p>
        </div>
      </div>
      
      {job.profiles && (
        <div>
          <h3 className={`font-semibold mb-2 ${compact ? 'text-sm' : ''}`}>Posted by</h3>
          <div className="flex items-center gap-2">
            <Avatar className={compact ? "h-8 w-8" : ""}>
              <AvatarImage src={job.profiles.avatar_url || ''} />
              <AvatarFallback>{job.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <span className={compact ? 'text-sm' : ''}>
              {job.profiles.full_name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
