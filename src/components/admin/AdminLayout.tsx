import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Grid, ShoppingCart, LogOut, Settings, Images, Ticket, Users, LayoutDashboard, Sparkles, Eye, Store, CheckSquare, FolderCheck, MessageSquare, Navigation, FileText, LucideIcon, Menu, X, Palette, LayoutGrid, CreditCard, ChevronDown } from 'lucide-react';
import { AdminSection } from '@/hooks/useAdminUsers';
import { supabase } from '@/integrations/supabase/client';
import { useLogoUrl } from '@/hooks/useSiteSettings';
import { useIsMultiVendorEnabled } from '@/hooks/useMultiVendorSetting';
import { useCurrentAdminPermissions } from '@/hooks/useAdminUsers';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  requiresMultiVendor?: boolean;
  requiredPermission?: AdminSection;
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Produits', path: '/admin/products', icon: Package, requiredPermission: 'products' },
  { label: 'Approbation Produits', path: '/admin/product-approvals', icon: CheckSquare, requiresMultiVendor: true },
  { label: 'Catégories', path: '/admin/categories', icon: Grid, requiredPermission: 'categories' },
  { label: 'Approbation Catégories', path: '/admin/category-approvals', icon: FolderCheck, requiresMultiVendor: true },
  { label: 'Navbar Catégories', path: '/admin/navbar-categories', icon: Navigation, requiredPermission: 'categories' },
  { label: 'Vendeurs', path: '/admin/vendors', icon: Store, requiresMultiVendor: true },
  { label: 'Messages Boutiques', path: '/admin/vendor-messages', icon: MessageSquare, requiresMultiVendor: true },
  { label: 'Commandes', path: '/admin/orders', icon: ShoppingCart, requiredPermission: 'orders' },
  { label: 'Coupons', path: '/admin/coupons', icon: Ticket, requiredPermission: 'coupons' },
  { label: 'Slider Hero', path: '/admin/hero', icon: Images, requiredPermission: 'hero_slides' },
  { label: 'Sections Accueil', path: '/admin/home-sections', icon: Sparkles, requiredPermission: 'hero_slides' },
  { label: 'Visibilité Sections', path: '/admin/sections-visibility', icon: Eye, requiredPermission: 'hero_slides' },
  { label: 'Paramètres', path: '/admin/settings', icon: Settings, requiredPermission: 'settings' },
  { label: 'Design Settings', path: '/admin/design', icon: Palette, requiredPermission: 'settings' },
  { label: 'Modules', path: '/admin/modules', icon: LayoutGrid, requiredPermission: 'settings' },
  { label: 'Paiement', path: '/admin/payment', icon: CreditCard, requiredPermission: 'settings' },
  { label: 'Pages', path: '/admin/pages', icon: FileText, requiredPermission: 'settings' },
  { label: 'Administrateurs', path: '/admin/users', icon: Users, requiredPermission: 'admin_users' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMultiVendorEnabled } = useIsMultiVendorEnabled();
  const { hasPermission, role } = useCurrentAdminPermissions();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  useDocumentMeta('Admin');

  // Fermer la sidebar mobile lors du changement de route
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Sauvegarder l'état de la sidebar dans localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('admin-sidebar-collapsed');
    if (savedState !== null && !isMobile) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newState));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const { logoUrl } = useLogoUrl();

  const filteredNavItems = navItems.filter(item => {
    if (item.requiresMultiVendor) {
      if (!isMultiVendorEnabled) return false;
      if (role !== 'super_admin' && !hasPermission('vendors')) return false;
    }
    if (item.requiredPermission && role !== 'super_admin') {
      if (!hasPermission(item.requiredPermission)) return false;
    }
    return true;
  });

  const NavLink = ({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) => {
    const Icon = item.icon;
    
    if (isCollapsed && !isMobile) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={item.path}
                onClick={onClick}
                className={`flex items-center justify-center w-full px-2 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-navbar-text/70 hover:bg-navbar-text/5 hover:text-navbar-text'
                }`}
              >
                <Icon size={20} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
          isActive
            ? 'bg-primary/20 text-primary'
            : 'text-navbar-text/70 hover:bg-navbar-text/5 hover:text-navbar-text'
        }`}
      >
        <Icon size={18} className="shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <div className={`p-6 border-b border-navbar-text/10 flex items-center justify-between ${isCollapsed && !isMobile ? 'flex-col gap-4' : ''}`}>
        <Link to="/" className="block shrink-0">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className={`object-contain transition-all duration-200 ${isCollapsed && !isMobile ? 'h-10 w-10' : 'h-8 max-w-[160px]'}`} 
            />
          ) : (
            <span className={`font-serif font-light tracking-wider text-primary ${isCollapsed && !isMobile ? 'text-lg' : 'text-xl'}`}>
              {isCollapsed && !isMobile ? 'A' : 'ATELIER'}
            </span>
          )}
        </Link>
        {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-navbar-text/50 hover:text-navbar-text"
          >
            <ChevronDown size={18} className={`transform transition-transform duration-200 ${isCollapsed ? 'rotate-90' : '-rotate-90'}`} />
          </Button>
        )}
      </div>
      {(!isCollapsed || isMobile) && (
        <p className="text-xs text-navbar-text/50 px-6 pt-2">Administration</p>
      )}

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink 
                key={item.path} 
                item={item} 
                isActive={isActive} 
                onClick={onItemClick}
              />
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-navbar-text/10">
        <button
          onClick={() => {
            handleLogout();
            onItemClick?.();
          }}
          className={`flex items-center gap-3 w-full text-sm text-navbar-text/70 hover:bg-navbar-text/5 hover:text-navbar-text rounded-lg transition-colors ${
            isCollapsed && !isMobile ? 'justify-center px-2 py-3' : 'px-4 py-3'
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {(!isCollapsed || isMobile) && <span>Déconnexion</span>}
        </button>
      </div>
    </>
  );

  // Version mobile avec Sheet
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-background border-b px-4 py-3 flex items-center justify-between">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-navbar-bg text-navbar-text">
              <SidebarContent onItemClick={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
          
          <Link to="/admin/dashboard" className="block">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-6 max-w-[120px] object-contain" />
            ) : (
              <span className="font-serif text-lg font-light tracking-wider text-primary">ATELIER</span>
            )}
          </Link>
          
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut size={18} />
          </Button>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 md:p-8">{children}</div>
        </main>
      </div>
    );
  }

  // Version desktop avec sidebar collapsible
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Desktop */}
      <aside
        className={`
          bg-navbar-bg text-navbar-text flex flex-col
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          shrink-0 border-r border-navbar-text/10
        `}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Desktop */}
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Breadcrumb / Page Title (optional) */}
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">
              {navItems.find(item => item.path === location.pathname)?.label || 'Administration'}
            </h1>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}