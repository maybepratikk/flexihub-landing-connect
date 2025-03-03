
import { SignInForm } from '@/components/auth/SignInForm';

const SignInPage = () => {
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
