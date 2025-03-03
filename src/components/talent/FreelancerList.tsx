
import { useEffect, useState } from "react";
import { getFreelancers } from "@/lib/supabase";
import { FreelancerCard } from "./FreelancerCard";
import { FreelancerLoadingState } from "@/components/dashboard/freelancer/FreelancerLoadingState";
import { FreelancerEmptyState } from "@/components/dashboard/freelancer/FreelancerEmptyState";

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

  useEffect(() => {
    async function fetchFreelancers() {
      setLoading(true);
      try {
        const data = await getFreelancers(filters);
        setFreelancers(data);
      } catch (error) {
        console.error("Error fetching freelancers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFreelancers();
  }, [filters]);

  // Group freelancers by experience level
  const groupedFreelancers = {
    expert: freelancers.filter(f => 
      (f.freelancer_profiles?.years_experience || 0) >= 6
    ),
    intermediate: freelancers.filter(f => 
      (f.freelancer_profiles?.years_experience || 0) >= 3 && 
      (f.freelancer_profiles?.years_experience || 0) < 6
    ),
    entry: freelancers.filter(f => 
      (f.freelancer_profiles?.years_experience || 0) < 3
    ),
  };

  if (loading) {
    return <FreelancerLoadingState />;
  }

  if (freelancers.length === 0) {
    return (
      <FreelancerEmptyState 
        title="No freelancers found" 
        description="Try adjusting your filters or search criteria" 
      />
    );
  }

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
          <FreelancerEmptyState 
            title={`No ${filters.experience} level freelancers found`} 
            description="Try adjusting your filters" 
          />
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
