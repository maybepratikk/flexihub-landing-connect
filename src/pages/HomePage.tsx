
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getJobs, Job } from '@/lib/supabase';
import { Loader2, Search, Filter, Briefcase, ChevronRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Job categories
const jobCategories = [
  "All Categories",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Data Science",
  "DevOps",
  "Project Management",
  "Customer Support",
  "Other"
];

const HomePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        // Prepare filters
        const filters: any = {};
        
        if (searchQuery) {
          filters.search = searchQuery;
        }
        
        if (category && category !== 'All Categories') {
          filters.category = category;
        }
        
        if (experienceLevel) {
          filters.experience_level = experienceLevel;
        }
        
        const jobsData = await getJobs(filters);
        setJobs(jobsData);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, [searchQuery, category, experienceLevel]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will trigger the search
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setCategory('All Categories');
    setExperienceLevel('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Find Perfect Freelance Jobs & Talent
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Connect with top freelancers and clients for your next project
            </p>
            
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search for jobs..."
                  className="pl-9 bg-white dark:bg-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        {showFilters && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Filter Jobs</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear Filters</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Experience Level</label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Level</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Latest Jobs
              </h2>
              {user && user.user_metadata?.user_type === 'client' && (
                <Button asChild>
                  <Link to="/post-job">
                    Post a Job
                  </Link>
                </Button>
              )}
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search filters or check back later for new opportunities
                  </p>
                  {user && user.user_metadata?.user_type === 'client' && (
                    <Button asChild className="mt-4">
                      <Link to="/post-job">
                        Post a Job
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            <Link to={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                              {job.title}
                            </Link>
                          </CardTitle>
                          <CardDescription>
                            Posted by {job.profiles.full_name} • {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : ''}
                          </CardDescription>
                        </div>
                        <Badge variant={job.budget_type === 'fixed' ? 'secondary' : 'outline'}>
                          {job.budget_type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-sm text-muted-foreground mb-4">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{job.category}</Badge>
                        {job.skills_required && job.skills_required.slice(0, 3).map((skill: string, index: number) => (
                          <Badge variant="outline" key={index}>{skill}</Badge>
                        ))}
                        {job.skills_required && job.skills_required.length > 3 && (
                          <Badge variant="outline">+{job.skills_required.length - 3} more</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap justify-between items-center text-sm">
                        <div>
                          <span className="font-semibold">Budget:</span>{' '}
                          ${job.budget_min} - ${job.budget_max} {job.budget_type === 'hourly' && '/hr'}
                        </div>
                        <div>
                          {job.experience_level && (
                            <span className="text-muted-foreground">
                              {job.experience_level === 'entry' ? 'Entry Level' : 
                               job.experience_level === 'intermediate' ? 'Intermediate' : 'Expert'}
                            </span>
                          )}
                          {job.duration && (
                            <span className="ml-2 text-muted-foreground">
                              • {job.duration === 'short' ? 'Short Term' : 
                                 job.duration === 'medium' ? 'Medium Term' : 'Long Term'}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Posted {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : ''}</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/jobs/${job.id}`}>
                          View Job <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
