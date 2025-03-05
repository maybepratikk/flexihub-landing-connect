
import { Navigate, useLocation } from 'react-router-dom';
import { useContext, ReactNode } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useContext(AuthContext);
  const location = useLocation();

  // If auth is loading, show loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not authenticated, redirect to sign in
  if (!session) {
    console.log("User not authenticated, redirecting to signin");
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // User is authenticated, render the children
  return <>{children}</>;
}
