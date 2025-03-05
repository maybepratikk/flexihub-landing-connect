
import { Navigate } from 'react-router-dom';
import { useContext, ReactNode } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

interface ClientRouteProps {
  children: ReactNode;
}

export function ClientRoute({ children }: ClientRouteProps) {
  const { user, loading } = useContext(AuthContext);
  const userType = user?.user_metadata?.user_type;

  // If auth is loading, show nothing
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to sign in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If user is not a client, redirect to dashboard
  if (userType !== 'client') {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and is a client, render the children
  return <>{children}</>;
}
