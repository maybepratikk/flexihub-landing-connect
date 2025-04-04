
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailIcon, KeyIcon, ArrowRightIcon, Loader2, ShieldIcon, UserIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const { signIn, session, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-fill admin credentials when in admin mode
  useEffect(() => {
    if (adminMode) {
      setEmail('pratikadmin@gmail.com');
      setPassword('Pratik@12');
    } else {
      setEmail('');
      setPassword('');
    }
  }, [adminMode]);

  // Handle navigation after successful login
  useEffect(() => {
    if (session && user) {
      try {
        // Check if the user is an admin based on metadata
        const userType = user.user_metadata?.user_type || user.user_type;
        
        console.log('SignInForm: Session detected, userType:', userType);
                       
        if (userType === 'admin') {
          console.log('Redirecting to admin page - user is admin');
          navigate('/admin', { replace: true });
        } else {
          console.log('Redirecting to dashboard - user is not admin');
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error in navigation after login:', error);
      }
    }
  }, [session, user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return; // Prevent multiple submissions
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`Signing in as ${adminMode ? 'admin' : 'regular user'} with email: ${email}`);
      
      // Proceed with sign in
      await signIn(email, password, adminMode);
      
      // Redirect will be handled by the useEffect that watches the session
    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already logged in, we'll redirect via useEffect
  if (session) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto glass animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="user" className="mb-4" onValueChange={(value) => setAdminMode(value === 'admin')}>
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="user">
              <UserIcon className="mr-2 h-4 w-4" />
              User
            </TabsTrigger>
            <TabsTrigger value="admin">
              <ShieldIcon className="mr-2 h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>
          <TabsContent value="user" className="p-0 pt-2">
            <p className="text-sm text-muted-foreground text-center">Sign in as a regular user</p>
          </TabsContent>
          <TabsContent value="admin" className="p-0 pt-2">
            <p className="text-sm text-muted-foreground text-center">
              Sign in with admin credentials
            </p>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <MailIcon className="h-5 w-5" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <KeyIcon className="h-5 w-5" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full btn-scale" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : adminMode ? (
              <>
                <ShieldIcon className="mr-2 h-4 w-4" />
                Sign in as Admin
              </>
            ) : (
              <>
                Sign in
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        
        <Separator className="my-4" />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
