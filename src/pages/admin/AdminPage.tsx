
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProvider } from '@/contexts/AdminContext';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [verifyingAdmin, setVerifyingAdmin] = useState(true);
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      // Reset state when this effect runs
      setVerifyingAdmin(true);
      setIsAuthorized(null);
      
      // Check if user is authenticated
      if (!authLoading && !user) {
        console.log("User not authenticated, redirecting to signin");
        navigate('/signin', { replace: true });
        setVerifyingAdmin(false);
        return;
      }
      
      // Wait for auth loading to complete
      if (authLoading) {
        return;
      }
      
      // Check if user is admin
      if (user) {
        try {
          console.log("AdminPage - Checking user:", user);
          console.log("User metadata:", user.user_metadata);
          console.log("User type:", user.user_type);
          
          // First check if admin from user type
          const userType = user.user_metadata?.user_type || user.user_type;
          console.log("AdminPage - User type:", userType);
          
          if (userType === 'admin') {
            console.log("Admin metadata found, verifying in database");
            
            // Verify in the admin_access table
            const { data: adminAccess, error } = await supabase
              .from('admin_access')
              .select('access_level')
              .eq('admin_id', user.id)
              .maybeSingle();
              
            if (error) {
              console.error("Error checking admin access:", error);
              toast({
                title: "Error",
                description: "Failed to verify admin access. Please try again.",
                variant: "destructive",
              });
              setIsAuthorized(false);
              setVerifyingAdmin(false);
              navigate('/dashboard', { replace: true });
              return;
            }
            
            if (adminAccess) {
              console.log("Admin access confirmed in database:", adminAccess);
              setIsAuthorized(true);
              setVerifyingAdmin(false);
            } else {
              console.log("Admin metadata exists but no database record found");
              
              // Try to add the admin access if it's missing
              const { error: insertError } = await supabase
                .from('admin_access')
                .insert([{ 
                  admin_id: user.id,
                  access_level: 'standard'
                }]);
                
              if (insertError) {
                console.error("Error creating admin access:", insertError);
                toast({
                  title: "Access Denied",
                  description: "Unable to grant admin access. Please contact support.",
                  variant: "destructive",
                });
                setIsAuthorized(false);
                navigate('/dashboard', { replace: true });
              } else {
                console.log("Admin access granted successfully");
                toast({
                  title: "Admin Access",
                  description: "Admin access granted successfully.",
                });
                setIsAuthorized(true);
              }
              setVerifyingAdmin(false);
            }
          } else {
            console.log("User is not admin, redirecting to dashboard");
            toast({
              title: "Access Denied",
              description: "You don't have permission to access the admin area.",
              variant: "destructive",
            });
            setIsAuthorized(false);
            setVerifyingAdmin(false);
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error("Error during admin verification:", error);
          toast({
            title: "Error",
            description: "An error occurred while verifying admin access.",
            variant: "destructive",
          });
          setIsAuthorized(false);
          setVerifyingAdmin(false);
        }
      }
    };
    
    checkAdminAccess();
  }, [user, authLoading, navigate, toast]);
  
  // Show loading state while we check authorization
  if (authLoading || verifyingAdmin || isAuthorized === null) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-lg font-medium">Verifying admin access...</span>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we confirm your permissions</p>
      </div>
    );
  }

  // If authorized, render admin layout with outlet
  if (isAuthorized) {
    return (
      <AdminProvider>
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      </AdminProvider>
    );
  }
  
  // If we got here, something went wrong, show error
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
          <h2 className="text-xl font-semibold text-red-700">Access Denied</h2>
        </div>
        <p className="mt-2 text-gray-600">
          You don't have permission to access the admin area. Please contact the system administrator if you believe this is an error.
        </p>
        <button 
          onClick={() => navigate('/signin', { replace: true })}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Return to Sign In
        </button>
      </div>
    </div>
  );
}

export default AdminPage;
