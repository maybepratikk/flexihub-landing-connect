
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/userProfiles';
import { FreelancerProfile } from '@/lib/supabase/types';

// Define the form schema
const profileFormSchema = z.object({
  hourly_rate: z.coerce.number().min(1, { message: "Hourly rate must be at least 1" }),
  years_experience: z.coerce.number().min(0, { message: "Years of experience must be a positive number" }),
  title: z.string().min(1, { message: "Title is required" }),
  bio: z.string().min(10, { message: "Bio should be at least 10 characters" }),
  skills: z.array(z.string()).min(1, { message: "At least one skill is required" }),
  availability: z.string().min(1, { message: "Availability is required" }),
  portfolio_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
  education: z.string().optional(),
});

// Define the form values type
type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function FreelancerProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [skillsInput, setSkillsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Initialize form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      hourly_rate: 0,
      years_experience: 0,
      title: '',
      bio: '',
      skills: [],
      availability: '',
      portfolio_url: '',
      education: '',
    },
  });

  // Fetch user profile data
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return;

      setLoading(true);
      try {
        console.log("Fetching freelancer profile for user:", user.id);
        const data = await getUserProfile(user.id);
        console.log("Fetched profile data:", data);
        
        setProfileData(data);

        if (data?.freelancer_profile) {
          const freelancerData = data.freelancer_profile;
          
          // Convert skills string to array if needed
          let skills: string[] = [];
          if (Array.isArray(freelancerData.skills)) {
            skills = freelancerData.skills;
          } else if (freelancerData.skills) {
            skills = [freelancerData.skills];
          }
          
          form.reset({
            hourly_rate: freelancerData.hourly_rate || 0,
            years_experience: freelancerData.years_experience || 0,
            title: freelancerData.title || '',
            bio: freelancerData.bio || '',
            skills: skills,
            availability: freelancerData.availability || '',
            portfolio_url: freelancerData.portfolio_url || '',
            education: freelancerData.education || '',
          });
        } else if (!data) {
          // If no profile data, navigate to onboarding
          console.log("No profile data found, navigating to onboarding");
          navigate('/onboarding');
          return;
        }
      } catch (error) {
        console.error("Error fetching freelancer profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [user, form, toast, navigate]);

  const handleAddSkill = () => {
    if (!skillsInput.trim()) return;
    
    const currentSkills = form.getValues().skills || [];
    if (!currentSkills.includes(skillsInput)) {
      form.setValue('skills', [...currentSkills, skillsInput]);
    }
    setSkillsInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    const currentSkills = form.getValues().skills;
    form.setValue('skills', currentSkills.filter(s => s !== skill));
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setSubmitting(true);
    try {
      console.log("Updating freelancer profile with values:", values);
      
      const freelancerProfile: FreelancerProfile = {
        hourly_rate: values.hourly_rate,
        years_experience: values.years_experience,
        title: values.title,
        bio: values.bio,
        skills: values.skills,
        availability: values.availability,
        portfolio_url: values.portfolio_url || null,
        education: values.education || null,
      };
      
      const updatedProfile = await updateUserProfile(user.id, {
        freelancer_profile: freelancerProfile
      });
      
      if (updatedProfile) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProfileLayout 
        heading="Freelancer Profile" 
        description="Manage your professional profile information"
      >
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout 
      heading="Freelancer Profile" 
      description="Manage your professional profile information"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Senior Web Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hourly_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="years_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Evenings & Weekends">Evenings & Weekends</SelectItem>
                      <SelectItem value="Less than 10 hours">Less than 10 hours</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell clients about your experience, skills, and expertise" 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Skills</FormLabel>
            <div className="flex gap-2 mb-2">
              <Input 
                placeholder="Add a skill (e.g. React, Node.js)" 
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <Button type="button" onClick={handleAddSkill}>Add</Button>
            </div>
            
            {form.formState.errors.skills && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.skills.message}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch('skills').map((skill, index) => (
                <div 
                  key={index} 
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center text-sm"
                >
                  {skill}
                  <button 
                    type="button" 
                    className="ml-2 text-primary hover:text-primary/80"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {form.watch('skills').length === 0 && (
                <p className="text-sm text-muted-foreground">No skills added yet</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="portfolio_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://portfolio.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <FormControl>
                    <Input placeholder="University or relevant courses" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </ProfileLayout>
  );
}
