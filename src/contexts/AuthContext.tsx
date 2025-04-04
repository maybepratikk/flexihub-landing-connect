
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface ExtendedUser extends User {
  user_metadata: {
    full_name?: string;
    user_type?: 'freelancer' | 'client' | 'admin';
  };
  user_type?: 'freelancer' | 'client' | 'admin'; // Add this property directly on the user
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userType: string) => Promise<void>;
  signIn: (email: string, password: string, adminMode?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initial session fetch
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          toast({
            title: "Authentication Error",
            description: "There was a problem connecting to the authentication service.",
            variant: "destructive",
          });
        } else {
          console.log('Initial session fetch:', session);
          
          if (session?.user) {
            // Check if user has admin privileges
            const { data: adminAccess } = await supabase
              .from('admin_access')
              .select('access_level')
              .eq('admin_id', session.user.id)
              .maybeSingle();
              
            const extendedUser = session.user as ExtendedUser;
            
            // If user has admin privileges, add admin type to user metadata
            if (adminAccess) {
              if (extendedUser.user_metadata) {
                extendedUser.user_metadata.user_type = 'admin';
              } else {
                extendedUser.user_metadata = { user_type: 'admin' };
              }
              extendedUser.user_type = 'admin';
            }
            
            setUser(extendedUser);
          } else {
            setUser(null);
          }
          
          setSession(session);
        }
      } catch (err) {
        console.error('Exception in fetchSession:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      
      if (session?.user) {
        // Check if user has admin privileges on auth state change
        const { data: adminAccess } = await supabase
          .from('admin_access')
          .select('access_level')
          .eq('admin_id', session.user.id)
          .maybeSingle();
          
        const extendedUser = session.user as ExtendedUser;
        
        // If user has admin privileges, add admin type to user metadata
        if (adminAccess) {
          if (extendedUser.user_metadata) {
            extendedUser.user_metadata.user_type = 'admin';
          } else {
            extendedUser.user_metadata = { user_type: 'admin' };
          }
          extendedUser.user_type = 'admin';
        }
        
        setUser(extendedUser);
      } else {
        setUser(null);
      }
      
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = async (email: string, password: string, fullName: string, userType: string) => {
    try {
      setLoading(true);
      
      console.log("Signing up user with type:", userType);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Please check your email to confirm your account.",
      });
      
      // Redirect to verification page
      window.location.href = '/verify';
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, adminMode = false) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log("Sign in successful, session:", data.session);
      
      // Check if the user is trying to sign in as admin
      if (adminMode) {
        // Check if user has admin privileges
        const { data: adminData, error: adminError } = await supabase
          .from('admin_access')
          .select('access_level')
          .eq('admin_id', data.user.id)
          .maybeSingle();
          
        if (adminError || !adminData) {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges.",
            variant: "destructive",
          });
          
          // Sign out the user
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          return;
        }
        
        // Add admin info to user metadata for easy access
        const extendedUser = data.user as ExtendedUser;
        if (extendedUser.user_metadata) {
          extendedUser.user_metadata.user_type = 'admin';
        } else {
          extendedUser.user_metadata = { user_type: 'admin' };
        }
        extendedUser.user_type = 'admin';
        
        setUser(extendedUser);
        
        toast({
          title: "Admin Access Granted",
          description: "You have signed in as an admin.",
        });
        
        // Redirect to admin page
        window.location.href = '/admin';
        return;
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      // Navigate to dashboard after successful sign in
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setUser(null);
      setSession(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during sign out:', error);
        throw error;
      }
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });

      window.location.href = '/';
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
