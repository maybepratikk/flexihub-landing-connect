
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Once both auth and admin status are loaded, we can stop checking
    if (!authLoading && !adminLoading) {
      setIsChecking(false);
    }
  }, [authLoading, adminLoading]);

  // Show loading only during initial verification
  if (authLoading || adminLoading || isChecking) {
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
  if (!isAdmin) {
    console.log("User is not an admin, redirecting to dashboard");
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // User is authenticated and is admin, render the children
  return <>{children}</>;
}
