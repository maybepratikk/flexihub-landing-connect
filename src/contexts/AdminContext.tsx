
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AdminContextType {
  isAdmin: boolean;
  accessLevel: string | null;
  loading: boolean;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [accessLevel, setAccessLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setAccessLevel(null);
        setLoading(false);
        return;
      }

      try {
        console.log("Checking admin status for user:", user.id);
        
        // First check metadata for quick result
        const isAdminFromMetadata = user.user_metadata?.user_type === 'admin' || 
                                   user.user_type === 'admin';
        
        // Then verify from database
        const { data, error } = await supabase
          .from('admin_access')
          .select('access_level')
          .eq('admin_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setAccessLevel(null);
        } else if (data) {
          console.log("User found in admin_access table:", data);
          setIsAdmin(true);
          setAccessLevel(data.access_level);
        } else if (isAdminFromMetadata) {
          console.log("User has admin metadata but not in admin_access table, creating entry");
          
          // Create admin access entry if it doesn't exist
          const { error: insertError } = await supabase
            .from('admin_access')
            .insert([{ 
              admin_id: user.id,
              access_level: 'standard'
            }]);
            
          if (insertError) {
            console.error("Error creating admin access:", insertError);
            setIsAdmin(false);
            setAccessLevel(null);
          } else {
            console.log("Admin access created successfully");
            setIsAdmin(true);
            setAccessLevel('standard');
          }
        } else {
          console.log("User is not an admin");
          setIsAdmin(false);
          setAccessLevel(null);
        }
      } catch (err) {
        console.error('Exception checking admin status:', err);
        setIsAdmin(false);
        setAccessLevel(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, toast]);

  const value = {
    isAdmin,
    accessLevel,
    loading
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAdmin();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3">Verifying admin access...</span>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this area.</p>
      </div>
    );
  }
  
  return <>{children}</>;
};
