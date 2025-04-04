
import { useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProvider } from '@/contexts/AdminContext';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
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
      console.log("User type:", userType);
      if (userType !== 'admin') {
        console.log("User is not admin, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      } else {
        console.log("Admin access confirmed");
      }
    }
  }, [user, loading, navigate]);
  
  // Simplified loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminProvider>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminProvider>
  );
}

export default AdminPage;
