
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FreelancerOnboarding } from '@/components/onboarding/FreelancerOnboarding';
import { ClientOnboarding } from '@/components/onboarding/ClientOnboarding';
import { getUserProfile } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const OnboardingPage = () => {
  const { user } = useAuth();
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
        // Get basic profile info, including user type
        const profile = await getUserProfile(user.id);
        
        if (profile) {
          setUserType(profile.user_type);
          
          // Check if user has already completed onboarding
          if (profile.user_type === 'freelancer') {
            const { data } = await supabase
              .from('freelancer_profiles')
              .select('id')
              .eq('id', user.id)
              .single();
              
            setProfileExists(!!data);
          } else if (profile.user_type === 'client') {
            const { data } = await supabase
              .from('client_profiles')
              .select('id')
              .eq('id', user.id)
              .single();
              
            setProfileExists(!!data);
          }
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, [user]);

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
                  Please contact support for assistance
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
