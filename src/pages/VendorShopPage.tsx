import { useState, useMemo } from 'react';
import { sanitizeRichTextHtml } from '@/lib/sanitizeRichTextHtml';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProductsByVendor } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal, X, Store, CheckCircle, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { CURRENCY } from '@/types';
import { motion } from 'framer-motion';

const VendorShopPage = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { data, isLoading } = useProductsByVendor(vendorId || '');
  const { data: categories } = useCategories();

  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [activeFilter, setActiveFilter] = useState(false);

  const products = data?.products || [];
  const vendor = data?.vendor;

  // Get unique categories from vendor products
  const vendorCategories = useMemo(() => {
    if (!products || products.length === 0) return [];
    const categoryIds = new Set(products.map(p => p.category_id).filter(Boolean));
    return categories?.filter(c => categoryIds.has(c.id)) || [];
  }, [products, categories]);

  // Calculate min and max prices from products
  const { minPrice, maxPrice } = useMemo(() => {
    if (!products || products.length === 0) {
      return { minPrice: 0, maxPrice: 1000 };
    }
    const prices = products.map(p => p.promo_price ?? p.price);
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Initialize price range when products load
  useMemo(() => {
    if (!activeFilter && products && products.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice, products, activeFilter]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let result = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category_id === selectedCategory);
    }
    
    // Filter by price
    if (activeFilter) {
      result = result.filter(product => {
        const effectivePrice = product.promo_price ?? product.price;
        return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
      });
    }
    
    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.promo_price ?? a.price) - (b.promo_price ?? b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.promo_price ?? b.price) - (a.promo_price ?? a.price));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    return result;
  }, [products, priceRange, selectedCategory, sortBy, activeFilter]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setActiveFilter(true);
  };

  const clearFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedCategory('all');
    setSortBy('newest');
    setActiveFilter(false);
  };

  const activeFiltersCount = [
    activeFilter,
    selectedCategory !== 'all',
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <p className="text-muted-foreground">Chargement...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (!vendor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Boutique non trouvée</p>
          <Link to="/" className="btn-outline inline-block mt-6">
            Retour à l'accueil
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>
        </motion.div>

        {/* Vendor Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-xl p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {vendor.logo_url ? (
              <img
                src={vendor.logo_url}
                alt={vendor.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-primary/20"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center">
                <Store className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-serif font-medium">{vendor.name}</h1>
                {vendor.is_verified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Vérifié
                  </Badge>
                )}
              </div>
              
              {vendor.description && (
                <div className="text-muted-foreground mb-4 max-w-2xl prose prose-sm max-w-none [&_p]:my-0" dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(vendor.description) }} />
              )}
              
              <div className="flex flex-wrap gap-4 text-sm">
                {vendor.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{vendor.email}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{vendor.phone}</span>
                  </div>
                )}
                {(vendor.address_city || vendor.address_country) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {[vendor.address_city, vendor.address_country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-3xl font-bold text-primary">{products.length}</p>
              <p className="text-sm text-muted-foreground">produits</p>
            </div>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-stretch sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal size={16} />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1 text-muted-foreground"
              >
                <X size={16} />
                Effacer
              </Button>
            )}
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
              <SelectItem value="name">Nom A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-lg p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Filter */}
              <div>
                <h3 className="text-sm font-medium mb-4">Filtrer par prix</h3>
                <div className="space-y-4">
                  <Slider
                    min={minPrice}
                    max={maxPrice}
                    step={1}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Min:</span>
                      <span className="font-medium">{CURRENCY.format(priceRange[0])}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Max:</span>
                      <span className="font-medium">{CURRENCY.format(priceRange[1])}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              {vendorCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-4">Catégorie</h3>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {vendorCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Results count */}
        {products.length > 0 && (
          <p className="text-sm text-muted-foreground mb-6">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} 
            {activeFiltersCount > 0 && ` sur ${products.length}`}
          </p>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {activeFiltersCount > 0 
                ? 'Aucun produit ne correspond à vos critères' 
                : 'Cette boutique n\'a pas encore de produits'}
            </p>
            {activeFiltersCount > 0 && (
              <Button onClick={clearFilters} variant="outline" className="mt-4">
                Effacer les filtres
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VendorShopPage;
