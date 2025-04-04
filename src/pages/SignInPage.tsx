
import { SignInForm } from '@/components/auth/SignInForm';
import { AdminAccountSetup } from '@/components/auth/AdminAccountSetup';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
          
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => setShowAdminSetup(!showAdminSetup)}
              className="text-xs text-muted-foreground"
            >
              {showAdminSetup ? 'Hide' : 'Show'} Admin Setup
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
