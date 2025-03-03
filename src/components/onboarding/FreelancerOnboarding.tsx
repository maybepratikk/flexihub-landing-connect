
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Briefcase, DollarSign, BookOpen, Calendar, PenTool, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Input for handling array values (like skills)
const TagInput = ({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string[]; 
  onChange: (value: string[]) => void; 
  placeholder: string;
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <div 
            key={index} 
            className="bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center text-sm"
          >
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(index)} 
              className="ml-2 text-primary hover:text-primary/70"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Press Enter to add
      </p>
    </div>
  );
};

export function FreelancerOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for form fields
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');
  const [education, setEducation] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete onboarding",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert freelancer profile data
      const { error } = await supabase
        .from('freelancer_profiles')
        .insert({
          id: user.id,
          bio,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          skills,
          years_experience: yearsExperience ? parseInt(yearsExperience) : null,
          education,
          portfolio_links: portfolioLinks,
          availability,
        });
        
      if (error) throw error;
      
      toast({
        title: "Profile completed!",
        description: "Your freelancer profile has been created successfully.",
      });
      
      // Redirect to dashboard after successful onboarding
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error in freelancer onboarding:', error);
      toast({
        title: "Error creating profile",
        description: error.message || "Failed to create freelancer profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Complete Your Freelancer Profile</CardTitle>
        <CardDescription>
          Provide details about your skills and experience to start finding work
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <Textarea
                id="bio"
                placeholder="Write a short professional summary"
                className="pl-10 min-h-[100px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="30.00"
                  className="pl-10"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  placeholder="5"
                  className="pl-10"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <TagInput
              value={skills}
              onChange={setSkills}
              placeholder="Add skills (e.g. React, UI/UX, JavaScript)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <PenTool className="h-5 w-5" />
              </div>
              <Input
                id="education"
                placeholder="E.g. Bachelor's in Computer Science"
                className="pl-10"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portfolioLinks">Portfolio Links</Label>
            <TagInput
              value={portfolioLinks}
              onChange={setPortfolioLinks}
              placeholder="Add portfolio or project links"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Calendar className="h-5 w-5" />
              </div>
              <Input
                id="availability"
                placeholder="E.g. Full-time, weekdays only, 20hrs/week"
                className="pl-10"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className={cn("w-full mt-6", isSubmitting ? "opacity-70" : "")}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>Complete Profile</>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        You can update this information later from your profile settings
      </CardFooter>
    </Card>
  );
}
