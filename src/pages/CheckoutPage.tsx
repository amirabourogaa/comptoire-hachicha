import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Banknote, Truck, Shield, Clock, Package, MapPin, Phone, Mail, User, Lock, Sparkles, Gift, BadgeCheck, Wallet, Zap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { useIncrementCouponUsage, Coupon } from '@/hooks/useCoupons';
import { CouponInput } from '@/components/checkout/CouponInput';
import { useIsModuleEnabled } from '@/hooks/useModules';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { supabase } from '@/integrations/supabase/client';
import { CURRENCY } from '@/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, deliveryFee, grandTotal } = useCart();
  const createOrder = useCreateOrder();
  const incrementCouponUsage = useIncrementCouponUsage();
  const isPaymentEnabled = useIsModuleEnabled('online_payment');
  const { data: paymentSettings } = usePaymentSettings();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const finalTotal = Math.max(0, grandTotal - discountAmount);
  const showOnlinePayment = isPaymentEnabled && paymentSettings?.is_enabled;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCouponApplied = (coupon: Coupon, discount: number) => {
    setAppliedCoupon(coupon);
    setDiscountAmount(discount);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const processOnlinePayment = async (orderId: string) => {
    setIsProcessingPayment(true);
    try {
      const { error } = await supabase
        .from('payment_transactions' as any)
        .insert({
          order_id: orderId,
          amount: finalTotal,
          currency: paymentSettings?.currency || 'TND',
          status: 'pending',
          payment_method: 'online',
          gateway_name: paymentSettings?.gateway_name || 'generic',
          customer_name: formData.name,
          customer_email: formData.email,
        } as any);

      if (error) throw error;

      if (paymentSettings?.api_url) {
        const { data, error: fnError } = await supabase.functions.invoke('process-payment', {
          body: {
            order_id: orderId,
            amount: finalTotal,
            currency: paymentSettings.currency || 'TND',
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
          },
        });

        if (fnError) {
          console.error('Payment function error:', fnError);
        }

        if (data?.payment_url) {
          window.location.href = data.payment_url;
          return;
        }
      }

      return true;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Erreur lors du traitement du paiement');
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderResult = await createOrder.mutateAsync({
        order: {
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          customer_address: formData.address,
          total_amount: finalTotal,
          status: 'pending',
          coupon_code: appliedCoupon?.code || null,
          discount_amount: discountAmount,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'online' ? 'pending' : 'unpaid',
        },
        items: items.map((item) => ({
          product_id: item.product.id,
          product_title: item.product.title,
          product_price: item.product.price,
          quantity: item.quantity,
        })),
      });

      if (appliedCoupon) {
        await incrementCouponUsage.mutateAsync(appliedCoupon.code);
      }

      if (paymentMethod === 'online' && orderResult) {
        const paymentResult = await processOnlinePayment((orderResult as any).id || '');
        if (!paymentResult) {
          toast.error('Le paiement a échoué. Votre commande est enregistrée en attente.');
        }
      }

      setIsSuccess(true);
      clearCart();
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
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
                  <Package size={56} className="text-primary/40" />
                </div>
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
              Ajoutez des articles à votre panier avant de procéder au paiement.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link 
                to="/" 
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-4 text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center gap-2">
                  Découvrir nos produits
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (isSuccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm p-12 border border-border/50 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-8 relative"
              >
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Check size={40} className="text-white" />
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-serif text-3xl md:text-4xl font-light mb-4 text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
              >
                Commande confirmée !
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-4 text-center max-w-md mx-auto"
              >
                Merci pour votre commande. Vous recevrez un email de confirmation à l'adresse <span className="text-primary font-medium">{formData.email}</span>
              </motion.p>
              
              {paymentMethod === 'online' && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-center mb-8 p-4 bg-primary/5 rounded-xl border border-primary/20"
                >
                  {paymentSettings?.api_url 
                    ? 'Votre paiement est en cours de traitement.'
                    : 'Le paiement en ligne a été enregistré.'}
                </motion.p>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link 
                  to="/" 
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-4 text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative flex items-center gap-2">
                    Retour à l'accueil
                  </span>
                </Link>
                <Link 
                  to="/account/orders" 
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-card px-8 py-4 text-foreground transition-all hover:bg-card/80 hover:scale-[1.02] active:scale-[0.98] border border-border/50"
                >
                  <span className="relative flex items-center gap-2">
                    Voir mes commandes
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header with navigation */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-8"
        >
          <Link
            to="/cart"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-all group relative overflow-hidden px-4 py-2 rounded-lg hover:bg-muted/50"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="relative">
              Retour au panier
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
            </span>
          </Link>
        </motion.div>

        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-serif text-2xl md:text-3xl font-light mb-12 flex items-center gap-3"
        >
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Validation de commande
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Form - Left Column */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Information Section */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-6 md:p-8 border border-border/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
                
                <h2 className="font-serif text-xl font-light mb-6 flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  <span>Vos informations</span>
                </h2>
                
                <div className="space-y-5">
                  {/* Name Field */}
                  <div className="relative">
                    <label className={`absolute -top-2 left-3 px-2 text-xs transition-all bg-card z-10 ${
                      focusedField === 'name' || formData.name ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      Nom complet *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full pl-11 pr-4 py-4 bg-transparent border-2 rounded-xl focus:border-primary transition-all outline-none"
                        placeholder="Ahmed Ben Ali"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <label className={`absolute -top-2 left-3 px-2 text-xs transition-all bg-card z-10 ${
                      focusedField === 'email' || formData.email ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      Email *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full pl-11 pr-4 py-4 bg-transparent border-2 rounded-xl focus:border-primary transition-all outline-none"
                        placeholder="ahmed@exemple.com"
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="relative">
                    <label className={`absolute -top-2 left-3 px-2 text-xs transition-all bg-card z-10 ${
                      focusedField === 'phone' || formData.phone ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-11 pr-4 py-4 bg-transparent border-2 rounded-xl focus:border-primary transition-all outline-none"
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>
                  </div>

                  {/* Address Field */}
                  <div className="relative">
                    <label className={`absolute -top-2 left-3 px-2 text-xs transition-all bg-card z-10 ${
                      focusedField === 'address' || formData.address ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      Adresse de livraison *
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-4 text-muted-foreground" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('address')}
                        onBlur={() => setFocusedField(null)}
                        required
                        rows={3}
                        className="w-full pl-11 pr-4 py-4 bg-transparent border-2 rounded-xl focus:border-primary transition-all outline-none resize-none"
                        placeholder="123 Avenue Habib Bourguiba, Tunis"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              {showOnlinePayment && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-6 md:p-8 border border-border/50"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
                  
                  <h2 className="font-serif text-xl font-light mb-6 flex items-center gap-2">
                    <Wallet size={20} className="text-primary" />
                    <span>Mode de paiement</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cash Payment Option */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod('cash')}
                      className={`relative overflow-hidden p-6 rounded-xl border-2 transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5'
                          : 'border-border/50 hover:border-primary/30 bg-card/30'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
                      <Banknote className={`h-8 w-8 mb-3 ${paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-base font-medium mb-1">Paiement à la livraison</p>
                      <p className="text-xs text-muted-foreground">Payez en espèces à la réception</p>
                      {paymentMethod === 'cash' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                        >
                          <Check size={12} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Online Payment Option */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod('online')}
                      className={`relative overflow-hidden p-6 rounded-xl border-2 transition-all ${
                        paymentMethod === 'online'
                          ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5'
                          : 'border-border/50 hover:border-primary/30 bg-card/30'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
                      <CreditCard className={`h-8 w-8 mb-3 ${paymentMethod === 'online' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-base font-medium mb-1">Paiement en ligne</p>
                      <p className="text-xs text-muted-foreground">
                        {paymentSettings?.gateway_name || 'Carte bancaire'}
                      </p>
                      {paymentMethod === 'online' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                        >
                          <Check size={12} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <Lock size={12} />
                    <span>Paiement 100% sécurisé - Vos données sont protégées</span>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || isProcessingPayment}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 px-8 py-5 text-primary-foreground text-lg font-medium transition-all hover:shadow-[0_10px_30px_-10px_rgba(120,67,233,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center justify-center gap-3">
                  {isSubmitting || isProcessingPayment ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'online' ? (
                        <>
                          <Zap size={20} />
                          Payer {CURRENCY.format(finalTotal)}
                        </>
                      ) : (
                        <>
                          <Check size={20} />
                          Confirmer la commande
                        </>
                      )}
                    </>
                  )}
                </span>
              </motion.button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Truck size={14} className="text-primary" /> Livraison offerte
                </span>
                <span className="flex items-center gap-1">
                  <Shield size={14} className="text-primary" /> Retours gratuits
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-primary" /> 24/7 Support
                </span>
              </div>
            </form>
          </motion.div>

          {/* Order Summary - Right Column */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="sticky top-24">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm p-6 md:p-8 border border-border/50 shadow-2xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
                
                <h2 className="font-serif text-xl font-light mb-6 flex items-center gap-2">
                  <Package size={20} className="text-primary" />
                  <span>Récapitulatif</span>
                </h2>
                
                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  <AnimatePresence>
                    {items.map((item, index) => {
                      const mainImage = item.product.images?.[0] || item.product.image_url;
                      return (
                        <motion.div
                          key={item.product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex gap-4 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex-shrink-0">
                            {mainImage ? (
                              <img 
                                src={mainImage} 
                                alt={item.product.title} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={20} className="text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.product.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">Quantité: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-primary">
                              {CURRENCY.format(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Coupon Input */}
                <div className="border-t border-border/50 pt-4 mb-4">
                  <CouponInput
                    cartTotal={total}
                    onCouponApplied={handleCouponApplied}
                    onCouponRemoved={handleCouponRemoved}
                    appliedCoupon={appliedCoupon}
                    discountAmount={discountAmount}
                  />
                </div>

                {/* Totals */}
                <div className="border-t border-border/50 pt-4 space-y-3">
                  <div className="flex justify-between text-sm p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Package size={14} /> Sous-total
                    </span>
                    <span className="font-medium">{CURRENCY.format(total)}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between text-sm p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                    >
                      <span className="text-green-600 flex items-center gap-2">
                        <Gift size={14} /> Réduction ({appliedCoupon?.code})
                      </span>
                      <span className="text-green-600 font-medium">-{CURRENCY.format(discountAmount)}</span>
                    </motion.div>
                  )}
                  
                  <div className="flex justify-between text-sm p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Truck size={14} /> Livraison
                    </span>
                    <span className="text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full text-xs font-medium">
                      Gratuite
                    </span>
                  </div>
                  
                  {showOnlinePayment && (
                    <div className="flex justify-between text-sm p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground flex items-center gap-2">
                        {paymentMethod === 'online' ? <CreditCard size={14} /> : <Banknote size={14} />}
                        Paiement
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        {paymentMethod === 'online' ? 'En ligne' : 'À la livraison'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-base font-medium pt-3 mt-3 border-t border-border/50">
                    <span className="flex items-center gap-2">
                      <BadgeCheck size={18} className="text-primary" />
                      Total TTC
                    </span>
                    <motion.span 
                      key={finalTotal}
                      initial={{ scale: 1.2, color: "#f59e0b" }}
                      animate={{ scale: 1, color: "currentColor" }}
                      className="text-2xl font-serif bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                    >
                      {CURRENCY.format(finalTotal)}
                    </motion.span>
                  </div>
                </div>

                {/* Guarantee */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground bg-primary/5 p-4 rounded-xl">
                    <Sparkles size={16} className="text-primary" />
                    <p>Commande en sécurité • Paiement protégé • Satisfaction garantie</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;