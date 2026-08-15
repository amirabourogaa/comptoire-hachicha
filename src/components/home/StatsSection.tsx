import { motion, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useActiveStats } from '@/hooks/useHomeSections';
import { Users, Package, Award, Truck, TrendingUp, Heart, Star, ShoppingBag, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'users': Users,
  'package': Package,
  'award': Award,
  'truck': Truck,
  'trending-up': TrendingUp,
  'heart': Heart,
  'star': Star,
  'shopping-bag': ShoppingBag,
};

// Animated counter — fires once inView becomes true
function useCountUp(target: string, inView: boolean) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!inView || !ref.current) return;
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ''));
    const suffix = target.replace(/[0-9.]/g, '');
    if (isNaN(numeric)) {
      ref.current.textContent = target;
      return;
    }
    const controls = animate(0, numeric, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        if (ref.current) {
          ref.current.textContent =
            (Number.isInteger(numeric)
              ? Math.floor(value).toLocaleString()
              : value.toFixed(1)) + suffix;
        }
      },
    });
    return () => controls.stop();
  }, [inView, target]);

  return ref;
}

function StatCard({
  stat,
  index,
}: {
  stat: { id: string; icon: string; value: string; label: string };
  index: number;
}) {
  const IconComponent = iconMap[stat.icon] || TrendingUp;
  const [inView, setInView] = useState(false);
  const countRef = useCountUp(stat.value, inView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-shadow duration-300 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)]">

        {/* Ambient glow on hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

        {/* Top decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.12 + 0.3 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-16 bg-gradient-to-r from-transparent via-primary to-transparent origin-center"
        />

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.12 + 0.2 }}
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-inner"
        >
          <IconComponent className="h-7 w-7 text-primary" strokeWidth={1.5} />
        </motion.div>

        {/* Value */}
        <div className="mb-2 font-display text-4xl font-bold tracking-tight text-foreground">
          <span ref={countRef}>{stat.value}</span>
        </div>

        {/* Divider */}
        <div className="mx-auto mb-3 h-px w-8 bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />

        {/* Label */}
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {stat.label}
        </p>
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  const { data: stats, isLoading } = useActiveStats();

  if (isLoading || !stats || stats.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-24 md:py-32">

      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">

        {/* Section badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Nos chiffres
          </span>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}