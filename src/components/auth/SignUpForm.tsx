
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailIcon, UserIcon, KeyIcon, ArrowRightIcon, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export function SignUpForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('freelancer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await signUp(email, password, fullName, userType);
      navigate('/verification-sent');
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your information to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <UserIcon className="h-5 w-5" />
              </div>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                className="pl-10"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>
          
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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <KeyIcon className="h-5 w-5" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Password must be at least 8 characters long
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>I am a</Label>
            <RadioGroup 
              defaultValue="freelancer" 
              value={userType}
              onValueChange={setUserType}
              className="flex space-x-2"
            >
              <div 
                className={cn(
                  "flex-1 rounded-md border p-4 cursor-pointer transition-all",
                  userType === "freelancer" 
                    ? "border-primary bg-primary/5" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => setUserType("freelancer")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="freelancer" id="freelancer" />
                  <Label htmlFor="freelancer" className="cursor-pointer font-medium">
                    Freelancer
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  I want to find work and offer my services
                </p>
              </div>
              
              <div 
                className={cn(
                  "flex-1 rounded-md border p-4 cursor-pointer transition-all",
                  userType === "client" 
                    ? "border-primary bg-primary/5" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => setUserType("client")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="cursor-pointer font-medium">
                    Client
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  I want to hire skilled freelancers
                </p>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            type="submit" 
            className="w-full btn-scale" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        
        <Separator className="my-4" />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
