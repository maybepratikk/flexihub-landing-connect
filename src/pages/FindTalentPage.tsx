
import { useState } from "react";
import { Helmet } from "react-helmet";
import { FreelancerList } from "@/components/talent/FreelancerList";
import { TalentFilters } from "@/components/talent/TalentFilters";
import { TalentSearch } from "@/components/talent/TalentSearch";

export default function FindTalentPage() {
  const [filters, setFilters] = useState({
    skills: [] as string[],
    experience: undefined as 'entry' | 'intermediate' | 'expert' | undefined,
    hourlyRate: { min: undefined, max: undefined } as { min?: number; max?: number },
    availability: undefined as string | undefined,
    search: '' as string
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  return (
    <>
      <Helmet>
        <title>Find Talent | Freelance Platform</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Find Talent</h1>
              <p className="text-muted-foreground mt-1">
                Discover skilled freelancers for your next project
              </p>
            </div>
            <TalentSearch onSearch={handleSearch} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <TalentFilters 
                filters={filters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
            <div className="lg:col-span-3">
              <FreelancerList filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
