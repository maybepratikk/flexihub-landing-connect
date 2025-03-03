
import { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, supabase } from '@/lib/supabase';
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
  const [detailedProfile, setDetailedProfile] = useState<any>(null);

  const loadProfileData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      console.log("DashboardPage - Loading profile data for user:", user.id);
      
      // Get basic profile info
      const basicProfile = await getUserProfile(user.id);
      console.log("DashboardPage - Basic profile loaded:", basicProfile);
      setProfile(basicProfile);
      
      if (basicProfile) {
        // Get detailed profile based on user type
        if (basicProfile.user_type === 'freelancer') {
          console.log("DashboardPage - Loading freelancer profile");
          const { data, error } = await supabase
            .from('freelancer_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error loading freelancer profile:", error);
            if (error.code === 'PGRST116') {
              // No rows found
              setDetailedProfile(null);
            } else {
              throw error;
            }
          } else {
            console.log("DashboardPage - Freelancer profile loaded:", data);
            setDetailedProfile(data);
          }
        } else if (basicProfile.user_type === 'client') {
          console.log("DashboardPage - Loading client profile");
          const { data, error } = await supabase
            .from('client_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error loading client profile:", error);
            if (error.code === 'PGRST116') {
              // No rows found
              setDetailedProfile(null);
            } else {
              throw error;
            }
          } else {
            console.log("DashboardPage - Client profile loaded:", data);
            setDetailedProfile(data);
          }
        }
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
