import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useActiveHeroSlides } from '@/hooks/useHeroSlides';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Hero() {
  const { data: slides, isLoading } = useActiveHeroSlides();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeSlides = slides?.filter(s => s.is_active) || [];

  const nextSlide = useCallback(() => {
    if (activeSlides.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    if (activeSlides.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    }
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [activeSlides.length, nextSlide]);

  if (!isLoading && activeSlides.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="relative h-[100vh] overflow-hidden bg-gradient-to-br from-background via-background to-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-sm text-muted-foreground tracking-widest uppercase font-medium">Chargement...</span>
          </motion.div>
        </div>
      </section>
    );
  }

  const currentSlide = activeSlides[currentIndex];

  return (
    <section className="relative h-[100vh] overflow-hidden">
      {/* Slides - Sans overlays */}
      <AnimatePresence mode="wait">
        {activeSlides.map((slide, index) => (
          index === currentIndex && (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img
                src={slide.image_url}
                alt={slide.title || 'Hero slide'}
                className="w-full h-full object-cover object-center"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Content - Style amélioré avec meilleure lisibilité */}
      <div className="absolute inset-0 flex items-center z-20">
        {/* Dégradé subtil pour améliorer la lisibilité du texte sans overlay lourd */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="max-w-xl sm:max-w-2xl lg:max-w-3xl"
          >
            {currentSlide.title && (
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 sm:mb-6 text-white drop-shadow-2xl"
              >
                {currentSlide.title}
              </motion.h1>
            )}
            {currentSlide.subtitle && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-light tracking-wide mb-6 sm:mb-8 lg:mb-10 text-white/90 drop-shadow-lg max-w-lg sm:max-w-xl lg:max-w-2xl"
              >
                {currentSlide.subtitle}
              </motion.p>
            )}
            {currentSlide.button_text && currentSlide.button_link && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Link 
                  to={currentSlide.button_link} 
                  className="group relative inline-flex items-center px-8 py-4 text-base sm:text-lg font-semibold tracking-wide text-white bg-primary hover:bg-primary/90 transition-all duration-300 rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                >
                  <span>{currentSlide.button_text}</span>
                  <Sparkles className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows - Style amélioré */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group border border-white/20 hover:border-white/40 shadow-lg"
            aria-label="Slide précédent"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group border border-white/20 hover:border-white/40 shadow-lg"
            aria-label="Slide suivant"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Navigation tactile pour mobile - zones cliquables visibles */}
          <div className="absolute inset-x-0 top-0 bottom-0 z-30 flex md:hidden">
            <div className="w-1/2 h-full cursor-pointer" onClick={prevSlide} />
            <div className="w-1/2 h-full cursor-pointer" onClick={nextSlide} />
          </div>
        </>
      )}

      {/* Progress Indicator - Style amélioré */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-8 sm:bottom-10 lg:bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:gap-3">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="group relative h-1.5 sm:h-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{ width: index === currentIndex ? '32px' : '8px' }}
              aria-label={`Aller au slide ${index + 1}`}
            >
              <div className={cn(
                "absolute inset-0 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "bg-white" 
                  : "bg-white/40 group-hover:bg-white/60"
              )} />
              {index === currentIndex && (
                <motion.div 
                  className="absolute inset-0 bg-white"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 5, ease: "linear" }}
                  style={{ transformOrigin: 'left' }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}