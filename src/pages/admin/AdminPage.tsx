
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProvider } from '@/contexts/AdminContext';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      console.log("User not authenticated, redirecting to signin");
      navigate('/signin', { replace: true });
      return;
    }
    
    // Check if user is admin
    if (!loading && user) {
      const userType = user.user_metadata?.user_type || user.user_type;
      console.log("AdminPage - User type:", userType);
      
      if (userType !== 'admin') {
        console.log("User is not admin, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
        setIsAuthorized(false);
      } else {
        console.log("Admin access confirmed");
        setIsAuthorized(true);
      }
    }
  }, [user, loading, navigate]);
  
  // Show loading state while we check authorization
  if (loading || isAuthorized === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3">Verifying admin access...</span>
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
        <h2 className="text-xl font-semibold text-red-700">Access Denied</h2>
        <p className="mt-2 text-gray-600">
          You don't have permission to access the admin area.
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
