import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, X, Grid, LayoutGrid, Search, Package } from 'lucide-react';
import { CURRENCY } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: products, isLoading } = useProducts(slug);
  const { data: categories } = useCategories();

  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const category = categories?.find((c) => c.slug === slug);
  const categoryImage = category?.image_url || null;

  const subCategories = useMemo(() => {
    if (!category || !categories) return [];
    return categories.filter(c => c.parent_id === category.id);
  }, [category, categories]);

  const { minPrice, maxPrice } = useMemo(() => {
    if (!products || products.length === 0) return { minPrice: 0, maxPrice: 10000 };
    const prices = products.map(p => p.promo_price ?? p.price);
    return { minPrice: Math.floor(Math.min(...prices)), maxPrice: Math.ceil(Math.max(...prices)) };
  }, [products]);

  useMemo(() => {
    if (!activeFilter && products && products.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice, products, activeFilter]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.title.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query)
      );
    }

    if (selectedSubCategory !== 'all') {
      result = result.filter(product => product.category_id === selectedSubCategory);
    }

    if (activeFilter) {
      result = result.filter(product => {
        const effectivePrice = product.promo_price ?? product.price;
        return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
      });
    }

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => (a.promo_price ?? a.price) - (b.promo_price ?? b.price)); break;
      case 'price-desc': result.sort((a, b) => (b.promo_price ?? b.price) - (a.promo_price ?? a.price)); break;
      case 'name-asc': result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'name-desc': result.sort((a, b) => b.title.localeCompare(a.title)); break;
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
    }

    return result;
  }, [products, priceRange, activeFilter, selectedSubCategory, sortBy, searchQuery]);

  const handlePriceChange = (values: number[]) => { setPriceRange([values[0], values[1]]); setActiveFilter(true); };
  const clearFilters = () => { setPriceRange([minPrice, maxPrice]); setActiveFilter(false); setSelectedSubCategory('all'); setSortBy('newest'); setSearchQuery(''); };
  const hasActiveFilters = activeFilter || selectedSubCategory !== 'all' || searchQuery.trim() !== '';

  return (
    <Layout>
      {/* Hero Banner with optional cover image - MODIFIÉ : ajout de pt-20 */}
      {categoryImage ? (
        <div
          className="relative w-full min-h-[260px] md:min-h-[340px] flex items-center justify-center overflow-hidden pt-20 md:pt-24"
          style={{ backgroundImage: `url(${categoryImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-3 tracking-wide drop-shadow-lg">
                {category?.name || 'Catégorie'}
              </h1>
              <p className="text-white/70 text-base md:text-lg max-w-md mx-auto">
                Explorez notre sélection {category?.name ? `de ${category.name}` : ''}
              </p>
            </motion.div>
          </div>
        </div>
      ) : (
        // Version sans image - MODIFIÉ : ajout de pt-20 et background avec la couleur #2d2e34
        <div 
          className="relative w-full overflow-hidden pt-20 md:pt-24"
          style={{ backgroundColor: '#2d2e34' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gold/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-16 h-0.5 bg-gold mx-auto mb-4" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white/70 mb-3 tracking-wide">
                {category?.name || 'Catégorie'}
              </h1>
              <p className="text-white/70 text-base md:text-lg max-w-md mx-auto">
                Explorez notre sélection {category?.name ? `de ${category.name}` : ''}
              </p>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="w-24 h-0.5 bg-gold/50 mx-auto mt-4" />
            </motion.div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pt-10 pb-12">
        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input type="text" placeholder="Rechercher dans cette catégorie..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 pr-4 py-6 text-base" />
          </div>
        </motion.div>

        {/* Filter Controls */}
        {/* <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <SlidersHorizontal size={18} /> Filtres
              {hasActiveFilters && <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{[activeFilter, selectedSubCategory !== 'all', searchQuery.trim() !== ''].filter(Boolean).length}</span>}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <X size={16} /> Réinitialiser
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setGridCols(3)} className={`p-2 rounded ${gridCols === 3 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}><LayoutGrid size={18} /></button>
              <button onClick={() => setGridCols(4)} className={`p-2 rounded ${gridCols === 4 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}><Grid size={18} /></button>
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Trier par" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="name-asc">Nom A-Z</SelectItem>
                <SelectItem value="name-desc">Nom Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div> */}

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subCategories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-4">Sous-catégorie</h3>
                      <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                        <SelectTrigger><SelectValue placeholder="Toutes les sous-catégories" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          {subCategories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {/* <div className={subCategories.length > 0 ? 'md:col-span-1 lg:col-span-2' : 'md:col-span-2 lg:col-span-3'}>
                    <h3 className="text-sm font-medium mb-4">Filtrer par prix</h3>
                    <div className="space-y-4">
                      <Slider min={minPrice} max={maxPrice} step={1} value={priceRange} onValueChange={handlePriceChange} className="w-full" />
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><span className="text-muted-foreground">Min:</span><span className="font-medium">{CURRENCY.format(priceRange[0])}</span></div>
                        <div className="flex items-center gap-2"><span className="text-muted-foreground">Max:</span><span className="font-medium">{CURRENCY.format(priceRange[1])}</span></div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {products && products.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground mb-6">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} {hasActiveFilters && ` sur ${products.length}`}
          </motion.p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-secondary rounded-t-xl" />
                <div className="p-5 bg-card rounded-b-xl space-y-3">
                  <div className="h-5 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <div className={`grid grid-cols-2 ${gridCols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'} gap-4 md:gap-6`}>
              {filteredProducts.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">Aucun produit trouvé</p>
                <p className="text-sm text-muted-foreground/70 mb-6">
                  {hasActiveFilters ? 'Aucun produit ne correspond à vos critères de recherche' : 'Aucun produit dans cette catégorie pour le moment'}
                </p>
                {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Réinitialiser les filtres</Button>}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;