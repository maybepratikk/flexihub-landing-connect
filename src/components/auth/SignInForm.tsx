
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

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-fill default admin credentials when in admin mode
  useEffect(() => {
    if (adminMode) {
      setEmail('admin@example.com');
      setPassword('Admin123!');
    } else {
      setEmail('');
      setPassword('');
    }
  }, [adminMode]);

  // If user is already logged in, redirect to appropriate page
  useEffect(() => {
    if (session) {
      // Check if the user is an admin based on metadata
      const userType = session.user?.user_metadata?.user_type || 
                     ('user_type' in session.user ? session.user.user_type : null);
                     
      if (userType === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [session, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log(`Signing in as ${adminMode ? 'admin' : 'regular user'} with email: ${email}`);
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

  // If already logged in, we'll redirect via useEffect, but don't render this component
  if (session) {
    return null;
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
              Sign in with admin credentials: <span className="font-mono bg-gray-100 text-xs px-1 rounded">admin@example.com</span> / 
              <span className="font-mono bg-gray-100 text-xs px-1 rounded">Admin123!</span>
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
