
import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface TalentFiltersProps {
  filters: {
    skills: string[];
    experience?: 'entry' | 'intermediate' | 'expert';
    hourlyRate: { min?: number; max?: number };
    availability?: string;
    search: string;
  };
  onFilterChange: (filters: Partial<TalentFiltersProps['filters']>) => void;
}

const skillsOptions = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python", 
  "UI/UX Design", "Graphic Design", "Content Writing", "SEO", 
  "Data Analysis", "Marketing", "Social Media"
];

const availabilityOptions = [
  "Full-time", "Part-time", "Contract", "Hourly"
];

export function TalentFilters({ filters, onFilterChange }: TalentFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.hourlyRate?.min || 0, 
    filters.hourlyRate?.max || 100
  ]);

  useEffect(() => {
    onFilterChange({ 
      hourlyRate: { 
        min: priceRange[0], 
        max: priceRange[1] 
      } 
    });
  }, [priceRange]);

  const handleAddSkill = () => {
    if (skillInput && !filters.skills.includes(skillInput)) {
      onFilterChange({ 
        skills: [...filters.skills, skillInput] 
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    onFilterChange({ 
      skills: filters.skills.filter(s => s !== skill) 
    });
  };

  const handleReset = () => {
    onFilterChange({
      skills: [],
      experience: undefined,
      hourlyRate: { min: 0, max: 100 },
      availability: undefined
    });
    setPriceRange([0, 100]);
  };

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <Button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          variant="outline" 
          className="w-full"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filters Card */}
      <Card className={`sticky top-4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            <Button onClick={handleReset} variant="ghost" size="sm">
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Experience Level */}
          <div className="space-y-2">
            <h3 className="font-medium">Experience Level</h3>
            <RadioGroup 
              value={filters.experience || ""} 
              onValueChange={(value) => 
                onFilterChange({ experience: value as any || undefined })
              }
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="entry" id="entry" />
                <Label htmlFor="entry">Entry Level (0-2 years)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate">Intermediate (3-5 years)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expert" id="expert" />
                <Label htmlFor="expert">Expert (6+ years)</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Hourly Rate */}
          <div className="space-y-4">
            <h3 className="font-medium">Hourly Rate</h3>
            <Slider
              value={priceRange}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="mt-2"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm">${priceRange[0]}</p>
              <p className="text-sm">${priceRange[1]}+</p>
            </div>
          </div>
          
          <Separator />
          
          {/* Availability */}
          <div className="space-y-2">
            <h3 className="font-medium">Availability</h3>
            <RadioGroup 
              value={filters.availability || ""} 
              onValueChange={(value) => 
                onFilterChange({ availability: value || undefined })
              }
              className="flex flex-col space-y-1"
            >
              {availabilityOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <Separator />
          
          {/* Skills */}
          <div className="space-y-3">
            <h3 className="font-medium">Skills</h3>
            
            {/* Add custom skill */}
            <div className="flex space-x-2">
              <Input
                placeholder="Add skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button onClick={handleAddSkill} type="button" variant="secondary">
                Add
              </Button>
            </div>
            
            {/* Popular skills suggestions */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Popular skills</p>
              <div className="flex flex-wrap gap-2">
                {skillsOptions.map((skill) => (
                  <Badge
                    key={skill}
                    variant={filters.skills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (filters.skills.includes(skill)) {
                        handleRemoveSkill(skill);
                      } else {
                        onFilterChange({ skills: [...filters.skills, skill] });
                      }
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Selected skills */}
            {filters.skills.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Selected skills</p>
                <div className="flex flex-wrap gap-2">
                  {filters.skills.map((skill) => (
                    <Badge key={skill} className="flex items-center gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
