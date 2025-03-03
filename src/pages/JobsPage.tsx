
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { JobCard } from '@/components/jobs/JobCard';
import { JobSidebar } from '@/components/jobs/JobSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getJobs, Job } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Filter, Briefcase, Loader2 } from 'lucide-react';

const categories = [
  { value: 'web_development', label: 'Web Development' },
  { value: 'mobile_development', label: 'Mobile Development' },
  { value: 'ui_ux_design', label: 'UI/UX Design' },
  { value: 'graphic_design', label: 'Graphic Design' },
  { value: 'content_writing', label: 'Content Writing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'other', label: 'Other' }
];

const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];

export function JobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    loadJobs();
  }, [categoryFilter, levelFilter]);
  
  const loadJobs = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      
      if (categoryFilter) {
        filters.category = categoryFilter;
      }
      
      if (levelFilter) {
        filters.experience_level = levelFilter;
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      console.log("Fetching jobs with filters:", filters);
      const jobsData = await getJobs(filters);
      console.log("Jobs fetched:", jobsData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load jobs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };
  
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setSidebarOpen(true);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  const clearFilters = () => {
    setCategoryFilter('');
    setLevelFilter('');
    setSearchQuery('');
    loadJobs();
  };
  
  const isClient = user && user.user_metadata?.user_type === 'client';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Find Jobs</h1>
            <p className="text-muted-foreground">
              Browse available opportunities that match your skills
            </p>
          </div>
          
          {isClient && (
            <Button onClick={() => navigate('/post-job')}>
              <Plus className="mr-2 h-4 w-4" /> Post a New Job
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </form>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Category
                  </label>
                  <Select 
                    value={categoryFilter} 
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Experience Level
                  </label>
                  <Select 
                    value={levelFilter} 
                    onValueChange={setLevelFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find more opportunities
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onClick={handleJobClick}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <div className="bg-card p-4 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <Badge
                      key={category.value}
                      variant={categoryFilter === category.value ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setCategoryFilter(
                        categoryFilter === category.value ? '' : category.value
                      )}
                    >
                      {category.label}
                    </Badge>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="text-lg font-semibold mb-2">Experience Level</h3>
                <div className="flex flex-wrap gap-2">
                  {experienceLevels.map((level) => (
                    <Badge
                      key={level.value}
                      variant={levelFilter === level.value ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setLevelFilter(
                        levelFilter === level.value ? '' : level.value
                      )}
                    >
                      {level.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <JobSidebar
        job={selectedJob}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />
    </div>
  );
}
