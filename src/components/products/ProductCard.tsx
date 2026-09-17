import { Link, useNavigate } from 'react-router-dom';
import { Product, CURRENCY } from '@/types';
import { motion } from 'framer-motion';
import { Eye, Zap, Store, CheckCircle, Heart, ShoppingBag, Star, Package, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VendorInfoDialog } from './VendorInfoDialog';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0] || product.image_url;
  const secondImage = product.images?.[1];
  const [isHovered, setIsHovered] = useState(false);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [secondImageError, setSecondImageError] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const hasPromo = product.promo_price !== null && product.promo_price < product.price;
  const discountPercent = hasPromo
    ? Math.round(((product.price - product.promo_price!) / product.price) * 100)
    : 0;

  // Valeurs par défaut pour la démo
  const rating = (product as any).rating || (Math.random() * 2 + 3).toFixed(1);
  const reviewCount = (product as any).review_count || Math.floor(Math.random() * 200) + 10;
  const stock = (product as any).stock ?? 10;
  const unit = (product as any).unit || 'pièce';

  const getPlainText = (html: string) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const rawDescription =
    product.description ||
    (product as any).short_description ||
    (product as any).excerpt ||
    '';
  const description = getPlainText(rawDescription);

  const handleDownloadSpecs = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.specs_pdf_url) {
      window.open(product.specs_pdf_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleVendorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowVendorDialog(true);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  // ✅ Ajoute réellement au panier
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  // ✅ Acheter = ajouter au panier + aller au panier
  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    navigate('/cart');
  };

  return (
    <>
      <Link
        to={`/product/${product.id}`}
        className="block group rounded-2xl overflow-hidden bg-card border border-border/40 hover:shadow-xl transition-all duration-300"
      >
        <motion.div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {/* Image */}
          <div className="relative w-full aspect-square bg-muted/30 overflow-hidden">
            {mainImage && !imageError ? (
              <>
                <img
                  src={mainImage}
                  alt={product.title}
                  loading="lazy"
                  onError={() => setImageError(true)}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    isHovered && secondImage && !secondImageError ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                {secondImage && !secondImageError && (
                  <img
                    src={secondImage}
                    alt={product.title}
                    loading="lazy"
                    onError={() => setSecondImageError(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                Pas d'image
              </div>
            )}

            {/* Discount Badge */}
            {hasPromo && (
              <span className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground text-[11px] font-bold px-2.5 py-1 rounded-full">
                -{discountPercent}%
              </span>
            )}

            {/* Flash Sale Badge */}
            {product.is_flash_sale && (
              <span className="absolute top-3 left-3 z-10 mt-7 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                <Zap className="w-3 h-3" />
                FLASH
              </span>
            )}

            {/* Like */}
            <button
              onClick={handleLike}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-background/80 backdrop-blur-md border border-border/30 flex items-center justify-center hover:bg-background transition"
              aria-label="Ajouter aux favoris"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
            </button>

            {/* Overlay au hover */}
            <div
              className={`absolute inset-x-0 bottom-0 z-10 p-3 flex gap-2 transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/product/${product.id}`);
                }}
              >
                <Eye className="w-4 h-4" />
                Aperçu
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-4 h-4" />
                Panier
              </Button>
            </div>
          </div>

          {/* Contenu */}
          <div className="px-4 py-3 space-y-2">
            {/* Vendor */}
            {product.vendor && (
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handleVendorClick}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition"
                >
                  {product.vendor.logo_url ? (
                    <img src={product.vendor.logo_url} alt={product.vendor.name} className="w-4 h-4 rounded-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <Store className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate max-w-[100px]">{product.vendor.name}</span>
                  {product.vendor.is_verified && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                </button>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{rating}</span>
                  <span>({reviewCount})</span>
                </div>
              </div>
            )}

            {/* Marque */}
            {product.marque && (
              <p className="text-xs text-muted-foreground font-semibold line-clamp-1">
                {product.marque}
              </p>
            )}

            {/* Titre */}
            <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.title}
            </h3>

            {/* Prix + Acheter */}
            <div className="flex items-end justify-between gap-2 pt-1">
              <div className="flex flex-col">
                {hasPromo ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-destructive">
                        {CURRENCY.format(product.promo_price!)}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {CURRENCY.format(product.price)}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Économisez {CURRENCY.format(product.price - product.promo_price!)}
                    </span>
                  </>
                ) : (
                  <span className="text-base font-bold text-primary">
                    {CURRENCY.format(product.price)}
                  </span>
                )}
              </div>

              <Button
                type="button"
                size="sm"
                onClick={handleBuy}
                className="gap-1.5 shrink-0"
              >
                <ShoppingBag className="w-4 h-4" />
                Acheter
              </Button>
            </div>

            {/* Unité */}
            {unit && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Package className="w-3 h-3" />
                <span>Unité de vente :</span>
                <span className="font-medium text-foreground">{unit}</span>
              </div>
            )}

            {/* Fiche technique PDF du produit */}
            {product.specs_pdf_url && (
              <button
                type="button"
                onClick={handleDownloadSpecs}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:underline py-2"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                Télécharger la fiche technique
              </button>
            )}

            {/* Stock */}
            {stock !== undefined && stock <= 5 && stock > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Plus que {stock} exemplaire{stock > 1 ? 's' : ''}
              </div>
            )}
            {stock !== undefined && stock === 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-destructive font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                Rupture de stock
              </div>
            )}
          </div>
        </motion.div>
      </Link>

      <VendorInfoDialog
        vendor={product.vendor}
        open={showVendorDialog}
        onOpenChange={setShowVendorDialog}
      />
    </>
  );
}