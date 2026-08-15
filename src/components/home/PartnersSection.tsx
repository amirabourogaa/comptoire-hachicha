import { useRef, useEffect, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { useActivePartners } from '@/hooks/useHomeSections';

// Infinite marquee — pauses on hover, smooth and GPU-accelerated
function InfiniteMarquee({
  partners,
  speed = 35,
  reverse = false,
}: {
  partners: { id: string; name: string; logo_url: string; website_url?: string }[];
  speed?: number;
  reverse?: boolean;
}) {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [itemWidth, setItemWidth] = useState(0);

  // Duplicate items so the loop is seamless
  const items = [...partners, ...partners, ...partners];

  useEffect(() => {
    if (containerRef.current) {
      const firstSet = containerRef.current.querySelectorAll('[data-item]');
      if (firstSet.length > 0) {
        const total = Array.from(firstSet)
          .slice(0, partners.length)
          .reduce((acc, el) => acc + (el as HTMLElement).offsetWidth + 48, 0);
        setItemWidth(total);
      }
    }
  }, [partners.length]);

  useAnimationFrame((_, delta) => {
    if (paused || itemWidth === 0) return;
    const dir = reverse ? 1 : -1;
    const next = x.get() + dir * (speed * delta) / 1000;
    if (!reverse && next <= -itemWidth) {
      x.set(next + itemWidth);
    } else if (reverse && next >= 0) {
      x.set(next - itemWidth);
    } else {
      x.set(next);
    }
  });

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        ref={containerRef}
        style={{ x }}
        className="flex items-center gap-12 w-max"
      >
        {items.map((partner, i) => (
          <a
            key={`${partner.id}-${i}`}
            data-item
            href={partner.website_url || '#'}
            target={partner.website_url ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center flex-shrink-0"
          >
            {/* Hover glow backdrop */}
            <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-primary/5 blur-md scale-110" />

            <img
              src={partner.logo_url}
              alt={partner.name}
              className="relative h-8 md:h-10 w-auto object-contain
                         opacity-70
                         group-hover:opacity-100
                         transition-all duration-500 ease-out
                         group-hover:scale-105"
              draggable={false}
            />
          </a>
        ))}
      </motion.div>
    </div>
  );
}

export function PartnersSection() {
  const { data: partners, isLoading } = useActivePartners();

  if (isLoading || !partners || partners.length === 0) return null;

  // Split into two rows for the layered marquee effect
  const half = Math.ceil(partners.length / 2);
  const row1 = partners.slice(0, half);
  const row2 = partners.slice(half);

  return (
    <section className="relative overflow-hidden py-20 md:py-28">

      {/* ── Decorative top / bottom rule ── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      {/* ── Soft radial ambient ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,hsl(var(--primary)/0.04),transparent)]" />

      {/* ── Edge fade masks ── */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10
                      bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10
                      bg-gradient-to-l from-background to-transparent" />

      <div className="relative z-0">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center px-4"
        >
          {/* Ornament line */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary/60">
              Ils nous font confiance
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <p className="text-2xl font-light tracking-wide text-foreground/80">
            Nos <em className="not-italic font-semibold text-foreground">Partenaires</em>
          </p>
        </motion.div>

        {/* ── Row 1 — forward ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <InfiniteMarquee partners={row1.length > 0 ? row1 : partners} speed={32} />
        </motion.div>

        {/* ── Row 2 — reverse (only if we have enough partners) ── */}
        {row2.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <InfiniteMarquee partners={row2} speed={28} reverse />
          </motion.div>
        )}
      </div>
    </section>
  );
}