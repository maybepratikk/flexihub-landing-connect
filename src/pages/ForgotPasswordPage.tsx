
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailIcon, ArrowRightIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error in password reset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto glass animate-fade-in">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                  {isSubmitted ? 'Check your email' : 'Forgot your password?'}
                </CardTitle>
                <CardDescription className="text-center">
                  {isSubmitted 
                    ? 'We've sent you a link to reset your password' 
                    : 'Enter your email and we'll send you a link to reset your password'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Button 
                      type="submit" 
                      className="w-full btn-scale" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending link...
                        </>
                      ) : (
                        <>
                          Send reset link
                          <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MailIcon className="h-8 w-8 text-primary" />
                    </div>
                    <p className="mb-4">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      If you don't see the email, check your spam folder or make sure you entered the correct email address.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-center text-sm">
                  <Link to="/signin" className="font-medium text-primary hover:underline">
                    Back to sign in
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
