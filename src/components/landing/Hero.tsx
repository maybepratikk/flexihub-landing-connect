
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function Hero() {
  const [scrollY, setScrollY] = useState(0);

  // Handle parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 pt-20 pb-32 md:py-32">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden opacity-50">
        <div 
          className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div 
          className="absolute top-[60%] -left-[5%] w-[30%] h-[30%] rounded-full bg-primary/5"
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Connect with Elite Talent & Opportunities
            </h1>
          </motion.div>
          <motion.div variants={itemVariants}>
            <p className="text-xl text-muted-foreground mb-8">
              The minimalist platform where exceptional freelancers and forward-thinking clients collaborate on meaningful projects.
            </p>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="text-lg btn-scale">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg btn-scale">
              <Link to="/how-it-works">Learn More</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="relative mx-auto max-w-5xl"
        >
          <div className="relative glass rounded-2xl overflow-hidden shadow-xl">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-secondary/30 to-transparent"
              style={{ transform: `translateY(${scrollY * 0.05}px)` }}
            />
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80"
              alt="Freelancer working remotely"
              className="w-full h-auto object-cover rounded-2xl"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-6 glass shadow-lg animate-fade-in">
            <p className="text-lg font-medium">
              "This platform changed everything for my career."
            </p>
            <div className="flex items-center mt-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-primary font-bold">
                JD
              </div>
              <div className="ml-3">
                <p className="font-medium">Jane Doe</p>
                <p className="text-sm text-muted-foreground">UI Designer</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
