
import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { getJobs, Job } from '@/lib/supabase';
import { JobCard } from '@/components/jobs/JobCard';
import { JobSidebar } from '@/components/jobs/JobSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Briefcase } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function JobsPage() {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: '',
    experience: '',
  });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Check for URL search params
    const categoryParam = searchParams.get('category') || '';
    const experienceParam = searchParams.get('experience') || '';
    const searchParam = searchParams.get('search') || '';

    if (categoryParam || experienceParam || searchParam) {
      setFilters({
        category: categoryParam,
        experience: experienceParam,
      });
      setSearchQuery(searchParam);
    }

    const fetchJobs = async () => {
      setLoading(true);
      // Only pass filters if they have values
      const filterParams: any = {};
      if (categoryParam) filterParams.category = categoryParam;
      if (experienceParam) filterParams.experience_level = experienceParam;
      if (searchParam) filterParams.search = searchParam;

      const fetchedJobs = await getJobs(Object.keys(filterParams).length > 0 ? filterParams : undefined);
      setJobs(fetchedJobs);
      setFilteredJobs(fetchedJobs);
      setLoading(false);
    };

    fetchJobs();
  }, [user, searchParams]);

  useEffect(() => {
    // Apply client-side filtering when searchQuery changes
    if (searchQuery.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = jobs.filter(
        job =>
          job.title.toLowerCase().includes(lowercaseQuery) ||
          job.description.toLowerCase().includes(lowercaseQuery) ||
          job.skills_required.some(skill => skill.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredJobs(filtered);
    }
  }, [searchQuery, jobs]);

  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery) {
      newParams.set('search', searchQuery);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ category: '', experience: '' });
    setSearchQuery('');
    setSearchParams({});
  };

  const handleJobCardClick = (job: Job) => {
    setSelectedJobId(job.id);
  };

  const handleCloseSidebar = () => {
    setSelectedJobId(null);
  };

  // Categories for filter dropdown
  const categories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Admin Support',
    'Customer Service',
    'Sales',
    'Accounting',
    'Legal',
    'Other'
  ];

  // Experience levels for filter dropdown
  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' }
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">Find Jobs</h1>
      <p className="text-muted-foreground mb-8">
        Browse through available jobs and find your next opportunity
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select 
                  value={filters.experience} 
                  onValueChange={(value) => handleFilterChange('experience', value)}
                >
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {experienceLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-4" />

              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className={`md:col-span-${selectedJobId ? '2' : '3'}`}>
          <div className="mb-6 flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, description, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">No jobs found</h2>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.map(job => (
                <JobCard key={job.id} job={job} onClick={handleJobCardClick} />
              ))}
            </div>
          )}
        </div>

        {selectedJobId && (
          <div className="md:col-span-1 relative">
            <div className="sticky top-4 border rounded-lg shadow-sm bg-background h-[calc(100vh-120px)] overflow-hidden">
              <JobSidebar jobId={selectedJobId} onClose={handleCloseSidebar} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
