import { useState, useEffect, useMemo } from 'react';
import { sanitizeRichTextHtml } from '@/lib/sanitizeRichTextHtml';
import { useParams, Link } from 'react-router-dom';
import { 
  Minus, Plus, ShoppingBag, ArrowLeft, ChevronLeft, ChevronRight, 
  Heart, Share2, Check, Truck, RotateCcw, Shield, Store, CheckCircle, 
  Eye, Sparkles, Star, Package, Gift, Award, BadgeCheck, Zap,
  Clock, Info, Ruler, Droplet, Leaf, Recycle, Factory, ThumbsUp,
  Home, ChevronRight as ChevronRightIcon, Tag, TrendingUp, AlertCircle,
  Calendar, Users, ThumbsUp as ThumbsUpIcon, Award as AwardIcon
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useProductSizes, useProductColors } from '@/hooks/useProductVariants';
import { useProductAttributes } from '@/hooks/useProductAttributes';
import { useCart } from '@/contexts/CartContext';
import { CURRENCY } from '@/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/products/ProductCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { VendorInfoDialog } from '@/components/products/VendorInfoDialog';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id || '');
  const { data: sizes } = useProductSizes(id || '');
  const { data: colors } = useProductColors(id || '');
  const { data: customAttributes } = useProductAttributes(id || '');
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false); // Gardé pour l'icône Heart

  // Fetch related products from same category
  const { data: relatedProducts } = useProducts(product?.category?.slug);

  // Build images array including color images
  const productImages = product?.images?.length ? product.images : (product?.image_url ? [product.image_url] : []);
  const colorImages = colors?.map(c => c.image_url) || [];
  const allImages = [...productImages, ...colorImages.filter(img => !productImages.includes(img))];

  // Update main image when color is selected
  useEffect(() => {
    if (selectedColor && colors) {
      const color = colors.find(c => c.id === selectedColor);
      if (color) {
        const colorImageIndex = allImages.indexOf(color.image_url);
        if (colorImageIndex !== -1) {
          setCurrentImageIndex(colorImageIndex);
        }
      }
    }
  }, [selectedColor, colors, allImages]);

  // Compute dynamic price based on selected attributes
  const computedPrice = useMemo(() => {
    const basePrice = product?.promo_price ?? product?.price ?? 0;
    if (customAttributes && customAttributes.length > 0) {
      const selectedValues = Object.values(selectedAttributes)
        .map(valId => {
          for (const attr of customAttributes) {
            const found = attr.values?.find(v => v.id === valId);
            if (found) return found;
          }
          return null;
        })
        .filter(Boolean);
      
      // Use specific price from attribute if available
      const attrWithPrice = selectedValues.find(v => v && (v as any).price != null && (v as any).price > 0);
      if (attrWithPrice) return (attrWithPrice as any).price;
      
      // Otherwise use base price + adjustments
      const adjustment = selectedValues.reduce((sum, v) => sum + ((v as any)?.price_adjustment || 0), 0);
      return basePrice + adjustment;
    }
    return basePrice;
  }, [product, customAttributes, selectedAttributes]);

  // Check if all required attributes are selected
  const allAttributesSelected = useMemo(() => {
    if (!customAttributes || customAttributes.length === 0) return true;
    return customAttributes.every(attr => selectedAttributes[attr.id]);
  }, [customAttributes, selectedAttributes]);

  // Get stock for selected attributes
  const selectedStock = useMemo(() => {
    if (!customAttributes || customAttributes.length === 0) return null;
    const selectedValues = Object.values(selectedAttributes)
      .map(valId => {
        for (const attr of customAttributes || []) {
          const found = attr.values?.find(v => v.id === valId);
          if (found) return found;
        }
        return null;
      })
      .filter(Boolean);
    if (selectedValues.length === 0) return null;
    return Math.min(...selectedValues.map(v => (v as any)?.stock ?? 0));
  }, [customAttributes, selectedAttributes]);

  const handleAddToCart = () => {
    if (product) {
      // Require attribute selection for variable products
      if (product.product_type === 'variable' && customAttributes && customAttributes.length > 0) {
        const missingAttrs = customAttributes.filter(attr => !selectedAttributes[attr.id]);
        if (missingAttrs.length > 0) {
          toast.error(`Veuillez sélectionner : ${missingAttrs.map(a => a.name).join(', ')}`);
          return;
        }
      }
      if (sizes && sizes.length > 0 && !selectedSize) {
        toast.error('Veuillez sélectionner une taille');
        return;
      }

      // Build selected attribute values for cart
      const selectedAttrValues: Record<string, import('@/types').ProductAttributeValue> = {};
      if (customAttributes) {
        for (const attr of customAttributes) {
          const valId = selectedAttributes[attr.id];
          if (valId) {
            const val = attr.values?.find(v => v.id === valId);
            if (val) selectedAttrValues[attr.id] = val;
          }
        }
      }

      addItem(product, quantity, Object.keys(selectedAttrValues).length > 0 ? selectedAttrValues : undefined);
      setIsAddedToCart(true);
      toast.success('Produit ajouté au panier');
      setTimeout(() => setIsAddedToCart(false), 2000);
    }
  };

  const descriptionHtml = useMemo(
    () => sanitizeRichTextHtml(product?.description ?? ''),
    [product?.description]
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center gap-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            />
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-muted-foreground"
            >
              Chargement du produit...
            </motion.p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-destructive/10 rounded-full flex items-center justify-center">
              <Package size={40} className="text-destructive" />
            </div>
            <h1 className="font-serif text-2xl mb-3">Produit non trouvé</h1>
            <p className="text-muted-foreground mb-8">
              Le produit que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Link 
              to="/" 
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-4 text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center gap-2">
                Retour à l'accueil
              </span>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const filteredRelatedProducts = relatedProducts?.filter(p => p.id !== product.id).slice(0, 4) || [];
  
  const discountPercent = product.promo_price !== null && product.promo_price < product.price 
    ? Math.round(((product.price - product.promo_price) / product.price) * 100) 
    : null;

  // Statistiques produit alternatives
  const productStats = [
    { label: 'Note moyenne', value: '4.8/5', icon: Star },
    { label: 'Avis clients', value: '156', icon: Users },
    { label: 'Meilleure vente', value: 'Top 10', icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Page Title Section avec Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Breadcrumb amélioré */}
          <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <Link 
                to="/" 
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors group"
              >
                <Home size={16} className="group-hover:scale-110 transition-transform" />
                <span>Accueil</span>
              </Link>
            </motion.div>
            
            <ChevronRightIcon size={14} className="text-muted-foreground/50" />
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <Link 
                to="/products" 
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors group"
              >
                <Tag size={16} className="group-hover:scale-110 transition-transform" />
                <span>Produits</span>
              </Link>
            </motion.div>
            
            {product.category && (
              <>
                <ChevronRightIcon size={14} className="text-muted-foreground/50" />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center"
                >
                  <Link 
                    to={`/category/${product.category.slug}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {product.category.name}
                  </Link>
                </motion.div>
              </>
            )}
            
            <ChevronRightIcon size={14} className="text-muted-foreground/50" />
            
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-foreground font-medium truncate max-w-[200px]"
              title={product.title}
            >
              {product.title}
            </motion.span>
          </nav>

          {/* Page Title avec badges et stats */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 border border-primary/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,67,233,0.1),transparent_50%)]" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-serif text-2xl md:text-3xl lg:text-4xl font-light mb-2"
                >
                  <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {product.title}
                  </span>
                </motion.h1>
                
                {/* Badges dynamiques sans info de stock */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap items-center gap-2"
                >
                  {product.is_flash_sale && (
                    <span className="inline-flex items-center gap-1 bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-medium border border-destructive/20">
                      <Zap size={12} />
                      Flash Sale
                    </span>
                  )}
                  {discountPercent && (
                    <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-xs font-medium border border-orange-500/20">
                      <Tag size={12} />
                      -{discountPercent}%
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                    <AwardIcon size={12} />
                    Nouvelle collection
                  </span>
                  <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/20">
                    <ThumbsUpIcon size={12} />
                    Coup de cœur
                  </span>
                </motion.div>
              </div>

              {/* Stats rapides alternatives */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4"
              >
                {productStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -2 }}
                    className="flex items-center gap-2 px-3 py-2 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50"
                  >
                    <stat.icon size={16} className="text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-sm font-medium">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Barre de progression de popularité */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 origin-left"
              style={{ width: '85%' }}
            />
          </div>
        </motion.div>

        {/* Navigation alternative (gardée pour compatibilité) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 hidden"
        >
          <Link
            to={product.category ? `/category/${product.category.slug}` : '/'}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-all group relative overflow-hidden px-4 py-2 rounded-lg hover:bg-muted/50"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="relative">
              Retour à la catégorie
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
            </span>
          </Link>
        </motion.div>

        {/* Badge de promotion en haut (déplacé dans la section title) */}
        {discountPercent && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 hidden"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground px-4 py-2 rounded-full text-sm font-medium">
              <Zap size={16} />
              Promotion -{discountPercent}%
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images - avec design moderne */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full"
          >
            <ProductImageGallery 
              images={allImages}
              productTitle={product.title}
              currentIndex={currentImageIndex}
              onIndexChange={setCurrentImageIndex}
              discountPercent={discountPercent}
              isFlashSale={product.is_flash_sale}
            />
          </motion.div>

          {/* Product Info - avec design moderne enrichi */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Vendor Info - design amélioré */}
            {product.vendor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="relative overflow-hidden mb-6"
              >
                <div className="relative bg-gradient-to-r from-card via-card to-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-all group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {product.vendor.logo_url ? (
                          <img 
                            src={product.vendor.logo_url} 
                            alt={product.vendor.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-colors"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-2 border-primary/20">
                            <Store className="w-6 h-6 text-primary/40" />
                          </div>
                        )}
                        {product.vendor.is_verified && (
                          <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-card">
                            <BadgeCheck className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-base">{product.vendor.name}</span>
                          {product.vendor.is_verified && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Vérifié
                            </span>
                          )}
                        </div>
                        {product.vendor.address_city && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Store size={14} />
                            {product.vendor.address_city}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVendorDialog(true)}
                      className="gap-2 rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Eye className="w-4 h-4" />
                      Voir boutique
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Prix avec design moderne */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              {product.promo_price !== null && product.promo_price < product.price && !Object.keys(selectedAttributes).length ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <p className="text-4xl font-medium bg-gradient-to-r from-destructive to-destructive/80 bg-clip-text text-black">
                      {CURRENCY.format(computedPrice)}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xl text-muted-foreground line-through">
                      {CURRENCY.format(product.price)}
                    </p>
                    <span className="bg-destructive/10 text-destructive text-sm font-bold px-3 py-1 rounded-full">
                      -{discountPercent}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-4xl font-light bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {CURRENCY.format(computedPrice)}
                </p>
              )}
              {/* Show selected attribute reference */}
              {Object.values(selectedAttributes).length > 0 && customAttributes && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(selectedAttributes).map(([attrId, valId]) => {
                    const attr = customAttributes.find(a => a.id === attrId);
                    const val = attr?.values?.find(v => v.id === valId);
                    if (!val) return null;
                    return (
                      <span key={attrId} className="text-xs bg-muted px-2 py-1 rounded">
                        {attr?.name}: {val.value}
                        {(val as any).reference && <span className="ml-1 text-muted-foreground">(Réf: {(val as any).reference})</span>}
                      </span>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Description avec style amélioré */}
            {product.description && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="prose prose-sm max-w-none mb-8 p-4 bg-muted/20 rounded-xl border border-border/50"
              >
                <div 
                  className="text-muted-foreground leading-relaxed [&_strong]:font-bold [&_span]:inline [&_p]:mb-2"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </motion.div>
            )}

            {/* Colors Selector - design amélioré */}
            {colors && colors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium tracking-wide flex items-center gap-2">
                    <Droplet size={16} className="text-primary" />
                    Couleur
                  </span>
                  {selectedColor && colors.find(c => c.id === selectedColor) && (
                    <span className="text-sm text-muted-foreground">
                      {colors.find(c => c.id === selectedColor)?.color_name}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <motion.button
                      key={color.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedColor(color.id)}
                      className={`relative w-14 h-14 rounded-full transition-all ${
                        selectedColor === color.id
                          ? 'ring-2 ring-primary ring-offset-4 ring-offset-background scale-110'
                          : 'hover:ring-2 hover:ring-primary/30 hover:ring-offset-2'
                      }`}
                      style={{ backgroundColor: color.color_code || '#000' }}
                      title={color.color_name}
                    >
                      {selectedColor === color.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Check size={18} className={color.color_code && color.color_code.toLowerCase() !== '#ffffff' ? 'text-white' : 'text-foreground'} />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Sizes Selector - design amélioré */}
            {sizes && sizes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium tracking-wide flex items-center gap-2">
                    <Ruler size={16} className="text-primary" />
                    Taille
                  </span>
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Info size={12} />
                    Guide des tailles
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <motion.button
                      key={size.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSize(size.id)}
                      disabled={size.stock === 0}
                      className={`relative min-w-[64px] px-5 py-3 border-2 text-sm font-medium transition-all rounded-xl ${
                        selectedSize === size.id
                          ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : size.stock === 0
                          ? 'border-border text-muted-foreground opacity-50 cursor-not-allowed line-through bg-muted/30'
                          : 'border-border hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      {size.size}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Custom Attributes Selector - design amélioré */}
            {customAttributes && customAttributes.length > 0 && customAttributes.map((attr) => (
              <motion.div
                key={attr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium tracking-wide flex items-center gap-2">
                    <Gift size={16} className="text-primary" />
                    {attr.name}
                  </span>
                  {selectedAttributes[attr.id] && attr.values && (
                    <span className="text-sm text-muted-foreground">
                      {attr.values.find(v => v.id === selectedAttributes[attr.id])?.value}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {attr.values?.map((val) => (
                    <motion.button
                      key={val.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedAttributes(prev => ({ ...prev, [attr.id]: val.id }));
                        if (val.image_url) {
                          const idx = allImages.indexOf(val.image_url);
                          if (idx !== -1) setCurrentImageIndex(idx);
                        }
                      }}
                      disabled={val.stock === 0}
                      className={`px-5 py-3 border-2 text-sm font-medium transition-all rounded-xl flex items-center gap-2 ${
                        selectedAttributes[attr.id] === val.id
                          ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : val.stock === 0
                          ? 'border-border text-muted-foreground opacity-50 cursor-not-allowed line-through bg-muted/30'
                          : 'border-border hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      {val.color_code && (
                        <span
                          className="w-5 h-5 rounded-full border-2 border-border/50"
                          style={{ backgroundColor: val.color_code }}
                        />
                      )}
                      {val.value}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Quantity Selector - design amélioré */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-6 mb-8 p-4 bg-muted/20 rounded-xl border border-border/50"
            >
              <span className="text-sm font-medium tracking-wide flex items-center gap-2">
                <Package size={16} className="text-primary" />
                Quantité
              </span>
              <div className="flex items-center bg-background rounded-lg overflow-hidden border border-border">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-muted transition-colors border-r border-border"
                >
                  <Minus size={18} />
                </motion.button>
                <motion.span 
                  key={quantity}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="w-16 text-center font-medium text-lg"
                >
                  {quantity}
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-muted transition-colors border-l border-border"
                >
                  <Plus size={18} />
                </motion.button>
              </div>
              <span className="text-xs text-muted-foreground">
                {selectedStock !== null ? (selectedStock > 0 ? `${selectedStock} disponibles` : 'Stock épuisé') : 'En stock'}
              </span>
            </motion.div>

            {/* Action Buttons - design moderne - MODIFIÉ : icône de partage supprimée */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex gap-3 mb-8"
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart} 
                className={`relative flex-1 flex items-center justify-center gap-3 py-5 rounded-xl font-medium text-lg overflow-hidden transition-all ${
                  isAddedToCart 
                    ? 'bg-success hover:bg-success text-success-foreground' 
                    : 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-[0_10px_30px_-10px_rgba(120,67,233,0.5)]'
                }`}
              >
                <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center gap-3">
                  {isAddedToCart ? (
                    <>
                      <Check size={22} className="animate-bounce" />
                      Ajouté !
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={22} />
                      Ajouter au panier
                    </>
                  )}
                </span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-5 border-2 rounded-xl transition-all ${
                  isFavorite 
                    ? 'border-destructive bg-destructive/10 text-destructive' 
                    : 'border-border hover:border-destructive/50 hover:bg-destructive/5'
                }`}
              >
                <Heart size={22} className={isFavorite ? 'fill-destructive' : ''} />
              </motion.button>
            </motion.div>

            {/* Trust Badges - design moderne */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-border"
            >
              {[
                { icon: Truck, label: 'Livraison gratuite', sublabel: 'Dès 200TND' },
                { icon: RotateCcw, label: 'Retour 30 jours', sublabel: 'Satisfait ou remboursé' },
                { icon: Shield, label: 'Paiement sécurisé', sublabel: 'SSL 256 bits' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-center text-center gap-2 p-3 rounded-lg hover:bg-muted/30 transition-all"
                >
                  <div className="p-2 bg-primary/5 rounded-full">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-medium block">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground">{item.sublabel}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Eco badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1">
                <Leaf size={14} className="text-green-500" /> Éco-responsable
              </span>
              <span className="flex items-center gap-1">
                <Recycle size={14} className="text-blue-500" /> Recyclable
              </span>
              <span className="flex items-center gap-1">
                <Factory size={14} className="text-purple-500" /> Fabrication locale
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Product Details Tabs - design moderne */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-6">
              {['description', 'details', 'shipping', 'reviews'].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab} 
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3 text-base font-medium capitalize hover:text-primary transition-colors"
                >
                  {tab === 'description' && 'Description'}
                  {tab === 'details' && 'Détails & caractéristiques'}
                  {tab === 'shipping' && 'Livraison & retours'}
                  {/* {tab === 'reviews' && 'Avis clients'} */}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="description" className="pt-6">
              <div className="bg-gradient-to-br from-card to-card/50 p-6 rounded-2xl border border-border/50">
                <div 
                  className="text-muted-foreground leading-relaxed prose prose-sm max-w-3xl [&_strong]:font-bold [&_span]:inline [&_ul]:list-disc [&_ul]:pl-4"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="pt-6">
              <div className="bg-gradient-to-br from-card to-card/50 p-6 rounded-2xl border border-border/50">
                {(product as any).specs_pdf_url && (
                  <div className="mb-6">
                    <a 
                      href={(product as any).specs_pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group inline-flex items-center gap-3 px-6 py-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all border border-primary/20"
                    >
                      <div className="p-2 bg-primary/20 rounded-lg group-hover:scale-110 transition-transform">
                        <Package size={20} />
                      </div>
                      <div>
                        <span className="font-medium">📄 Fiche technique (PDF)</span>
                        <p className="text-xs text-muted-foreground">Téléchargez les spécifications détaillées</p>
                      </div>
                    </a>
                  </div>
                )}
                
                {(product as any).details_content ? (
                  <div 
                    className="text-muted-foreground leading-relaxed prose prose-sm max-w-none [&_strong]:font-bold [&_span]:inline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml((product as any).details_content) }}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">Aucun détail disponible pour ce produit.</p>
                )}
              </div>
            </TabsContent>
            
           <TabsContent value="shipping" className="pt-6">
  <div className="bg-gradient-to-br from-card to-card/50 p-6 rounded-2xl border border-border/50">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Truck size={20} className="text-primary" />
          </div>
          <h3 className="font-medium">Livraison</h3>
        </div>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-center gap-2">
            <Check size={14} className="text-green-500" />
            Livraison standard : 3-5 jours ouvrés
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="text-green-500" />
            Livraison express : 1-2 jours ouvrés
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="text-green-500" />
            Livraison gratuite dès 200TND
          </li>
        </ul>
      </div>
      
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <RotateCcw size={20} className="text-primary" />
          </div>
          <h3 className="font-medium">Retours</h3>
        </div>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-center gap-2">
            <Check size={14} className="text-green-500" />
            Retours gratuits sous 7 jours
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="text-green-500" />
            Échanges en boutique
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="text-green-500" />
            Remboursement sous 7 jours
          </li>
        </ul>
      </div>
    </div>
  </div>
</TabsContent>
         
          </Tabs>
        </motion.div>

        {/* Related Products - design moderne */}
        {filteredRelatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="font-serif text-3xl md:text-4xl font-light mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
              >
                Vous aimerez aussi
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground"
              >
                Découvrez des produits similaires dans la même catégorie
              </motion.p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {filteredRelatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <ProductCard product={relatedProduct} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Vendor Dialog */}
      <VendorInfoDialog
        vendor={product?.vendor || null}
        open={showVendorDialog}
        onOpenChange={setShowVendorDialog}
      />
    </Layout>
  );
};

export default ProductPage;