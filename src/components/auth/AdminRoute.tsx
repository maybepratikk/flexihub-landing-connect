
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user || authLoading || adminLoading) {
        return;
      }

      try {
        // Double-check admin access directly
        const { data, error } = await supabase
          .from('admin_access')
          .select('access_level')
          .eq('admin_id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error verifying admin status:", error);
          setIsAuthorized(false);
        } else {
          setIsAuthorized(!!data);
        }
      } catch (err) {
        console.error("Exception in admin verification:", err);
        setIsAuthorized(false);
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyAdmin();
  }, [user, authLoading, adminLoading]);

  // If any loading is happening, show loading indicator
  if (authLoading || adminLoading || isVerifying) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not authenticated, redirect to sign in
  if (!user) {
    console.log("User not authenticated, redirecting to signin");
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is authenticated but not admin, redirect to dashboard
  if (!isAdmin || !isAuthorized) {
    console.log("User is not an admin, redirecting to dashboard");
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // User is authenticated and is admin, render the children
  console.log("User is authorized as admin, rendering admin content");
  return <>{children}</>;
}
