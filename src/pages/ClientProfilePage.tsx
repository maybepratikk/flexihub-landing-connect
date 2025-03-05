
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/userProfiles';

// Define the form schema
const clientProfileSchema = z.object({
  company_name: z.string().min(1, { message: "Company name is required" }),
  industry: z.string().min(1, { message: "Industry is required" }),
  company_size: z.string().min(1, { message: "Company size is required" }),
  company_description: z.string().min(10, { message: "Description should be at least 10 characters" }),
  website: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
});

// Define the form values type
type ClientProfileFormValues = z.infer<typeof clientProfileSchema>;

export default function ClientProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<ClientProfileFormValues>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      company_name: '',
      industry: '',
      company_size: '',
      company_description: '',
      website: '',
    },
  });

  // Fetch user profile data
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return;

      setLoading(true);
      try {
        console.log("Fetching client profile for user:", user.id);
        const profileData = await getUserProfile(user.id);
        console.log("Fetched profile data:", profileData);

        if (profileData?.client_profile) {
          const clientData = profileData.client_profile;
          form.reset({
            company_name: clientData.company_name || '',
            industry: clientData.industry || '',
            company_size: clientData.company_size || '',
            company_description: clientData.company_description || '',
            website: clientData.website || '',
          });
        }
      } catch (error) {
        console.error("Error fetching client profile:", error);
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
  }, [user, form, toast]);

  const onSubmit = async (values: ClientProfileFormValues) => {
    if (!user) return;
    
    setSubmitting(true);
    try {
      console.log("Updating client profile with values:", values);
      
      const updatedProfile = await updateUserProfile(user.id, {
        client_profile: {
          company_name: values.company_name,
          industry: values.industry,
          company_size: values.company_size,
          company_description: values.company_description,
          website: values.website || null,
        }
      });
      
      if (updatedProfile) {
        toast({
          title: "Profile Updated",
          description: "Your company profile has been successfully updated.",
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
        heading="Client Profile" 
        description="Manage your company information"
      >
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout 
      heading="Client Profile" 
      description="Manage your company information"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Technology, Healthcare" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Size</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. 1-10, 11-50, 51-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="company_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your company, mission, and values" 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
