
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "This platform streamlined my entire freelancing career. The projects are high-quality and payments are always on time.",
    author: "Alex Johnson",
    role: "Full Stack Developer",
    company: "Self-employed",
    avatar: "AJ",
    stars: 5
  },
  {
    quote: "As a client, I've found incredible talent that perfectly matched our company needs. The vetting process saves us so much time.",
    author: "Sarah Williams",
    role: "Creative Director",
    company: "Design Studio",
    avatar: "SW",
    stars: 5
  },
  {
    quote: "The minimalist approach cuts through the noise. I can focus on what matters: finding great projects and delivering my best work.",
    author: "Michael Chen",
    role: "UX Designer",
    company: "Freelance",
    avatar: "MC",
    stars: 4
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Professionals Worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from freelancers and clients who have transformed their work through our platform.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full glass">
                <CardContent className="p-6">
                  <StarRating rating={testimonial.stars} />
                  <blockquote className="text-lg mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
