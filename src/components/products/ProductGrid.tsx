import { motion } from 'framer-motion';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';
import { useCart } from '@/contexts/CartContext'; // Import du hook useCart
import { toast } from 'sonner'; // Pour les notifications

interface ProductGridProps {
  products: Product[];
  title?: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ProductGrid({ products, title }: ProductGridProps) {
  const { addItem } = useCart(); // Utilisation du hook useCart

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    try {
      // Ajout du produit au panier
      addItem(product, quantity);
      
      // Notification de succès
      toast.success(`${product.title} ajouté au panier !`, {
        duration: 2000,
        position: 'bottom-right',
        icon: '🛒',
      });
    } catch (error) {
      // Notification d'erreur
      toast.error("Erreur lors de l'ajout au panier", {
        duration: 2000,
        position: 'bottom-right',
      });
      console.error('Erreur ajout panier:', error);
    }
  };

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 lg:py-24 gap-3 sm:gap-4"
      >
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-xl sm:rounded-2xl border border-border/50 bg-muted/30">
          <PackageOpen className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <p className="text-xs sm:text-sm font-medium tracking-wide text-muted-foreground">
          Aucun produit disponible
        </p>
      </motion.div>
    );
  }

  return (
    <section className="relative px-3 sm:px-4 md:px-6 lg:px-0">
      {/* ── Title ── */}
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 sm:mb-10 md:mb-12 text-center"
        >
          {/* Ornament */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent to-primary/40" />
            <span className="h-1 w-1 rounded-full bg-primary/50" />
            <div className="h-px w-6 sm:w-8 bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground px-2">
            {title}
          </h2>

          {/* Underline accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-2 sm:mt-3 h-[2px] w-10 sm:w-12 origin-center bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </motion.div>
      )}

      {/* ── Grid Responsive ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="
          grid 
          gap-3 sm:gap-4 md:gap-5 lg:gap-6
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4
        "
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard 
              product={product} 
              onAddToCart={handleAddToCart}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}