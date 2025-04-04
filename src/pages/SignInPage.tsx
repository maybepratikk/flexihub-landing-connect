
import { SignInForm } from '@/components/auth/SignInForm';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SignInPage = () => {
  const { session, user } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // If user is already logged in, redirect to appropriate page
  if (session && user) {
    // Check if the user is an admin based on metadata
    const userType = user.user_metadata?.user_type || user.user_type;
    
    if (userType === 'admin') {
      console.log("SignInPage: Redirecting to admin - user is admin");
      return <Navigate to="/admin" replace />;
    }
    
    console.log("SignInPage: Redirecting to dashboard - user already logged in");
    return <Navigate to={from} replace />;
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
