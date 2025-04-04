import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client'; // Fix the import path
import { useToast } from '@/hooks/use-toast';

export interface ExtendedUser extends User {
  user_metadata: {
    full_name?: string;
    user_type?: 'freelancer' | 'client' | 'admin';
  };
  user_type?: 'freelancer' | 'client' | 'admin';
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
    console.log("AuthProvider: Initializing auth state");
    const fetchSession = async () => {
      try {
        // First set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          console.log('Auth state changed:', _event, newSession?.user?.id);
          
          if (newSession?.user) {
            // Handle user session update without additional DB calls in the listener
            // Save the full session object and user
            setSession(newSession);
            const extendedUser = newSession.user as ExtendedUser;
            
            // Don't make DB calls in the listener to prevent deadlocks
            setUser(extendedUser);
            
            // Check admin status separately using setTimeout to avoid blocking
            setTimeout(async () => {
              try {
                const { data: adminAccess } = await supabase
                  .from('admin_access')
                  .select('access_level')
                  .eq('admin_id', newSession.user.id)
                  .maybeSingle();
                  
                if (adminAccess) {
                  console.log("User has admin access:", adminAccess);
                  // Update the user object with admin type
                  setUser(currentUser => {
                    if (!currentUser) return null;
                    
                    const updatedUser = { ...currentUser };
                    if (updatedUser.user_metadata) {
                      updatedUser.user_metadata.user_type = 'admin';
                    } else {
                      updatedUser.user_metadata = { user_type: 'admin' };
                    }
                    updatedUser.user_type = 'admin';
                    return updatedUser;
                  });
                }
              } catch (adminCheckError) {
                console.error("Error checking admin status:", adminCheckError);
              }
            }, 0);
          } else {
            setUser(null);
            setSession(null);
          }
          
          setLoading(false);
        });

        // Then check for existing session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching initial session:', error);
          toast({
            title: "Authentication Error",
            description: "There was a problem connecting to the authentication service.",
            variant: "destructive",
          });
          setLoading(false);
        } else if (initialSession) {
          console.log('Initial session fetch:', initialSession);
          
          // First, update state with what we have immediately
          setSession(initialSession);
          setUser(initialSession.user as ExtendedUser);
          
          // Then check admin status separately using setTimeout to avoid Supabase auth deadlocks
          if (initialSession.user) {
            setTimeout(async () => {
              try {
                const { data: adminAccess } = await supabase
                  .from('admin_access')
                  .select('access_level')
                  .eq('admin_id', initialSession.user.id)
                  .maybeSingle();
                  
                if (adminAccess) {
                  console.log("User has admin access:", adminAccess);
                  // Update the user object with admin type
                  setUser(currentUser => {
                    if (!currentUser) return null;
                    
                    const updatedUser = { ...currentUser };
                    if (updatedUser.user_metadata) {
                      updatedUser.user_metadata.user_type = 'admin';
                    } else {
                      updatedUser.user_metadata = { user_type: 'admin' };
                    }
                    updatedUser.user_type = 'admin';
                    return updatedUser;
                  });
                }
              } catch (adminCheckError) {
                console.error("Error checking admin status:", adminCheckError);
              }
            }, 0);
          }
          
          setLoading(false);
        } else {
          // No session
          setUser(null);
          setSession(null);
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Exception in fetchSession:', err);
        setLoading(false);
      }
    };

    fetchSession();
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
      console.log(`Attempting to sign in with email: ${email}, adminMode: ${adminMode}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      console.log("Sign in successful, session:", data.session);
      
      // Update state immediately with what we have
      setSession(data.session);
      setUser(data.user as ExtendedUser);
      
      if (adminMode) {
        // Check if the user is admin in a non-blocking way
        console.log("Admin mode login attempt, checking admin access");
        setTimeout(async () => {
          try {
            const { data: adminData, error: adminError } = await supabase
              .from('admin_access')
              .select('access_level')
              .eq('admin_id', data.user.id)
              .maybeSingle();
              
            if (adminError || !adminData) {
              console.error('Admin access check error:', adminError);
              toast({
                title: "Access Denied",
                description: "You don't have admin privileges.",
                variant: "destructive",
              });
              
              await supabase.auth.signOut();
              setUser(null);
              setSession(null);
              return;
            }
            
            console.log("Admin access confirmed:", adminData);
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
          } catch (err) {
            console.error("Error checking admin status:", err);
          }
        }, 0);
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to allow the component to handle it
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during sign out:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
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
