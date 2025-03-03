
import { Navigate } from 'react-router-dom';
import { useContext, ReactNode } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useContext(AuthContext);

  // If auth is loading, show nothing
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to sign in
  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  // User is authenticated, render the children
  return <>{children}</>;
}
