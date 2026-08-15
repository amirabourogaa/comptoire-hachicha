import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useCollectionCategories } from '@/hooks/useCategories';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const fallbackImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80';

export function CategoryBanner() {
  const { data: categories, isLoading } = useCollectionCategories();

  if (isLoading || !categories || categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-20 md:py-32 bg-gradient-to-b from-background to-background/50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16 md:mb-20"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Collection Exclusive</span>
        </motion.div>
        
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Nos Catégories
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Découvrez notre univers et trouvez les produits qui vous ressemblent.
        </p>
      </motion.div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
      >
       {categories.map((category, index) => (
  <motion.div 
    key={category.slug} 
    variants={itemVariants}
    custom={index}
    whileHover={{ y: -8 }}
    transition={{ duration: 0.3 }}
    className="group"
  >
    <Link
      to={`/category/${category.slug}`}
      className="block bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      {/* Conteneur image avec dimensions réelles */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
        <motion.img
          src={category.image_url || fallbackImage}
          alt={category.name}
          className="w-full h-auto object-contain"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          loading="lazy"
          style={{ 
            display: 'block',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
        
        {/* Badge flottant */}
        {category.description && (
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-white tracking-wide">
                {category.description}
              </span>
            </div>
          </div>
        )}
        
        {/* Effet de brillance */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
      
      {/* Contenu carte */}
      <div className="p-6 md:p-8">
        <div className="text-center">
          {/* Icône décorative */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
            <div className="w-6 h-6 rounded-full bg-primary/30 group-hover:bg-primary/40 transition-colors duration-300" />
          </div>
          
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
            {category.name}
          </h3>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-2">
            {category.description || `Découvrez notre sélection de ${category.name.toLowerCase()} de qualité exceptionnelle.`}
          </p>
          
          {/* Lien avec animation */}
          <div className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all duration-300">
            <span className="text-sm tracking-wide">Explorer</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
          </div>
        </div>
        
        {/* Ligne décorative */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </Link>
  </motion.div>
))}
      </motion.div>
    </section>
  );
}