
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FreelancerOnboarding } from '@/components/onboarding/FreelancerOnboarding';
import { ClientOnboarding } from '@/components/onboarding/ClientOnboarding';
import { getUserProfile, supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const OnboardingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log("Onboarding - Checking profile for user:", user.id);
        
        // First check user_metadata from auth
        const metadataUserType = user.user_metadata?.user_type;
        console.log("User type from metadata:", metadataUserType);
        
        // Then get basic profile info from database
        const profile = await getUserProfile(user.id);
        console.log("Profile from database:", profile);
        
        // If profile doesn't exist but we have metadata, create the profile
        if (!profile && metadataUserType) {
          console.log("Creating missing profile with type:", metadataUserType);
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name,
              user_type: metadataUserType,
            }, { onConflict: 'id' });
            
          if (error) {
            console.error("Error creating profile:", error);
            toast({
              title: "Error",
              description: "Failed to create user profile. Please try again.",
              variant: "destructive",
            });
          } else {
            // Fetch the new profile
            const newProfile = await getUserProfile(user.id);
            if (newProfile) {
              setUserType(newProfile.user_type);
            } else {
              setUserType(metadataUserType);
            }
          }
        } else if (profile) {
          setUserType(profile.user_type);
        } else if (metadataUserType) {
          setUserType(metadataUserType);
        }
        
        // Check if user has already completed onboarding
        if (userType === 'freelancer' || profile?.user_type === 'freelancer') {
          const { data } = await supabase
            .from('freelancer_profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
            
          setProfileExists(!!data);
        } else if (userType === 'client' || profile?.user_type === 'client') {
          const { data } = await supabase
            .from('client_profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
            
          setProfileExists(!!data);
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
        toast({
          title: "Error",
          description: "Failed to load profile status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, [user, userType, toast]);

  // If not logged in, redirect to sign in
  if (!loading && !user) {
    return <Navigate to="/signin" replace />;
  }

  // If already completed onboarding, redirect to dashboard
  if (!loading && profileExists) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {userType === 'freelancer' ? (
              <FreelancerOnboarding />
            ) : userType === 'client' ? (
              <ClientOnboarding />
            ) : (
              <div className="text-center p-8">
                <h2 className="text-xl font-semibold">User type not found</h2>
                <p className="mt-2 text-muted-foreground">
                  There was an issue detecting your account type. Please try signing out and signing in again, or contact support.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default OnboardingPage;
