import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, ChevronDown, Plus, Minus, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCategoriesTree } from '@/hooks/useCategories';
import { useLogoUrl, useNavbarStyle, NavbarStyle, useSiteSetting } from '@/hooks/useSiteSettings';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { useNavbarPages } from '@/hooks/useCustomPages';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

function getNavbarClasses(style: NavbarStyle, isScrolled: boolean) {
  switch (style) {
    case 'minimal':
      return isScrolled
        ? "bg-background/95 backdrop-blur-lg shadow-sm border-b border-border/50 text-foreground"
        : "bg-transparent text-foreground";
    case 'centered':
      return isScrolled
        ? "bg-navbar-bg/95 backdrop-blur-lg shadow-lg border-b border-navbar-text/10"
        : "bg-navbar-bg/90 backdrop-blur-sm";
    case 'modern':
      return isScrolled
        ? "bg-navbar-bg shadow-lg border-b-2 border-primary"
        : "bg-navbar-bg/95 backdrop-blur-sm border-b-2 border-primary";
    case 'glassmorphism':
      return isScrolled
        ? "bg-navbar-bg/30 backdrop-blur-xl shadow-lg border-b border-navbar-text/10"
        : "bg-navbar-text/5 backdrop-blur-xl border-b border-navbar-text/10";
    case 'elevated':
      return isScrolled
        ? "bg-navbar-bg shadow-2xl shadow-foreground/10 rounded-b-2xl"
        : "bg-navbar-bg/95 shadow-xl shadow-foreground/8 rounded-b-2xl";
    case 'bordered':
      // Style bordure avec couleurs plus claires
      return isScrolled
        ? "bg-navbar-bg border-2 border-primary/40 ring-1 ring-primary/20 shadow-md"
        : "bg-navbar-bg border-2 border-primary/30 shadow-sm";
    case 'pill':
      return ""; // pill uses wrapper classes
    case 'floating':
      return ""; // floating uses wrapper classes
    case 'underline':
      return isScrolled
        ? "bg-background/90 backdrop-blur-md border-b-2 border-primary/60 text-foreground"
        : "bg-transparent border-b-2 border-primary/40 text-foreground";
    case 'classic':
    default:
      return isScrolled
        ? "bg-navbar-bg/95 backdrop-blur-lg shadow-lg border-b border-navbar-text/10"
        : "bg-gradient-to-b from-navbar-bg/80 via-navbar-bg/50 to-transparent backdrop-blur-sm";
    case 'mega':
      return "bg-navbar-bg shadow-md";
    case 'scrollable':
      return isScrolled
        ? "bg-navbar-bg/95 backdrop-blur-lg shadow-lg border-b border-navbar-text/10"
        : "bg-navbar-bg";
  }
}

function getTextClasses(style: NavbarStyle) {
  const themed = { text: 'text-navbar-text', hover: 'hover:text-navbar-bg hover:bg-accent', active: 'bg-accent text-navbar-bg', logo: 'text-navbar-text', cart: 'text-navbar-text hover:bg-navbar-text/10' };
  const light = { text: 'text-foreground', hover: 'hover:text-primary hover:bg-primary/10', active: 'bg-primary/10 text-primary', logo: 'text-foreground', cart: 'text-foreground hover:bg-foreground/10' };
  const navbarThemed = { text: 'text-navbar-text/80', hover: 'hover:text-navbar-text hover:bg-navbar-text/10', active: 'bg-navbar-text/20 text-navbar-text', logo: 'text-navbar-text', cart: 'text-navbar-text hover:bg-navbar-text/10' };

  switch (style) {
    case 'minimal':
    case 'underline':
      return light;
    case 'modern':
      return { ...navbarThemed, active: 'bg-primary text-primary-foreground' };
    case 'glassmorphism':
      return navbarThemed;
    case 'bordered':
      // Style spécifique pour bordered avec couleurs plus claires
      return { 
        ...navbarThemed, 
        active: 'bg-primary/15 text-secondary ring-1 ring-primary/30', // Fond plus clair
        hover: 'hover:text-secondary hover:bg-primary/10' // Hover plus clair
      };
    case 'elevated':
    case 'pill':
    case 'floating':
    case 'centered':
    case 'classic':
    case 'mega':
    case 'scrollable':
    default:
      return themed;
  }
}

function getDropdownClasses(style: NavbarStyle) {
  const themed = { bg: 'bg-navbar-bg', border: 'border-accent/20', itemText: 'text-navbar-text/80', itemHover: 'hover:text-navbar-bg hover:bg-accent', separator: 'bg-accent/20', allText: 'text-navbar-text font-medium' };
  const light = { bg: 'bg-background', border: 'border-border', itemText: 'text-foreground', itemHover: 'hover:bg-primary/10 hover:text-secondary', separator: 'bg-border', allText: 'text-foreground font-medium' };

  switch (style) {
    case 'minimal':
    case 'underline':
      return light;
    case 'modern':
      return { bg: 'bg-navbar-bg', border: 'border-primary/30', itemText: 'text-navbar-text/80', itemHover: 'hover:bg-primary hover:text-primary-foreground', separator: 'bg-primary/20', allText: 'text-navbar-text font-medium' };
    case 'glassmorphism':
      return { bg: 'bg-navbar-bg/40 backdrop-blur-xl', border: 'border-navbar-text/15', itemText: 'text-navbar-text/80', itemHover: 'hover:bg-navbar-text/15 hover:text-navbar-text', separator: 'bg-navbar-text/10', allText: 'text-navbar-text font-medium' };
    case 'bordered':
      // Dropdown avec couleurs plus claires
      return { 
        bg: 'bg-navbar-bg', 
        border: 'border-primary/25', 
        itemText: 'text-navbar-text/80', 
        itemHover: 'hover:bg-primary/10 hover:text-secondary', // Hover plus clair
        separator: 'bg-primary/15', 
        allText: 'text-navbar-text font-medium' 
      };
    case 'elevated':
    case 'pill':
    case 'floating':
    case 'centered':
    case 'classic':
    case 'mega':
    case 'scrollable':
    default:
      return themed;
  }
}

// Social media SVG icons (inline for performance)
function SocialIcon({ type, size = 14 }: { type: string; size?: number }) {
  switch (type) {
    case 'facebook':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case 'instagram':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
    case 'tiktok':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>;
    case 'twitter':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case 'youtube':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    case 'linkedin':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    default:
      return null;
  }
}

function SocialLinksBar({ links, className }: { links: { type: string; url: string }[]; className?: string }) {
  if (links.length === 0) return null;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {links.map(({ type, url }) => (
        <a
          key={type}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
          aria-label={type}
        >
          <SocialIcon type={type} size={14} />
        </a>
      ))}
    </div>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMegaCategoryOpen, setIsMegaCategoryOpen] = useState(false);
  const [megaOpenAccordion, setMegaOpenAccordion] = useState<string | null>(null);
  const [megaSearch, setMegaSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const megaDropdownRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { itemCount } = useCart();
  const { data: categoriesTree } = useCategoriesTree();
  const { logoUrl } = useLogoUrl();
  const { navbarStyle } = useNavbarStyle();
  const { data: logoSizeSetting } = useSiteSetting('logo_size');
  const { data: sloganSetting } = useSiteSetting('site_slogan');
  const logoSize = parseInt(logoSizeSetting?.value || '40', 10);
  const { socialLinks } = useSocialLinks();
  const { data: installAppSetting } = useSiteSetting('install_app_enabled');
  const { data: siteNameSetting } = useSiteSetting('site_name');
  const { data: navbarPages } = useNavbarPages();
  const siteName = siteNameSetting?.value || '';
  const isInstallAppEnabled = installAppSetting?.value === 'true';

  const activeSocialLinks = Object.entries(socialLinks)
    .filter(([, url]) => url)
    .map(([type, url]) => ({ type, url: url! }));

  // Navbar shows only parent categories explicitly enabled for the navbar.
  // Sub-categories are shown as children once a parent is enabled.
  const parentCategories = (categoriesTree || []).filter(cat => !cat.parent_id && cat.show_in_navbar);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset accordion when menu closes
  useEffect(() => {
    if (!isMenuOpen) {
      setOpenAccordion(null);
    }
  }, [isMenuOpen]);

  // Close mega dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaDropdownRef.current && !megaDropdownRef.current.contains(e.target as Node)) {
        setIsMegaCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scrollable categories: check scroll state
  const checkScrollable = useCallback(() => {
    const el = scrollableRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollableRef.current;
    if (!el) return;
    checkScrollable();
    el.addEventListener('scroll', checkScrollable);
    const ro = new ResizeObserver(checkScrollable);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', checkScrollable); ro.disconnect(); };
  }, [checkScrollable, parentCategories]);

  const scrollCategories = (dir: 'left' | 'right') => {
    const el = scrollableRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const toggleAccordion = (categoryId: string) => {
    setOpenAccordion(prev => prev === categoryId ? null : categoryId);
  };

  const handleDropdownEnter = (categoryId: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setOpenDropdown(categoryId);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const navClasses = getNavbarClasses(navbarStyle, isScrolled);
  const colors = getTextClasses(navbarStyle);
  const dd = getDropdownClasses(navbarStyle);
  const isCentered = navbarStyle === 'centered';
  const isPill = navbarStyle === 'pill';
  const isFloating = navbarStyle === 'floating';
  const isMega = navbarStyle === 'mega';
  const isScrollable = navbarStyle === 'scrollable';
  const needsWrapper = isPill || isFloating;

  const wrapperClasses = isPill
    ? "fixed top-2 left-4 right-4 z-50 transition-all duration-300"
    : isFloating
      ? "fixed top-3 left-6 right-6 z-50 transition-all duration-300"
      : "fixed top-0 left-0 right-0 z-50 transition-all duration-300";

  const innerShapeClasses = isPill
    ? cn("bg-navbar-bg text-navbar-text rounded-full shadow-lg shadow-foreground/8 transition-all duration-300", isScrolled && "shadow-xl shadow-foreground/12")
    : isFloating
      ? cn("bg-navbar-bg text-navbar-text rounded-2xl shadow-xl shadow-foreground/10 border border-navbar-text/5 transition-all duration-300", isScrolled && "shadow-2xl shadow-foreground/15")
      : "";

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          wrapperClasses,
          !needsWrapper && navClasses
        )}
      >
        {isScrollable ? (
          /* ===== SCROLLABLE NAVBAR LAYOUT ===== */
          <div className="bg-navbar-bg text-navbar-text">
            {/* Main Row: Logo + Cart */}
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex items-center justify-between h-16 lg:h-20">
                {/* Mobile Menu */}
                <button
                  className="lg:hidden p-2 -ml-2 text-navbar-text"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Menu"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Logo */}
                <Link to="/" className="flex items-center shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="object-contain" style={{ height: `${logoSize}px`, maxWidth: '180px' }} />
                  ) : (
                    <span className="font-serif text-xl lg:text-2xl font-semibold tracking-[0.2em] text-navbar-text">{siteName}</span>
                  )}
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative p-2.5 rounded-full text-navbar-text hover:bg-navbar-text/10 transition-all group">
                  <ShoppingBag size={22} className="transition-transform group-hover:scale-110" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-destructive text-destructive-foreground text-[11px] font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-navbar-bg">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Scrollable Categories Bar */}
            <div className="block border-t border-navbar-text/10 bg-navbar-text/5">
              <div className="container mx-auto px-0 md:px-4 lg:px-8 relative">
                {/* Left arrow - hidden on mobile, visible on tablet/desktop if scrollable */}
                <AnimatePresence>
                  {canScrollLeft && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => scrollCategories('left')}
                      className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-gradient-to-r from-navbar-bg via-navbar-bg/80 to-transparent text-navbar-text"
                      aria-label="Défiler à gauche"
                    >
                      <ChevronLeft size={20} />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Scrollable container */}
                <div
                  ref={scrollableRef}
                  className="flex items-center overflow-x-auto scrollbar-none py-2 px-4 md:px-0 scroll-smooth snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <Link
                    to="/"
                    className={cn(
                      "shrink-0 px-5 py-2.5 mx-1 text-sm font-medium tracking-wider uppercase rounded-full transition-all duration-300 whitespace-nowrap snap-start flex-[0_0_auto]",
                      location.pathname === "/"
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-navbar-text/80 hover:text-navbar-text hover:bg-navbar-text/10 hover:-translate-y-0.5 story-link"
                    )}
                  >
                    Accueil
                  </Link>

                  <Link
                    to="/products"
                    className={cn(
                      "shrink-0 px-5 py-2.5 mx-1 text-sm font-medium tracking-wider uppercase rounded-full transition-all duration-300 whitespace-nowrap snap-start flex-[0_0_auto]",
                      location.pathname === "/products"
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-navbar-text/80 hover:text-navbar-text hover:bg-navbar-text/10 hover:-translate-y-0.5 story-link"
                    )}
                  >
                    Nos produits
                  </Link>

                  {parentCategories.map((category) => {
                    const hasChildren = category.children && category.children.length > 0;
                    const isActive = location.pathname === `/category/${category.slug}` || location.pathname.startsWith(`/category/${category.slug}/`);
                    
                    return (
                      <div key={category.id} className="relative shrink-0 mx-1 snap-start flex-[0_0_auto]"
                        onMouseEnter={() => handleDropdownEnter(category.id)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        {hasChildren ? (
                          <button
                            className={cn(
                              "flex items-center gap-1 px-5 py-2.5 text-sm font-medium tracking-wider uppercase rounded-full transition-all duration-300 whitespace-nowrap min-w-[120px] justify-center",
                              isActive || openDropdown === category.id
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "text-navbar-text/80 hover:text-navbar-text hover:bg-navbar-text/10 hover:-translate-y-0.5 story-link"
                            )}
                          >
                            <span className="max-w-[200px] truncate">{category.name}</span>
                            <ChevronDown size={14} className={cn("transition-transform duration-300 shrink-0", openDropdown === category.id && "rotate-180")} />
                          </button>
                        ) : (
                          <Link
                            to={`/category/${category.slug}`}
                            className={cn(
                              "flex items-center justify-center px-5 py-2.5 text-sm font-medium tracking-wider uppercase rounded-full transition-all duration-300 whitespace-nowrap min-w-[120px]",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "text-navbar-text/80 hover:text-navbar-text hover:bg-navbar-text/10 hover:-translate-y-0.5 story-link"
                            )}
                          >
                            <span className="max-w-[200px] truncate">{category.name}</span>
                          </Link>
                        )}

                        {/* Dropdown */}
                        <AnimatePresence>
                          {hasChildren && openDropdown === category.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[240px] bg-navbar-bg rounded-2xl shadow-xl shadow-black/10 border border-navbar-text/10 overflow-hidden z-50 backdrop-blur-md"
                            >
                              <div className="p-2 max-h-[50vh] overflow-y-auto">
                                <Link
                                  to={`/category/${category.slug}`}
                                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-navbar-text hover:bg-navbar-text/10 transition-all"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  Tous les {category.name}
                                </Link>
                                <div className="h-px bg-navbar-text/10 my-1" />
                                {category.children?.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    to={`/category/${sub.slug}`}
                                    className="block px-4 py-2 rounded-lg text-sm text-navbar-text/70 hover:text-navbar-text hover:bg-navbar-text/10 transition-all"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                   })}

                  {navbarPages?.map((page) => (
                    <Link
                      key={page.id}
                      to={`/page/${page.slug}`}
                      className={cn(
                        "shrink-0 px-5 py-2.5 mx-1 text-sm font-medium tracking-wider uppercase rounded-full transition-all duration-300 whitespace-nowrap snap-start flex-[0_0_auto]",
                        location.pathname === `/page/${page.slug}`
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-navbar-text/80 hover:text-navbar-text hover:bg-navbar-text/10 hover:-translate-y-0.5 story-link"
                      )}
                    >
                      {page.navbar_label || page.title}
                    </Link>
                  ))}
                </div>

                {/* Right arrow - hidden on mobile */}
                <AnimatePresence>
                  {canScrollRight && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => scrollCategories('right')}
                      className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-gradient-to-l from-navbar-bg via-navbar-bg/80 to-transparent text-navbar-text"
                      aria-label="Défiler à droite"
                    >
                      <ChevronRight size={20} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : isMega ? (
          /* ===== MEGA NAVBAR LAYOUT ===== */
          <div className="bg-navbar-bg text-navbar-text">
            {/* Top Bar */}
            <div className="bg-primary text-primary-foreground">
              <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-8 text-xs">
                <span className="hidden sm:block opacity-80 text-black">{sloganSetting?.value || ''}</span>
                <div className="flex items-center gap-4">
                  <SocialLinksBar links={activeSocialLinks} className="mr-2" />
                  <Link to="/" className="hover:underline opacity-80 hover:opacity-100 transition-opacity text-black">Accueil</Link>
                  <Link to="/products" className="hover:underline opacity-80 hover:opacity-100 transition-opacity text-black">Tous les produits</Link>
                  {isInstallAppEnabled && (
                    <Link to="/install" className="flex items-center gap-1 hover:underline opacity-80 hover:opacity-100 transition-opacity">
                      <Download size={12} />
                      Installer l'app
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {/* Main Bar */}
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex items-center gap-4 h-16 lg:h-20">
                {/* Mobile Menu Button */}
                <button
                  className="lg:hidden p-2 -ml-2 text-navbar-text"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Menu"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Logo */}
                <Link to="/" className="flex items-center shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="object-contain" style={{ height: `${logoSize}px`, maxWidth: '180px' }} />
                  ) : (
                    <span className="font-serif text-xl lg:text-2xl font-semibold tracking-[0.2em] text-navbar-text">{siteName}</span>
                  )}
                </Link>

                {/* Category Dropdown Button (desktop) */}
                <div className="hidden lg:block relative" ref={megaDropdownRef}>
                  <button
                    onClick={() => setIsMegaCategoryOpen(!isMegaCategoryOpen)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isMegaCategoryOpen
                        ? "bg-navbar-text/20 text-navbar-text"
                        : "bg-navbar-text/10 text-navbar-text hover:bg-navbar-text/15"
                    )}
                  >
                    <Menu size={18} />
                    Parcourir les catégories
                    <ChevronDown size={14} className={cn("transition-transform", isMegaCategoryOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isMegaCategoryOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-[280px] bg-navbar-bg rounded-xl shadow-2xl border border-navbar-text/10 overflow-hidden z-50"
                      >
                        <div className="p-2 max-h-[60vh] overflow-y-auto">
                          {parentCategories.map((category) => {
                            const hasChildren = category.children && category.children.length > 0;
                            const isAccOpen = megaOpenAccordion === category.id;
                            return (
                              <div key={category.id}>
                                {hasChildren ? (
                                  <>
                                    <button
                                      onClick={() => setMegaOpenAccordion(prev => prev === category.id ? null : category.id)}
                                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm text-navbar-text/80 hover:text-navbar-text hover:bg-navbar-text/10 transition-all"
                                    >
                                      <span>{category.name}</span>
                                      <ChevronDown size={14} className={cn("transition-transform duration-200", isAccOpen && "rotate-180")} />
                                    </button>
                                    <AnimatePresence initial={false}>
                                      {isAccOpen && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2, ease: "easeInOut" }}
                                          className="overflow-hidden"
                                        >
                                          <div className="ml-3 pl-3 border-l-2 border-navbar-text/15 space-y-0.5 pb-1">
                                            <Link
                                              to={`/category/${category.slug}`}
                                              className="block px-4 py-2 rounded-lg text-xs font-medium text-navbar-text/70 hover:text-navbar-text hover:bg-navbar-text/10 transition-all"
                                              onClick={() => setIsMegaCategoryOpen(false)}
                                            >
                                              Tous les {category.name}
                                            </Link>
                                            {category.children?.map((sub) => (
                                              <Link
                                                key={sub.id}
                                                to={`/category/${sub.slug}`}
                                                className="block px-4 py-2 rounded-lg text-xs text-navbar-text/60 hover:text-navbar-text hover:bg-navbar-text/10 transition-all"
                                                onClick={() => setIsMegaCategoryOpen(false)}
                                              >
                                                {sub.name}
                                              </Link>
                                            ))}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </>
                                ) : (
                                  <Link
                                    to={`/category/${category.slug}`}
                                    className="flex items-center px-4 py-2.5 rounded-lg text-sm text-navbar-text/80 hover:text-navbar-text hover:bg-navbar-text/10 transition-all"
                                    onClick={() => setIsMegaCategoryOpen(false)}
                                  >
                                    {category.name}
                                  </Link>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Bar */}
                <form
                  className="flex-1 hidden sm:flex items-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (megaSearch.trim()) {
                      navigate(`/products?search=${encodeURIComponent(megaSearch.trim())}`);
                      setMegaSearch('');
                    }
                  }}
                >
                  <div className="relative w-full max-w-xl">
                    <input
                      type="text"
                      value={megaSearch}
                      onChange={(e) => setMegaSearch(e.target.value)}
                      placeholder="Rechercher un produit..."
                      className="w-full h-10 pl-4 pr-12 rounded-lg border border-navbar-text/20 bg-navbar-text/5 text-navbar-text placeholder:text-navbar-text/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                    />
                    <button
                      type="submit"
                      className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-r-lg hover:bg-primary/90 transition-colors"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </form>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-full text-navbar-text hover:bg-navbar-text/10 transition-all group"
                >
                  <ShoppingBag size={22} className="transition-transform group-hover:scale-110" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-300 text-black-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        ) : (
        <div className={cn(needsWrapper && innerShapeClasses)}>
        <div className={cn("container mx-auto px-4 lg:px-8", isCentered && "flex flex-col items-center", isPill && "px-6")}>
          <div className={cn("flex items-center justify-between", isCentered ? "w-full" : "", "h-16 lg:h-20")}>
            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className={cn("lg:hidden p-2 -ml-2 transition-colors rounded-lg", colors.text, colors.hover)}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Logo */}
            <Link to="/" className="flex items-center group">
              {logoUrl ? (
                <motion.img
                  src={logoUrl}
                  alt="Logo"
                  className="object-contain opacity-95 hover:opacity-100 transition-all duration-300"
                  style={{ height: `${logoSize}px`, maxWidth: '200px' }}
                  whileHover={{ scale: 1.02 }}
                />
              ) : (
                <motion.span
                  className={cn("font-serif text-xl lg:text-2xl font-semibold tracking-[0.2em]", colors.logo)}
                  whileHover={{ scale: 1.02 }}
                >
                  {siteName}
                </motion.span>
              )}
            </Link>

            {/* Desktop Navigation - hidden in centered mode (shown below) */}
            <nav className={cn("hidden lg:flex items-center gap-1", isCentered && "!hidden")}>
              {/* Ajout du lien Accueil avec style bordure */}
              <Link
                to="/"
                className={cn(
                  "px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all duration-300 rounded-lg",
                  location.pathname === "/"
                    ? colors.active
                    : cn(colors.text, colors.hover)
                )}
              >
                Accueil
              </Link>

              {/* Products mega-dropdown */}
              {parentCategories.length > 0 ? (
                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter('__products__')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all duration-300 rounded-lg",
                      openDropdown === '__products__'
                        ? colors.active
                        : cn(colors.text, colors.hover)
                    )}
                  >
                    Produits
                    <ChevronDown
                      size={14}
                      className={cn("transition-transform duration-200", openDropdown === '__products__' && "rotate-180")}
                    />
                  </button>

                  <AnimatePresence>
                    {openDropdown === '__products__' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className={cn("absolute left-0 top-full mt-2 rounded-xl shadow-xl border overflow-hidden z-50", dd.bg, dd.border,
                          parentCategories.length > 8 ? "w-[480px]" : "w-[260px]"
                        )}
                      >
                        <div className={cn("p-2 max-h-[70vh] overflow-y-auto", parentCategories.length > 8 && "grid grid-cols-2 gap-x-2")}>
                          <div className={parentCategories.length > 8 ? "col-span-2" : ""}>
                            <Link
                              to="/products"
                              className={cn("block px-4 py-2.5 rounded-lg text-sm transition-all", dd.allText, dd.itemHover)}
                              onClick={() => setOpenDropdown(null)}
                            >
                              Tous les produits
                            </Link>
                            <div className={cn("h-px my-1.5", dd.separator, parentCategories.length > 8 && "col-span-2")} />
                          </div>
                          {parentCategories.map((category) => {
                            const hasChildren = category.children && category.children.length > 0;
                            return (
                              <div key={category.id}>
                                <Link
                                  to={`/category/${category.slug}`}
                                  className={cn("block px-4 py-2 rounded-lg text-sm font-medium transition-all", dd.itemText, dd.itemHover)}
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  {category.name}
                                </Link>
                                {hasChildren && (
                                  <div className="ml-3 pl-3 border-l border-current/10 space-y-0.5 mb-1">
                                    {category.children?.map((sub) => (
                                      <Link
                                        key={sub.id}
                                        to={`/category/${sub.slug}`}
                                        className={cn("block px-3 py-1.5 rounded-lg text-xs transition-all truncate", dd.itemText, dd.itemHover)}
                                        onClick={() => setOpenDropdown(null)}
                                      >
                                        {sub.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/products"
                  className={cn("px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all duration-300 rounded-lg", colors.text, colors.hover)}
                >
                  Produits
                </Link>
              )}

              {navbarPages?.map((page) => (
                <Link
                  key={page.id}
                  to={`/page/${page.slug}`}
                  className={cn("px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all duration-300 rounded-lg", colors.text, colors.hover)}
                >
                  {page.navbar_label || page.title}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className={cn("relative p-2.5 rounded-full transition-all duration-300 group", colors.cart)}
              >
                <ShoppingBag size={22} className="transition-transform group-hover:scale-110" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          </div>

          {/* Centered style: navigation row below logo */}
          {isCentered && (
            <nav className="hidden lg:flex items-center justify-center gap-1 pb-2">
              {/* Ajout du lien Accueil pour le style centered */}
              <Link
                to="/"
                className={cn(
                  "px-4 py-1.5 text-sm font-medium tracking-wider uppercase transition-all duration-300 rounded-lg",
                  location.pathname === "/"
                    ? colors.active
                    : cn(colors.text, colors.hover)
                )}
              >
                Accueil
              </Link>

              {parentCategories.length > 0 ? (
                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter('__products_centered__')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 px-4 py-1.5 text-sm font-medium tracking-wider uppercase transition-all duration-300 rounded-lg",
                      openDropdown === '__products_centered__' ? colors.active : cn(colors.text, colors.hover)
                    )}
                  >
                    Produits
                    <ChevronDown size={14} className={cn("transition-transform duration-200", openDropdown === '__products_centered__' && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === '__products_centered__' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className={cn("absolute left-1/2 -translate-x-1/2 top-full mt-2 rounded-xl shadow-xl border overflow-hidden z-50", dd.bg, dd.border,
                          parentCategories.length > 8 ? "w-[480px]" : "w-[260px]"
                        )}
                      >
                        <div className={cn("p-2 max-h-[70vh] overflow-y-auto", parentCategories.length > 8 && "grid grid-cols-2 gap-x-2")}>
                          <div className={parentCategories.length > 8 ? "col-span-2" : ""}>
                            <Link to="/products" className={cn("block px-4 py-2.5 rounded-lg text-sm transition-all", dd.allText, dd.itemHover)} onClick={() => setOpenDropdown(null)}>
                              Tous les produits
                            </Link>
                            <div className={cn("h-px my-1.5", dd.separator)} />
                          </div>
                          {parentCategories.map((category) => {
                            const hasChildren = category.children && category.children.length > 0;
                            return (
                              <div key={category.id}>
                                <Link to={`/category/${category.slug}`} className={cn("block px-4 py-2 rounded-lg text-sm font-medium transition-all", dd.itemText, dd.itemHover)} onClick={() => setOpenDropdown(null)}>
                                  {category.name}
                                </Link>
                                {hasChildren && (
                                  <div className="ml-3 pl-3 border-l border-current/10 space-y-0.5 mb-1">
                                    {category.children?.map((sub) => (
                                      <Link key={sub.id} to={`/category/${sub.slug}`} className={cn("block px-3 py-1.5 rounded-lg text-xs transition-all truncate", dd.itemText, dd.itemHover)} onClick={() => setOpenDropdown(null)}>
                                        {sub.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/products" className={cn("px-4 py-1.5 text-sm font-medium tracking-wider uppercase transition-all duration-300 rounded-lg", colors.text, colors.hover)}>
                  Produits
                </Link>
              )}
              {navbarPages?.map((page) => (
                <Link
                  key={page.id}
                  to={`/page/${page.slug}`}
                  className={cn("px-4 py-1.5 text-sm font-medium tracking-wider uppercase transition-all duration-300 rounded-lg", colors.text, colors.hover)}
                >
                  {page.navbar_label || page.title}
                </Link>
              ))}
            </nav>
          )}
        </div>
        </div>
        )}
      </motion.header>

      {/* Mobile Navigation Overlay (outside header transform so "fixed" is viewport-fixed) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 top-16 bg-navbar-bg/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu */}
            <motion.nav
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-16 bottom-0 w-[280px] bg-navbar-bg border-r border-accent/20 shadow-2xl z-[110] overflow-y-auto flex flex-col"
            >
              {/* Logo in sidebar */}
              <div className="px-6 py-4 border-b border-navbar-text/10">
                <Link to="/" className="block" onClick={() => setIsMenuOpen(false)}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="object-contain" style={{ height: `${logoSize}px`, maxWidth: '160px' }} />
                  ) : (
                    <span className="font-serif text-xl font-semibold tracking-[0.2em] text-navbar-text">{siteName}</span>
                  )}
                </Link>
              </div>

              <div className="flex-1 p-4 flex flex-col gap-1">
                {/* Lien Accueil dans le menu mobile */}
                <Link
                  to="/"
                  className="flex items-center px-4 py-3.5 rounded-xl text-navbar-text hover:text-navbar-bg hover:bg-accent transition-all text-sm font-medium tracking-wider uppercase"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accueil
                </Link>

                {/* Produits accordion - wraps all categories */}
                <div className="space-y-1">
                  <button
                    onClick={() => toggleAccordion('__mobile_products__')}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-navbar-text hover:text-navbar-bg hover:bg-accent transition-all text-sm font-medium tracking-wider uppercase"
                  >
                    <span>Produits</span>
                    <motion.div
                      animate={{ rotate: openAccordion === '__mobile_products__' ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {openAccordion === '__mobile_products__' ? (
                        <Minus size={16} className="text-accent" />
                      ) : (
                        <Plus size={16} className="text-navbar-text/60" />
                      )}
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openAccordion === '__mobile_products__' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 pl-4 border-l-2 border-accent/30 space-y-1 pb-2">
                          <Link
                            to="/products"
                            className="block px-4 py-2.5 rounded-lg text-navbar-text font-medium hover:text-navbar-bg hover:bg-accent transition-all text-sm"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Tous les produits
                          </Link>

                          {parentCategories.map((category) => {
                            const hasChildren = category.children && category.children.length > 0;
                            const isCatOpen = openAccordion === `__mobile_cat_${category.id}__`;

                            return (
                              <div key={category.id}>
                                {hasChildren ? (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenAccordion(prev => prev === `__mobile_cat_${category.id}__` ? '__mobile_products__' : `__mobile_cat_${category.id}__`);
                                      }}
                                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-navbar-text/80 hover:text-navbar-bg hover:bg-accent transition-all text-sm"
                                    >
                                      <span className="truncate">{category.name}</span>
                                      <ChevronDown size={12} className={cn("shrink-0 transition-transform duration-200", isCatOpen && "rotate-180")} />
                                    </button>
                                    <AnimatePresence initial={false}>
                                      {isCatOpen && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2, ease: "easeInOut" }}
                                          className="overflow-hidden"
                                        >
                                          <div className="ml-3 pl-3 border-l border-accent/20 space-y-0.5 pb-1">
                                            <Link
                                              to={`/category/${category.slug}`}
                                              className="block px-3 py-2 rounded-lg text-navbar-text/70 hover:text-navbar-bg hover:bg-accent transition-all text-xs"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              Tous les {category.name}
                                            </Link>
                                            {category.children?.map((sub) => (
                                              <Link
                                                key={sub.id}
                                                to={`/category/${sub.slug}`}
                                                className="block px-3 py-2 rounded-lg text-navbar-text/60 hover:text-navbar-bg hover:bg-accent transition-all text-xs truncate"
                                                onClick={() => setIsMenuOpen(false)}
                                              >
                                                {sub.name}
                                              </Link>
                                            ))}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </>
                                ) : (
                                  <Link
                                    to={`/category/${category.slug}`}
                                    className="block px-4 py-2.5 rounded-lg text-navbar-text/80 hover:text-navbar-bg hover:bg-accent transition-all text-sm truncate"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    {category.name}
                                  </Link>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-px bg-accent/20 my-2" />

                {/* Custom Pages */}
                {navbarPages && navbarPages.length > 0 && (
                  <>
                    <div className="h-px bg-accent/20 my-2" />
                    {navbarPages.map((page) => (
                      <Link
                        key={page.id}
                        to={`/page/${page.slug}`}
                        className="flex items-center justify-between px-4 py-3.5 rounded-xl text-navbar-text hover:text-navbar-bg hover:bg-accent transition-all text-sm font-medium tracking-wider uppercase"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {page.navbar_label || page.title}
                      </Link>
                    ))}
                  </>
                )}
              </div>

              {/* Install app link */}
              {isInstallAppEnabled && (
                <div className="px-6 py-3 border-t border-navbar-text/10 mt-auto">
                  <Link
                    to="/install"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-navbar-text hover:text-navbar-bg hover:bg-accent transition-all text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Download size={18} />
                    Installer l'application
                  </Link>
                </div>
              )}

              {/* Social links at bottom of sidebar */}
              {activeSocialLinks.length > 0 && (
                <div className="px-6 py-4 border-t border-navbar-text/10 mt-auto">
                  <p className="text-xs text-navbar-text/50 mb-2 uppercase tracking-wider">Suivez-nous</p>
                  <div className="flex items-center gap-3">
                    {activeSocialLinks.map(({ type, url }) => (
                      <a
                        key={type}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-navbar-text/10 text-navbar-text hover:bg-primary hover:text-primary-foreground transition-all"
                        aria-label={type}
                      >
                        <SocialIcon type={type} size={18} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}