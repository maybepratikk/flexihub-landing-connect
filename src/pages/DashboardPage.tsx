
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserProfile } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

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
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Welcome, {profile?.full_name}</h1>
                <p className="text-muted-foreground">
                  {profile?.user_type === 'freelancer' ? 'Freelancer Dashboard' : 'Client Dashboard'}
                </p>
              </div>
              <Button>
                {profile?.user_type === 'freelancer' ? 'Find Projects' : 'Post a Project'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Summary</CardTitle>
                  <CardDescription>
                    {profile?.user_type === 'freelancer' 
                      ? 'Your professional profile information' 
                      : 'Your company profile information'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile?.user_type === 'freelancer' ? (
                    <div className="space-y-2">
                      <p><strong>Hourly Rate:</strong> ${detailedProfile?.hourly_rate}/hr</p>
                      <p><strong>Experience:</strong> {detailedProfile?.years_experience} years</p>
                      <p><strong>Skills:</strong> {detailedProfile?.skills?.join(', ')}</p>
                      <p><strong>Availability:</strong> {detailedProfile?.availability}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p><strong>Company:</strong> {detailedProfile?.company_name}</p>
                      <p><strong>Industry:</strong> {detailedProfile?.industry}</p>
                      <p><strong>Size:</strong> {detailedProfile?.company_size}</p>
                      <p><strong>Website:</strong> {detailedProfile?.website}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    {profile?.user_type === 'freelancer' ? 'Recent Projects' : 'Your Projects'}
                  </CardTitle>
                  <CardDescription>
                    {profile?.user_type === 'freelancer' 
                      ? 'Projects you are working on' 
                      : 'Projects you have posted'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    No projects yet
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    {profile?.user_type === 'freelancer' ? 'Earnings' : 'Payments'}
                  </CardTitle>
                  <CardDescription>
                    {profile?.user_type === 'freelancer' 
                      ? 'Your recent earnings' 
                      : 'Your recent payments'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    No transaction history yet
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
