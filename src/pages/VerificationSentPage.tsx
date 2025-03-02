
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheckIcon } from 'lucide-react';

const VerificationSentPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto glass animate-fade-in">
              <CardHeader className="space-y-1 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MailCheckIcon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                <CardDescription>
                  We've sent a verification link to your email address
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-4">
                  Please check your email inbox and click on the verification link to complete your registration.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you don't see the email, check your spam folder or make sure you entered the correct email address.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button asChild variant="outline" className="w-full btn-scale">
                  <Link to="/signin">Return to sign in</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VerificationSentPage;
