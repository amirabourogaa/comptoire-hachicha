import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { motion } from 'framer-motion';
import { sanitizeRichTextHtml } from '@/lib/sanitizeRichTextHtml';
import { ArrowRight, Sparkles } from 'lucide-react';

export function AboutSection() {
  const { data: settings, isLoading } = useSiteSettings();

  const getSetting = (key: string) => {
    return settings?.find(s => s.key === key)?.value || '';
  };

  const title = getSetting('about_title') || '';
  const subtitle = getSetting('about_subtitle') || '';
  const description = getSetting('about_description');
  const imageUrl = getSetting('about_image');
  const buttonText = getSetting('about_button_text');
  const buttonLink = getSetting('about_button_link');

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <motion.div
              className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </section>
    );
  }

  if (!title && !description) {
    return null;
  }

  return (
    <section className="py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden relative">
      {/* Éléments décoratifs de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image - avec dimensions réelles */}
          <motion.div
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative group"
          >
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              {imageUrl ? (
                <motion.img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-auto object-contain"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  loading="lazy"
                  style={{ 
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center rounded-3xl">
                  <Sparkles className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
              
              {/* Overlay gradient au hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            {/* Éléments décoratifs */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 border-2 border-primary/20 rounded-full -z-10 hidden lg:block animate-pulse" />
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary/5 rounded-full -z-10 hidden lg:block" />
          </motion.div>

          {/* Content - Style amélioré */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Badge subtitle */}
            {subtitle && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wider uppercase">
                  {subtitle}
                </span>
              </motion.div>
            )}
            
            {/* Title */}
            {title && (
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground"
              >
                {title}
              </motion.h2>
            )}
            
            {/* Description - avec styles améliorés */}
            {description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="prose prose-lg prose-primary max-w-none text-muted-foreground [&_p]:text-lg [&_p]:leading-relaxed [&_p]:mb-4 [&_strong]:text-primary [&_strong]:font-semibold [&_a]:text-primary [&_a]:hover:underline"
                dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(description) }}
              />
            )}
            
            {/* Button CTA */}
            {buttonText && buttonLink && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-4"
              >
                <Link 
                  to={buttonLink} 
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}