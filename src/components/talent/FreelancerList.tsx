
import { useEffect, useState } from "react";
import { getFreelancers } from "@/lib/supabase/freelancerProfiles";
import { FreelancerCard } from "./FreelancerCard";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockFreelancers } from "@/lib/mock/freelancers";
import { toast } from "@/hooks/use-toast";

interface FreelancerListProps {
  filters: {
    skills: string[];
    experience?: 'entry' | 'intermediate' | 'expert';
    hourlyRate: { min?: number; max?: number };
    availability?: string;
    search: string;
  };
}

export function FreelancerList({ filters }: FreelancerListProps) {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    async function fetchFreelancers() {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching freelancers with filters:", filters);
        const data = await getFreelancers(filters);
        console.log("Fetched freelancers:", data);
        
        if (data && data.length > 0) {
          setFreelancers(data);
        } else {
          console.log("No freelancers found in database, using mock data");
          toast({
            title: "Using demo data",
            description: "No freelancers found in database, displaying demo data instead",
            duration: 5000,
          });
          setFreelancers(mockFreelancers);
          setUseMockData(true);
        }
      } catch (error: any) {
        console.error("Error fetching freelancers:", error);
        setError("Failed to load freelancers from database, using mock data");
        setFreelancers(mockFreelancers);
        setUseMockData(true);
      } finally {
        setLoading(false);
      }
    }

    fetchFreelancers();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading freelancers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant={useMockData ? "default" : "destructive"} className="my-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (freelancers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-xl font-semibold mb-2">No freelancers found</h3>
        <p className="text-muted-foreground text-center">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  // Group freelancers by experience level
  const groupedFreelancers = {
    expert: freelancers.filter(f => 
      (f.freelancer_profile?.years_experience || 0) >= 6
    ),
    intermediate: freelancers.filter(f => {
      const years = f.freelancer_profile?.years_experience || 0;
      return years >= 3 && years < 6;
    }),
    entry: freelancers.filter(f => 
      (f.freelancer_profile?.years_experience || 0) < 3
    ),
  };

  // If experience filter is active, only show that category
  if (filters.experience) {
    return (
      <div className="space-y-4">
        {groupedFreelancers[filters.experience].length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedFreelancers[filters.experience].map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-semibold mb-2">
              No {filters.experience} level freelancers found
            </h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    );
  }

  // Show all categories
  return (
    <div className="space-y-8">
      {/* Expert Freelancers */}
      {groupedFreelancers.expert.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Expert Freelancers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedFreelancers.expert.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        </div>
      )}

      {/* Intermediate Freelancers */}
      {groupedFreelancers.intermediate.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Intermediate Freelancers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedFreelancers.intermediate.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        </div>
      )}

      {/* Entry Level Freelancers */}
      {groupedFreelancers.entry.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Entry Level Freelancers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedFreelancers.entry.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
