
import { SignInForm } from '@/components/auth/SignInForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SignInPage = () => {
  const { session } = useAuth();

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
        </div>
      </div>
    </section>
  );
};

export default SignInPage;
