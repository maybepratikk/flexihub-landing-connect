
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailIcon, KeyIcon, ArrowRightIcon, Loader2, ShieldIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminOption, setShowAdminOption] = useState(false);
  const [loginAs, setLoginAs] = useState('user');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Listen for Ctrl+Shift+A to show admin login option
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdminOption(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await signIn(email, password, loginAs === 'admin' ? 'admin' : undefined);
      navigate(loginAs === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          
          {showAdminOption && (
            <div className="space-y-2 pt-2">
              <Label>Login as</Label>
              <RadioGroup 
                value={loginAs}
                onValueChange={setLoginAs}
                className="flex space-x-2"
              >
                <div 
                  className={cn(
                    "flex-1 rounded-md border p-3 cursor-pointer transition-all",
                    loginAs === "user" 
                      ? "border-primary bg-primary/5" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setLoginAs("user")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="cursor-pointer font-medium">
                      Regular User
                    </Label>
                  </div>
                </div>
                
                <div 
                  className={cn(
                    "flex-1 rounded-md border p-3 cursor-pointer transition-all",
                    loginAs === "admin" 
                      ? "border-primary bg-primary/5" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setLoginAs("admin")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="cursor-pointer font-medium">
                      Admin
                    </Label>
                  </div>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground italic">
                Admin login is restricted to authorized personnel only
              </p>
            </div>
          )}
          
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
            ) : (
              <>
                Sign in
                {loginAs === 'admin' && <ShieldIcon className="ml-2 h-4 w-4" />}
                {loginAs !== 'admin' && <ArrowRightIcon className="ml-2 h-4 w-4" />}
              </>
            )}
          </Button>
          
          {!showAdminOption && (
            <div className="text-center">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setShowAdminOption(true)}
              >
                Admin Access
              </Button>
            </div>
          )}
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
