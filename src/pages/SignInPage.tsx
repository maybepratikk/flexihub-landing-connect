
import { SignInForm } from '@/components/auth/SignInForm';
import { AdminAccountSetup } from '@/components/auth/AdminAccountSetup';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SignInPage = () => {
  const { session } = useAuth();
  const [showAdminSetup, setShowAdminSetup] = useState(false);

  // If user is already logged in, redirect to dashboard
  if (session) {
    console.log("User already logged in, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <SignInForm />
          
          <div className="mt-8">
            {!showAdminSetup && (
              <Alert className="mb-4 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Admin Login</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Need admin access? Click below to create or view admin credentials.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              variant={showAdminSetup ? "outline" : "default"} 
              onClick={() => setShowAdminSetup(!showAdminSetup)}
              className="w-full"
            >
              {showAdminSetup ? 'Hide Admin Setup' : 'Show Admin Setup'}
            </Button>
            
            {showAdminSetup && (
              <div className="mt-4">
                <AdminAccountSetup />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignInPage;
