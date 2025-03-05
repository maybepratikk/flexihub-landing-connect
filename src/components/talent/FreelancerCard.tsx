
import { Star, Clock, DollarSign } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface FreelancerCardProps {
  freelancer: any;
}

export function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const navigate = useNavigate();
  
  // Get data from the updated structure where freelancer_profile is a nested object
  const profile = freelancer.freelancer_profile || {};
  const name = freelancer.full_name || "Unnamed Freelancer";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
  
  // Get the first 5 skills max
  const skills = profile.skills || [];
  const displaySkills = skills.slice(0, 5);
  const remainingSkills = skills.length > 5 ? skills.length - 5 : 0;
  
  const hourlyRate = profile.hourly_rate || 0;
  const yearsExperience = profile.years_experience || 0;
  const bio = profile.bio || "No bio available";
  const availability = profile.availability || "Not specified";
  
  // Determine experience level text
  let experienceLevel = "Entry Level";
  if (yearsExperience >= 6) {
    experienceLevel = "Expert";
  } else if (yearsExperience >= 3) {
    experienceLevel = "Intermediate";
  }

  const handleViewProfile = () => {
    // This is a placeholder - we'll need to create a freelancer profile page
    console.log("View profile for:", freelancer.id);
    // For now just alert with basic info
    alert(
      `Freelancer: ${name}\nExperience: ${yearsExperience} years\nHourly Rate: $${hourlyRate}\nSkills: ${skills.join(", ")}`
    );
  };

  const handleHire = () => {
    // Navigate to post job page with pre-filled freelancer id
    navigate("/post-job", { state: { freelancerId: freelancer.id } });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={freelancer.avatar_url} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-1 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-semibold text-lg">{name}</h3>
                
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">
                    {(Math.random() * 2 + 3).toFixed(1)} ({Math.floor(Math.random() * 50 + 10)})
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                <Badge variant="secondary" className="font-normal">
                  {experienceLevel}
                </Badge>
                
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>{availability}</span>
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="mr-1 h-3 w-3" />
                  <span>${hourlyRate}/hr</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
            {bio}
          </p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {displaySkills.map((skill: string) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
            {remainingSkills > 0 && (
              <Badge variant="outline">+{remainingSkills} more</Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2 p-4 pt-0 sm:p-6 sm:pt-0">
        <Button variant="outline" onClick={handleViewProfile} className="flex-1">
          View Profile
        </Button>
        <Button onClick={handleHire} className="flex-1">
          Hire
        </Button>
      </CardFooter>
    </Card>
  );
}
