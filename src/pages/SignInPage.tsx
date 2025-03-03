
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SignInForm } from '@/components/auth/SignInForm';

const SignInPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <SignInForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SignInPage;
