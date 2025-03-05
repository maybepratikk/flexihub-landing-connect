
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowRight } from 'lucide-react';

const VerificationSentPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="w-full glass animate-fade-in">
                <CardHeader className="space-y-3 flex flex-col items-center">
                  <div className="h-16 w-16 bg-primary/10 flex items-center justify-center rounded-full">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-center">Verification Email Sent</CardTitle>
                  <CardDescription className="text-center">
                    We've sent a verification email to your inbox. Please check your email and click the verification link to activate your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-center text-muted-foreground">
                    <p>
                      If you don't see the email, please check your spam folder or request a new verification email.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button asChild className="w-full">
                    <Link to="/signin">
                      Continue to Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VerificationSentPage;
