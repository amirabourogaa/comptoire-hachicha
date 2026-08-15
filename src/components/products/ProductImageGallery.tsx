import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProductImageGalleryProps {
  images: string[];
  productTitle: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  discountPercent?: number | null;
  isFlashSale?: boolean;
}

export function ProductImageGallery({
  images,
  productTitle,
  currentIndex,
  onIndexChange,
  discountPercent,
  isFlashSale,
}: ProductImageGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length > 0) {
      onIndexChange((currentIndex + 1) % images.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length > 0) {
      onIndexChange((currentIndex - 1 + images.length) % images.length);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, currentIndex, images.length]);

  return (
    <div className="w-full max-w-[600px] mx-auto space-y-4">
      {/* Main Image Container */}
      <div 
        className="relative w-full aspect-[4/5] sm:aspect-square bg-muted/30 rounded-xl overflow-hidden shadow-sm border border-border/50 group cursor-zoom-in flex items-center justify-center"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => {
          if (images.length > 0) setIsLightboxOpen(true);
        }}
      >
        <AnimatePresence mode="wait">
          {images.length > 0 ? (
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${productTitle} - Vue ${currentIndex + 1}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: isHovering ? 1.05 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-contain p-4"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span>Pas d'image</span>
            </div>
          )}
        </AnimatePresence>

        {/* Hover overlay icon */}
        {images.length > 0 && (
          <div className={cn(
            "absolute inset-0 bg-black/5 flex items-center justify-center transition-opacity duration-300 pointer-events-none",
            isHovering ? "opacity-100" : "opacity-0"
          )}>
            <div className="bg-background/80 backdrop-blur-sm p-3 rounded-full shadow-lg">
              <Search className="w-6 h-6 text-foreground" />
            </div>
          </div>
        )}

        {/* Zoom Button */}
        {images.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:bg-background transition-all hover:scale-105 z-10 hidden md:flex items-center gap-2 text-sm font-medium"
          >
            <ZoomIn className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only">Zoom</span>
          </button>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-background transition-all shadow-md hover:scale-110 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 md:block hidden"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-background transition-all shadow-md hover:scale-110 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 md:block hidden"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Badges */}
        {discountPercent && discountPercent > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-full z-10 shadow-sm"
          >
            -{discountPercent}%
          </motion.div>
        )}

        {isFlashSale && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className={cn(
              "absolute top-4 z-10 bg-primary text-primary-foreground text-sm font-bold px-3 py-1.5 rounded-full shadow-sm",
              discountPercent && discountPercent > 0 ? "left-20" : "left-4"
            )}
          >
            FLASH
          </motion.div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={cn(
                "w-20 h-24 flex-shrink-0 rounded-lg transition-all overflow-hidden bg-muted/30 border-2 snap-center",
                index === currentIndex 
                  ? "border-primary ring-2 ring-primary/20 ring-offset-1" 
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-border"
              )}
            >
              <img
                src={img}
                alt={`${productTitle} thumbnail ${index + 1}`}
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Zoom */}
      <AnimatePresence>
        {isLightboxOpen && (
          <Lightbox
            images={images}
            currentIndex={currentIndex}
            onClose={() => setIsLightboxOpen(false)}
            onNext={nextImage}
            onPrev={prevImage}
            title={productTitle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Lightbox component
function Lightbox({ 
  images, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrev,
  title 
}: { 
  images: string[]; 
  currentIndex: number; 
  onClose: () => void; 
  onNext: () => void; 
  onPrev: () => void;
  title: string;
}) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle zoom with mouse wheel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      setZoom(prev => Math.max(0.5, Math.min(6, prev + delta)));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center"
    >
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        <div className="bg-muted/50 px-3 py-1.5 rounded-full text-sm font-medium hidden sm:block">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          onClick={() => setZoom(1)}
          className={cn(
            "bg-muted/50 p-2.5 rounded-full hover:bg-muted transition-colors",
            zoom === 1 ? "opacity-50 cursor-not-allowed" : "opacity-100"
          )}
          disabled={zoom === 1}
          title="Réinitialiser le zoom"
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="bg-muted/50 p-2.5 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); setZoom(1); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-muted/50 p-4 rounded-full hover:bg-background transition-colors z-50 hidden sm:block"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); setZoom(1); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-muted/50 p-4 rounded-full hover:bg-background transition-colors z-50 hidden sm:block"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
      >
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={title}
          drag={zoom > 1}
          dragConstraints={containerRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: zoom }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            opacity: { duration: 0.2 },
            scale: { duration: 0.2, ease: "easeOut" }
          }}
          className="max-w-[90vw] max-h-[90vh] object-contain touch-none"
          draggable={false}
          onDoubleClick={() => setZoom(prev => prev > 1 ? 1 : 2.5)}
        />
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none px-4">
        <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg pointer-events-auto text-center max-w-sm">
          Scrollez ou pincez pour zoomer • Double-cliquez • Glissez pour déplacer
        </div>
      </div>
    </motion.div>
  );
}
