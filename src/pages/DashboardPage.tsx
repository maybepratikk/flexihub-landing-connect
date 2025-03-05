
import { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/supabase/userProfiles';
import { Loader2 } from 'lucide-react';
import { FreelancerDashboard } from './dashboard/FreelancerDashboard';
import { ClientDashboard } from './dashboard/ClientDashboard';
import { useToast } from '@/components/ui/use-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [shouldRedirectToOnboarding, setShouldRedirectToOnboarding] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      console.log("DashboardPage - Loading profile data for user:", user.id);
      
      // Get profile from database
      const profileData = await getUserProfile(user.id);
      console.log("Profile from database:", profileData);
      
      if (profileData) {
        setProfile(profileData);
        
        // Check if detailed profile exists based on user type
        const needsOnboarding = (
          (profileData.user_type === 'freelancer' && !profileData.freelancer_profile) ||
          (profileData.user_type === 'client' && !profileData.client_profile)
        );
        
        if (needsOnboarding) {
          console.log("User needs onboarding, redirecting...");
          setShouldRedirectToOnboarding(true);
        } else {
          console.log("User has complete profile, showing dashboard");
          setShouldRedirectToOnboarding(false);
        }
      } else {
        // No profile found at all, redirect to onboarding
        console.log("No profile found, redirecting to onboarding");
        setShouldRedirectToOnboarding(true);
      }
    } catch (error: any) {
      console.error('Error loading profile data:', error);
      setError(error.message || 'Failed to load profile data');
      toast({
        title: "Error loading dashboard",
        description: error.message || 'Failed to load profile data',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // If not logged in, redirect to sign in
  if (!loading && !user) {
    return <Navigate to="/signin" replace />;
  }

  // If profile needs onboarding, redirect once (not in a loop)
  if (!loading && shouldRedirectToOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold">Error loading dashboard</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary text-white rounded" 
              onClick={() => loadProfileData()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {profile?.user_type === 'freelancer' ? (
              <FreelancerDashboard />
            ) : profile?.user_type === 'client' ? (
              <ClientDashboard onRefresh={loadProfileData} />
            ) : (
              <div className="text-center">
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

export default DashboardPage;
