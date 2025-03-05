
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SignUpPage = () => {
  const { session } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <SignUpForm />
        </div>
      </div>
    </section>
  );
};

export default SignUpPage;
