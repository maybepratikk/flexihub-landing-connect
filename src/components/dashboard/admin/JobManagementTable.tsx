
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  client_id: string;
  category: string;
  status: string;
  budget_min?: number;
  budget_max?: number;
  created_at?: string;
}

interface JobManagementTableProps {
  jobs: Job[];
  loading?: boolean;
}

export function JobManagementTable({ jobs, loading = false }: JobManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    {job.title}
                  </TableCell>
                  <TableCell>{job.category}</TableCell>
                  <TableCell>
                    <Badge variant={
                      job.status === 'open' 
                        ? 'default' 
                        : job.status === 'in_progress' 
                          ? 'secondary' 
                          : job.status === 'completed'
                            ? 'outline'
                            : 'destructive'
                    }>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.budget_min && job.budget_max 
                      ? `$${job.budget_min} - $${job.budget_max}` 
                      : job.budget_min 
                        ? `From $${job.budget_min}` 
                        : job.budget_max 
                          ? `Up to $${job.budget_max}` 
                          : 'No budget specified'}
                  </TableCell>
                  <TableCell>{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Unknown'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Job</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Remove Job</DropdownMenuItem>
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
