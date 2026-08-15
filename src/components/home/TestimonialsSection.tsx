import { motion } from 'framer-motion';
import { useActiveTestimonials } from '@/hooks/useHomeSections';
import { Star, Quote } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = useActiveTestimonials();

  if (isLoading || !testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Ce Que Disent Nos Clients</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Découvrez les témoignages de notre communauté
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.slice(0, 3).map((testimonial) => (
            <motion.div key={testimonial.id} variants={itemVariants}>
              <div className="testimonial-card h-full">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-accent fill-accent'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground/80 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 mt-auto">
                  {testimonial.customer_avatar ? (
                    <img
                      src={testimonial.customer_avatar}
                      alt={testimonial.customer_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {testimonial.customer_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.customer_name}
                    </p>
                    {testimonial.customer_role && (
                      <p className="text-sm text-muted-foreground">
                        {testimonial.customer_role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
