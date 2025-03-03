
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTA } from '@/components/landing/CTA';
import { useAuth } from '@/contexts/AuthContext';

const LandingPage = () => {
  // We're just using this to ensure the context is available,
  // but not actually using the values
  useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
