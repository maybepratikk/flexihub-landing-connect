
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/supabase/userProfiles';
import { getClientProfile, updateClientProfile } from '@/lib/supabase/clientProfiles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  company_name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().min(2, {
    message: "Industry must be at least 2 characters.",
  }),
  company_size: z.string().min(1, {
    message: "Company size is required",
  }),
  company_description: z.string().min(10, {
    message: "Company description must be at least 10 characters.",
  }).max(500, {
    message: "Company description must not exceed 500 characters."
  }),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
});

export default function ClientProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      company_name: '',
      industry: '',
      company_size: '',
      company_description: '',
      website: '',
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
        
        // Fetch client profile
        const clientProfileData = await getClientProfile(user.id);
        setClientProfile(clientProfileData);
        
        // Set form values
        form.reset({
          full_name: userProfileData?.full_name || '',
          company_name: clientProfileData?.company_name || '',
          industry: clientProfileData?.industry || '',
          company_size: clientProfileData?.company_size || '',
          company_description: clientProfileData?.company_description || '',
          website: clientProfileData?.website || '',
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
      
      // Update client profile (all other fields)
      await updateClientProfile(user.id, {
        company_name: values.company_name,
        industry: values.industry,
        company_size: values.company_size,
        company_description: values.company_description,
        website: values.website,
      });
      
      toast({
        title: "Profile Updated",
        description: "Your company profile has been successfully updated.",
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
      heading="Company Profile" 
      description="Manage your company information and preferences"
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
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Company Information</h2>
            <Separator />
            
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Technology, Healthcare" {...field} />
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
                      <Input placeholder="e.g. 1-10, 11-50, 51-200" {...field} />
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
                      placeholder="Tell freelancers about your company and what you do..." 
                      className="min-h-32"
                      {...field} 
                    />
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
                  <FormLabel>Website (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yourcompany.com" {...field} />
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
