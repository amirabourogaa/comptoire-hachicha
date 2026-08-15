import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { CategoryBanner } from '@/components/home/CategoryBanner';
import { FlashSale } from '@/components/home/FlashSale';
import { AboutSection } from '@/components/home/AboutSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { StatsSection } from '@/components/home/StatsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { PartnersSection } from '@/components/home/PartnersSection';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';

const Index = () => {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: sections, isLoading: sectionsLoading } = useSectionVisibility();

  const isSectionEnabled = (sectionId: string) => {
    const section = sections?.find(s => s.id === sectionId);
    return section?.enabled ?? true;
  };

  // Afficher un loader global pendant le chargement initial
  if (sectionsLoading || (productsLoading && !products)) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Loader2 size={48} className="text-primary" />
            </motion.div>
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="space-y-2"
            >
              <p className="text-lg font-medium text-foreground">Chargement</p>
              <p className="text-sm text-muted-foreground">Préparation de votre expérience...</p>
            </motion.div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      {isSectionEnabled('hero') && <Hero />}
      
      {/* Features Section - Avantages */}
      {isSectionEnabled('features') && <FeaturesSection />}
      
      {/* Flash Sales */}
      {isSectionEnabled('flash_sale') && <FlashSale />}
      
      {/* Stats Section - Chiffres clés */}
      {isSectionEnabled('stats') && <StatsSection />}
      
      {/* Category Banners */}
      {isSectionEnabled('categories') && <CategoryBanner />}
      
      {/* Testimonials Section */}
      {isSectionEnabled('testimonials') && <TestimonialsSection />}
      
      {/* About Section */}
      {isSectionEnabled('about') && <AboutSection />}
      
      {/* Partners Section */}
      {isSectionEnabled('partners') && <PartnersSection />}
      
      {/* Products Section */}
      {isSectionEnabled('products') && (
        <section className="container mx-auto px-4 py-20 md:py-28">
          {productsLoading ? (
            <div className="text-center py-20">
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground font-medium">Chargement des produits...</span>
              </motion.div>
            </div>
          ) : products && products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-16">
                <h2 className="section-title mb-4">Nos Produits</h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  Découvrez notre sélection de pièces exceptionnelles
                </p>
              </div>
              <ProductGrid products={products.slice(0, 8)} />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <Link 
                  to="/products" 
                  className="btn-outline inline-flex items-center gap-3 group"
                >
                  Voir tous les produits
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full glass-card">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium tracking-widest uppercase text-primary">
                  Bienvenue
                </span>
              </div>
              <h2 className="section-title mb-6">Commencez votre aventure</h2>
              <p className="text-muted-foreground mb-10 max-w-md mx-auto">
                Ajoutez des produits via l'espace admin pour commencer à vendre
              </p>
              <a href="/admin" className="btn-primary inline-block">
                Accéder à l'admin
              </a>
            </motion.div>
          )}
        </section>
      )}
    </Layout>
  );
};

export default Index;