
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-primary/5" />
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Work Experience?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join our community of elite freelancers and visionary clients. Turn your passion into success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg btn-scale">
              <Link to="/signup">Create Free Account</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
