import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Shield, Truck, CreditCard, Heart, Tag, Gift, XCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { CURRENCY, CartItem, ProductAttributeValue } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to get the display price for a cart item
function getItemDisplayPrice(item: CartItem): number {
  if (item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0) {
    const attrValues = Object.values(item.selectedAttributes) as ProductAttributeValue[];
    const attrWithPrice = attrValues.find(v => v.price != null && v.price > 0);
    if (attrWithPrice) return attrWithPrice.price!;
    const adjustment = attrValues.reduce((sum, v) => sum + (v.price_adjustment || 0), 0);
    return (item.product.promo_price ?? item.product.price) + adjustment;
  }
  return item.product.promo_price ?? item.product.price;
}

// Helper to get unique cart item key
function getCartItemKey(item: CartItem): string {
  if (!item.selectedAttributes || Object.keys(item.selectedAttributes).length === 0) return item.product.id;
  const attrKeys = Object.values(item.selectedAttributes).map((v: any) => v.id).sort().join('-');
  return `${item.product.id}__${attrKeys}`;
}

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, total, deliveryFee, freeDeliveryThreshold, grandTotal } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            {/* Empty state illustration with modern design */}
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mb-8 relative"
            >
              <div className="w-40 h-40 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full backdrop-blur-sm" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShoppingBag size={56} className="text-primary/40" />
                </div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border-2 border-primary/10 border-t-primary/30 rounded-full"
                />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-3xl md:text-4xl font-light mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
            >
              Votre panier est vide
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mb-8"
            >
              Découvrez notre collection et trouvez les pièces qui vous correspondent.
            </motion.p>
            
            {/* Suggestions with modern design */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <Link 
                to="/products" 
                className="group relative inline-flex items-center justify-center w-full overflow-hidden rounded-full bg-primary px-8 py-4 text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center gap-2">
                  Découvrir nos produits
                  <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <div className="flex items-center justify-center gap-8 text-sm">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-default"
                >
                  <div className="p-2 bg-primary/5 rounded-full">
                    <Truck size={14} className="text-primary/60" />
                  </div>
                  Livraison offerte
                </motion.span>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-default"
                >
                  <div className="p-2 bg-primary/5 rounded-full">
                    <Shield size={14} className="text-primary/60" />
                  </div>
                  Paiement sécurisé
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header with navigation - modern design */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-all group relative overflow-hidden px-4 py-2 rounded-lg hover:bg-muted/50"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="relative">
                Continuer mes achats
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
              </span>
            </Link>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-serif text-2xl md:text-3xl font-light flex items-center gap-3"
            >
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Votre Panier
              </span>
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-sans"
              >
                {items.length} article{items.length > 1 ? 's' : ''}
              </motion.span>
            </motion.h1>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => clearCart()}
              className="ml-auto flex items-center gap-2 text-xs text-destructive hover:bg-destructive/10 px-3 py-2 rounded-lg transition-colors border border-destructive/20"
            >
              <XCircle size={14} />
              Vider le panier
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items - modern design */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {items.map((item, index) => {
                  const mainImage = item.product.images?.[0] || item.product.image_url;
                  const itemKey = getCartItemKey(item);
                  const unitPrice = getItemDisplayPrice(item);
                  const hasAttributes = item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0;
                  return (
                    <motion.div
                      key={itemKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, scale: 0.8 }}
                      transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                      className="group relative"
                    >
                      <div className="relative flex gap-4 md:gap-6 p-4 md:p-6 bg-gradient-to-br from-card via-card to-card/50 rounded-2xl transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] border border-border/50 hover:border-primary/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                        
                        <div className="relative w-24 md:w-32 aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0 group/image">
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500 z-10" />
                          {mainImage ? (
                            <>
                              <img src={mainImage} alt={item.product.title} className="w-full h-full object-cover transition-all duration-700 group-hover/image:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                              <span className="text-muted-foreground text-xs">Pas d'image</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-w-0 relative z-10">
                          <div className="space-y-1">
                            <h3 className="font-serif text-base md:text-lg font-light mb-1 truncate group-hover:text-primary transition-colors">
                              {item.product.title}
                            </h3>
                            {/* Display selected attributes */}
                            {hasAttributes && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {Object.entries(item.selectedAttributes!).map(([attrName, attrVal]) => (
                                  <span key={attrName} className="inline-flex items-center gap-1 text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-md border border-border/50">
                                    {/* <span className="font-medium text-foreground/80">{attrName}:</span> */}
                                    {(attrVal as ProductAttributeValue).color_code && (
                                      <span className="w-3 h-3 rounded-full border border-border/50 inline-block" style={{ backgroundColor: (attrVal as ProductAttributeValue).color_code! }} />
                                    )}
                                    {(attrVal as ProductAttributeValue).value}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Tag size={12} />
                              {CURRENCY.format(unitPrice)}
                              {/* {hasAttributes && (() => {
                                const ref = (Object.values(item.selectedAttributes!) as ProductAttributeValue[]).find(v => v.reference);
                                return ref ? <span className="text-xs text-muted-foreground/60 ml-1">Réf: {ref.reference}</span> : null;
                              })()} */}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-muted/30 rounded-xl p-1">
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1, hasAttributes ? itemKey : undefined)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </motion.button>
                              <motion.span key={item.quantity} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="w-12 text-center text-sm font-medium">
                                {item.quantity}
                              </motion.span>
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1, hasAttributes ? itemKey : undefined)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                              >
                                <Plus size={14} />
                              </motion.button>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => removeItem(item.product.id, hasAttributes ? itemKey : undefined)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-all hover:bg-destructive/10 rounded-xl relative group/remove"
                            >
                              <div className="absolute inset-0 bg-destructive/0 group-hover/remove:bg-destructive/5 rounded-xl transition-colors" />
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
                        </div>

                        <div className="hidden md:block text-right min-w-[120px] relative z-10">
                          <motion.p key={item.quantity} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-medium text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            {CURRENCY.format(unitPrice * item.quantity)}
                          </motion.p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                            <Gift size={12} />
                            Total article
                          </p>
                        </div>
                      </div>
                      
                      <motion.div key={`${itemKey}-mobile`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden flex justify-end mt-2 px-4">
                        <p className="text-sm flex items-center gap-2">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            {CURRENCY.format(unitPrice * item.quantity)}
                          </span>
                        </p>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>

            {/* Additional info - modern design */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 border border-primary/20"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,67,233,0.1),transparent_50%)]" />
              <p className="text-sm text-foreground/80 flex items-center gap-3 relative z-10">
                <span className="p-2 bg-primary/10 rounded-full">
                  <Shield size={16} className="text-primary" />
                </span>
                Livraison offerte dès 200TND d'achat • Retours gratuits sous 30 jours
              </p>
            </motion.div>
          </div>

          {/* Order Summary - modern design */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm p-6 md:p-8 border border-border/50 shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
                
                <h2 className="font-serif text-xl font-light mb-6 flex items-center gap-3 relative">
                  <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Récapitulatif
                  </span>
                  <motion.span 
                    whileHover={{ scale: 1.1 }}
                    className="text-xs bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-3 py-1.5 rounded-full font-sans border border-primary/20"
                  >
                    {items.length} article{items.length > 1 ? 's' : ''}
                  </motion.span>
                </h2>
                
                <div className="space-y-4 mb-6 relative">
                  <div className="flex justify-between text-sm p-3 bg-muted/30 rounded-xl">
                    <span className="text-muted-foreground">Sous-total</span>
                    <motion.span 
                      key={total}
                      initial={{ scale: 1.2, color: "#f59e0b" }}
                      animate={{ scale: 1, color: "currentColor" }}
                      className="font-medium"
                    >
                      {CURRENCY.format(total)}
                    </motion.span>
                  </div>
                  
                  <div className="flex justify-between text-sm p-3 bg-muted/30 rounded-xl">
                    <span className="text-muted-foreground">Livraison</span>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        deliveryFee === 0
                          ? 'bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-600 border border-green-500/20' 
                          : 'bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-orange-600 border border-orange-500/20'
                      }`}
                    >
                      {deliveryFee === 0 ? 'Offerte' : CURRENCY.format(deliveryFee)}
                    </motion.span>
                  </div>
                  
                  {freeDeliveryThreshold && deliveryFee > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 text-xs border border-primary/20"
                    >
                      <p className="text-foreground/80 mb-2 flex items-center gap-2">
                        <Truck size={14} className="text-primary" />
                        Plus que {CURRENCY.format(freeDeliveryThreshold - total)} pour la livraison offerte
                      </p>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((total / (freeDeliveryThreshold || 200)) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full relative"
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-shimmer" />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="border-t border-border/50 pt-4 mb-6 relative">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-lg text-muted-foreground">Total TTC</span>
                    <motion.span 
                      key={grandTotal}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-serif font-light bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                    >
                      {CURRENCY.format(grandTotal)}
                    </motion.span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                    Dont TVA {CURRENCY.format(total * 0.2)}
                  </p>
                </div>

                <div className="space-y-3 relative">
                  <Link 
                    to="/checkout" 
                    className="group relative inline-flex items-center justify-center w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-4 text-primary-foreground transition-all hover:shadow-[0_10px_30px_-10px_rgba(120,67,233,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative flex items-center gap-2 text-base font-medium">
                      Valider la commande
                      <CreditCard size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  
                  <Link 
                    to="/products" 
                    className="text-xs text-muted-foreground hover:text-foreground text-center block transition-colors relative group w-fit mx-auto"
                  >
                    ou continuer mes achats
                    <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-primary/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </Link>
                </div>

                {/* Payment methods - modern design */}
                <div className="mt-6 pt-6 border-t border-border/50 relative">
                  <p className="text-xs text-muted-foreground text-center mb-4 flex items-center justify-center gap-2">
                    <Shield size={12} />
                    Paiement 100% sécurisé
                  </p>
                  <div className="flex justify-center gap-4">
                    {['Visa', 'Mastercard', 'PayPal', 'CB'].map((method, i) => (
                      <motion.div
                        key={method}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="w-12 h-8 bg-gradient-to-br from-muted to-muted/50 rounded-lg border border-border/50 flex items-center justify-center text-xs text-muted-foreground font-medium cursor-default"
                      >
                        {method[0]}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;