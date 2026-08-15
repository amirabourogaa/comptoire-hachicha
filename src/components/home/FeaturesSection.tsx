import { motion } from 'framer-motion';
import { useActiveFeatures } from '@/hooks/useHomeSections';
import { sanitizeRichTextHtml } from '@/lib/sanitizeRichTextHtml';
import { Truck, Shield, RefreshCw, Headphones, Star, Package, Award, Heart, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'truck': Truck,
  'shield': Shield,
  'refresh-cw': RefreshCw,
  'headphones': Headphones,
  'star': Star,
  'package': Package,
  'award': Award,
  'heart': Heart,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function FeaturesSection() {
  const { data: features, isLoading } = useActiveFeatures();

  if (isLoading || !features || features.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-secondary/20 to-transparent" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235B4C3A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Decorative elements */}
      <motion.div 
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-primary/60" />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary">
              Excellence
            </span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </motion.div>
          
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium mb-5 text-foreground">
            Pourquoi Nous <span className="gradient-text-gold">Choisir</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
            Des avantages exclusifs pour une expérience d'achat exceptionnelle
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Star;
            
            return (
              <motion.div 
                key={feature.id} 
                variants={itemVariants}
                className="group"
              >
                <div className="relative h-full p-8 lg:p-10 bg-card/80 backdrop-blur-sm rounded-3xl border border-border/50 transition-all duration-500 hover:border-primary/40 hover:shadow-elevated overflow-hidden">
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Number indicator */}
                  <span className="absolute top-6 right-6 text-7xl font-serif font-bold text-primary/[0.06] select-none transition-all duration-500 group-hover:text-primary/[0.12]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  
                  {/* Icon */}
                  <div className="relative mb-8">
                    <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg group-hover:shadow-gold transition-shadow duration-500" />
                      <IconComponent className="relative w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute -inset-2 rounded-3xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative">
                    <h3 className="font-serif text-xl lg:text-2xl font-medium mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <div
                      className="text-muted-foreground text-sm lg:text-base leading-relaxed prose prose-sm max-w-none [&_p]:my-0"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(feature.description || '') }}
                    />
                  </div>
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-8 right-8 h-1 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary via-accent to-primary"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                      viewport={{ once: true }}
                      style={{ transformOrigin: 'left' }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
