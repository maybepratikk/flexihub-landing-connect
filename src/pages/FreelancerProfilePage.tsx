
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/supabase/userProfiles';
import { getFreelancerProfile, updateFreelancerProfile } from '@/lib/supabase/freelancerProfiles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Separator } from '@/components/ui/separator';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  full_name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  bio: z.string().min(10, {
    message: "Bio must be at least 10 characters.",
  }).max(500, {
    message: "Bio must not exceed 500 characters."
  }),
  hourly_rate: z.coerce.number().min(1, {
    message: "Hourly rate must be at least $1.",
  }),
  years_experience: z.coerce.number().min(0, {
    message: "Experience must be a positive number.",
  }),
  education: z.string().optional(),
  skills: z.string().transform(val => val.split(',').map(skill => skill.trim())),
  portfolio_links: z.string()
    .transform(val => val ? val.split(',').map(link => link.trim()) : [])
    .optional(),
  availability: z.string().optional(),
});

export default function FreelancerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      bio: '',
      hourly_rate: 0,
      years_experience: 0,
      education: '',
      skills: '',
      portfolio_links: '',
      availability: '',
    },
  });
  
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) {
        navigate('/signin');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch user profile
        const userProfileData = await getUserProfile(user.id);
        setUserProfile(userProfileData);
        
        // Fetch freelancer profile
        const freelancerProfileData = await getFreelancerProfile(user.id);
        setFreelancerProfile(freelancerProfileData);
        
        // Set form values
        form.reset({
          full_name: userProfileData?.full_name || '',
          bio: freelancerProfileData?.bio || '',
          hourly_rate: freelancerProfileData?.hourly_rate || 0,
          years_experience: freelancerProfileData?.years_experience || 0,
          education: freelancerProfileData?.education || '',
          skills: freelancerProfileData?.skills?.join(', ') || '',
          portfolio_links: freelancerProfileData?.portfolio_links?.join(', ') || '',
          availability: freelancerProfileData?.availability || '',
        });
      } catch (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Error",
          description: "Failed to load your profile information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfiles();
  }, [user, navigate, toast, form]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Update user profile (just the name)
      await updateUserProfile(user.id, {
        full_name: values.full_name,
      });
      
      // Update freelancer profile (all other fields)
      await updateFreelancerProfile(user.id, {
        bio: values.bio,
        hourly_rate: values.hourly_rate,
        years_experience: values.years_experience,
        education: values.education,
        skills: values.skills,
        portfolio_links: values.portfolio_links,
        availability: values.availability,
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <ProfileLayout heading="Profile">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProfileLayout>
    );
  }
  
  return (
    <ProfileLayout 
      heading="Freelancer Profile" 
      description="Manage your professional information and preferences"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <Separator />
            
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell clients about yourself and your expertise..." 
                      className="min-h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Professional Details</h2>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
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
            </div>
            
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="JavaScript, React, UI/UX Design, etc. (comma-separated)" {...field} />
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
                    <Input placeholder="Your educational background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="portfolio_links"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio Links</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/username, https://portfolio.com (comma-separated)" {...field} />
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
                  <FormControl>
                    <Input placeholder="Full-time, Part-time, Weekends only, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </ProfileLayout>
  );
}

function updateUserProfile(userId: string, updates: { full_name: string }) {
  return import('@/lib/supabase/userProfiles').then(({ updateUserProfile }) => {
    return updateUserProfile(userId, updates);
  });
}
