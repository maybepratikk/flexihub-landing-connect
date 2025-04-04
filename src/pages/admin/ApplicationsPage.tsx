
import { useState, useEffect } from 'react';
import { getAllApplications } from '@/lib/supabase/admin';
import { JobApplication } from '@/lib/supabase/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreVertical, Search, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const loadApplications = async () => {
    setLoading(true);
    try {
      const applicationsData = await getAllApplications();
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    const searchLower = searchQuery.toLowerCase();
    return (
      app.job?.title?.toLowerCase().includes(searchLower) ||
      app.freelancer?.full_name?.toLowerCase().includes(searchLower) ||
      app.status.toLowerCase().includes(searchLower)
    );
  });

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Application status updated to ${status}`,
      });
      
      // Update local state
      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Applications Management</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={loadApplications}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Freelancer</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-muted-foreground mt-2">Loading applications...</p>
                </TableCell>
              </TableRow>
            ) : filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <p className="text-muted-foreground">No applications found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map(app => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {app.job?.title || 'Unknown Job'}
                  </TableCell>
                  <TableCell>{app.freelancer?.full_name || 'Unknown'}</TableCell>
                  <TableCell>${app.proposed_rate || '0'}/hr</TableCell>
                  <TableCell>
                    {app.created_at ? 
                      formatDistanceToNow(new Date(app.created_at), { addSuffix: true }) : 
                      'Unknown'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/jobs/${app.job_id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Job
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateApplicationStatus(app.id, 'accepted')}>
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Accept
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateApplicationStatus(app.id, 'rejected')}>
                          <ThumbsDown className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ApplicationsPage;
