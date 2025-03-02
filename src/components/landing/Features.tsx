
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BriefcaseIcon, UsersIcon, ShieldCheckIcon, TrendingUpIcon } from 'lucide-react';

const features = [
  {
    icon: BriefcaseIcon,
    title: 'Premium Projects',
    description: 'Access carefully curated projects from leading companies and innovative startups.'
  },
  {
    icon: UsersIcon,
    title: 'Vetted Talent',
    description: 'Connect with exceptional freelancers who have proven their expertise and reliability.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Payments',
    description: 'Enjoy safe, transparent payment processing with escrow protection and milestone-based releases.'
  },
  {
    icon: TrendingUpIcon,
    title: 'Career Growth',
    description: 'Build your reputation with a portfolio that showcases your best work and client reviews.'
  }
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <section className="py-24 bg-background" id="features">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Modern Approach to Freelancing
          </h2>
          <p className="text-lg text-muted-foreground">
            We've reimagined how freelancers and clients connect, collaborate, and succeed together.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white p-6 rounded-xl glass card-hover"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
