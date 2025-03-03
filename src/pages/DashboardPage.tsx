
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { FreelancerDashboard } from './dashboard/FreelancerDashboard';
import { ClientDashboard } from './dashboard/ClientDashboard';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [detailedProfile, setDetailedProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get basic profile info
        const basicProfile = await getUserProfile(user.id);
        setProfile(basicProfile);
        
        if (basicProfile) {
          // Get detailed profile based on user type
          if (basicProfile.user_type === 'freelancer') {
            const { data } = await supabase
              .from('freelancer_profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            setDetailedProfile(data);
          } else if (basicProfile.user_type === 'client') {
            const { data } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            setDetailedProfile(data);
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  // If not logged in, redirect to sign in
  if (!loading && !user) {
    return <Navigate to="/signin" replace />;
  }

  // If profile exists but detailed profile doesn't, redirect to onboarding
  if (!loading && profile && !detailedProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {profile?.user_type === 'freelancer' ? (
              <FreelancerDashboard />
            ) : profile?.user_type === 'client' ? (
              <ClientDashboard />
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
