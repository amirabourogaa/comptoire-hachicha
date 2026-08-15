import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useCustomPage } from '@/hooks/useCustomPages';
import { BlockRenderer } from '@/components/admin/page-builder/BlockRenderer';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { 
  ArrowUp, Sparkles, ChevronDown, Star, Heart, Zap, Clock,
  Eye, Share2, Bookmark, ThumbsUp, MessageCircle, Award,
  TrendingUp, Users, Globe, MapPin, Phone, Mail, Calendar
} from 'lucide-react';

const heightMap: Record<string, string> = {
  sm: 'min-h-[250px] md:min-h-[350px] lg:min-h-[400px]',
  md: 'min-h-[350px] md:min-h-[450px] lg:min-h-[550px]',
  lg: 'min-h-[450px] md:min-h-[550px] lg:min-h-[650px]',
  xl: 'min-h-[550px] md:min-h-[650px] lg:min-h-[750px]',
};

const titleSizeMap: Record<string, string> = {
  xl: 'text-2xl md:text-3xl lg:text-4xl',
  '2xl': 'text-3xl md:text-4xl lg:text-5xl',
  '3xl': 'text-4xl md:text-5xl lg:text-6xl',
  '4xl': 'text-5xl md:text-6xl lg:text-7xl',
  '5xl': 'text-6xl md:text-7xl lg:text-8xl',
};

const alignMap: Record<string, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

const textShadowMap: Record<string, string> = {
  none: '',
  sm: 'drop-shadow-sm',
  md: 'drop-shadow-md',
  lg: 'drop-shadow-lg',
  xl: 'drop-shadow-xl',
  '2xl': 'drop-shadow-2xl',
};

const fontMap: Record<string, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
};

const animationMap: Record<string, string> = {
  none: '',
  fade: 'animate-fade-in',
  slide: 'animate-slide-up',
  scale: 'animate-scale-in',
  bounce: 'animate-bounce-subtle',
  pulse: 'animate-pulse-subtle',
};

export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading } = useCustomPage(slug || '');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: coverRef,
    offset: ["start start", "end start"]
  });

  // Effets de parallaxe avancés
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const blur = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  // Effet de suivi de souris amélioré
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (coverRef.current) {
        const rect = coverRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
      }
    };

    const handleScroll = () => {
      setIsVisible(window.scrollY < 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: page?.title,
          text: page?.cover_style?.subtitle || `Découvrez ${page?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erreur de partage:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-20 md:pt-24">
          <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
            {/* Loader moderne */}
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-muted-foreground"
            >
              Chargement de la page...
            </motion.p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-20 md:pt-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center min-h-[60vh] flex flex-col items-center justify-center"
          >
            {/* Animation 404 améliorée */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-full flex items-center justify-center"
            >
              <span className="text-5xl font-bold text-destructive/50">404</span>
            </motion.div>
            <h1 className="font-serif text-3xl mb-3">Page non trouvée</h1>
            <p className="text-muted-foreground mb-8">
              Cette page n'existe pas ou n'est pas publiée.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-4 text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center gap-2">
                Retour à la page précédente
              </span>
            </motion.button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const cs = page.cover_style || {};
  const heightClass = heightMap[cs.height || 'md'] || heightMap.md;
  const titleClass = titleSizeMap[cs.titleSize || '3xl'] || titleSizeMap['3xl'];
  const alignClass = alignMap[cs.titleAlign || 'center'] || alignMap.center;
  const overlayOpacity = (cs.overlayOpacity ?? 45) / 100;
  const textShadowClass = textShadowMap[cs.textShadow || 'lg'] || textShadowMap.lg;
  const fontClass = fontMap[cs.fontFamily || 'sans'] || fontMap.sans;
  const animationClass = animationMap[cs.animation || 'fade'] || animationMap.fade;

  // Styles dynamiques pour l'overlay
  const overlayStyle = cs.overlayColor
    ? {
        background: `linear-gradient(135deg, ${cs.overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, '0')}, ${cs.overlayColor}${Math.round(overlayOpacity * 0.7 * 255).toString(16).padStart(2, '0')})`
      }
    : {
        background: `linear-gradient(135deg, rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${overlayOpacity * 0.7}))`
      };

  // Statistiques de la page
  const pageStats = [
    { icon: Eye, label: 'Vues', value: '1.2k' },
    { icon: ThumbsUp, label: 'J\'aime', value: '456' },
    { icon: MessageCircle, label: 'Commentaires', value: '89' },
    { icon: Share2, label: 'Partages', value: '34' },
  ];

  return (
    <Layout>
      {/* Page Title with Cover Photo - Version ultra dynamique */}
      {page.cover_image_url ? (
        <motion.div
          ref={coverRef}
          className={`relative w-full ${heightClass} overflow-hidden pt-20 md:pt-24`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Image de fond avec parallaxe amélioré */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${page.cover_image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              y: springY,
              scale: scale,
              filter: `blur(${blur}px)`,
            }}
          />

          {/* Overlay dynamique avec gradient */}
          <motion.div 
            className="absolute inset-0"
            style={{
              ...overlayStyle,
              opacity: opacity,
            }}
          />

          {/* Effet de lumière mobile amélioré */}
          {isVisible && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                background: `radial-gradient(circle at ${50 + mousePosition.x * 40}% ${50 + mousePosition.y * 40}%, rgba(255,255,255,0.2) 0%, transparent 70%)`,
              }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            />
          )}

          {/* Particules flottantes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                }}
                animate={{
                  y: [null, Math.random() * 100 + '%'],
                  x: [null, Math.random() * 100 + '%'],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>

          {/* Contenu avec animations avancées - SANS TITRE */}
          <div className={`relative z-10 container mx-auto px-4 h-full flex flex-col ${alignClass} justify-center`}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`max-w-4xl ${animationClass}`}
            >
              {/* Badge amélioré */}
              {cs.showBadge && (
                <motion.div
                  initial={{ opacity: 0, x: -20, rotate: -10 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="inline-block mb-4"
                >
                  <span className="bg-gradient-to-r from-primary/30 to-primary/20 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-medium border border-white/20 shadow-lg">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    {cs.badgeText || 'Nouveau'}
                  </span>
                </motion.div>
              )}

              {/* Sous-titre avec effet de glassmorphism */}
              {cs.subtitleEnabled && cs.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-white/90 text-base md:text-lg lg:text-xl mt-4 max-w-2xl backdrop-blur-md bg-black/20 p-4 rounded-xl border border-white/10"
                >
                  {cs.subtitle}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Indicateur de scroll amélioré */}
          {cs.showScrollIndicator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center backdrop-blur-sm"
              >
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-white rounded-full mt-2"
                />
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        // Version sans image de couverture améliorée
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent py-20 md:py-24 lg:py-28 relative overflow-hidden pt-20 md:pt-24"
        >
          {/* Éléments décoratifs */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className={`container mx-auto px-4 flex flex-col ${alignClass} relative z-10`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <motion.h1
                className={`${titleClass} ${fontClass} font-bold text-foreground`}
              >
                {page.title.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.03 }}
                    className="inline-block"
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </motion.h1>
              {cs.subtitleEnabled && cs.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-muted-foreground text-base md:text-lg lg:text-xl mt-4 max-w-2xl"
                >
                  {cs.subtitle}
                </motion.p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Barre de progression de lecture */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary/30 z-50"
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
      />

      {/* Contenu principal avec animations améliorées */}
      <div ref={contentRef} className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-16 max-w-6xl mx-auto"
        >
          {page.blocks.map((block, idx) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 0.6, 
                delay: idx * 0.1,
                type: "spring",
                stiffness: 50,
                damping: 20
              }}
              whileHover={{ scale: 1.02 }}
              className="group relative"
            >
              {/* Effet de carte au hover */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl" />
              <div className="relative bg-card/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50 group-hover:border-primary/20 transition-all duration-300">
                <BlockRenderer block={block} />
              </div>
            </motion.div>
          ))}

          {/* Séparateur décoratif animé */}
          {page.blocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-32 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 mx-auto rounded-full"
            />
          )}
        </motion.div>
      </div>

      {/* Bouton de retour en haut amélioré */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      </motion.button>

      {/* Widget de statistiques flottant (optionnel) */}
      {cs.showStats && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
          className="fixed bottom-8 left-8 z-50 bg-card/80 backdrop-blur-md rounded-lg p-4 border border-border/50 shadow-lg"
        >
          <div className="flex gap-4">
            {pageStats.map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.1 }}
                className="text-center"
              >
                <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </Layout>
  );
}