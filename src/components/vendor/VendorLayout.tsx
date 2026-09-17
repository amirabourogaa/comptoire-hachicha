import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, LogOut, LayoutDashboard, User, FolderTree, MessageSquare, ShoppingBag, Menu } from 'lucide-react';
import { useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { useLogoUrl } from '@/hooks/useSiteSettings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface VendorLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Tableau de bord', path: '/vendor/dashboard', icon: LayoutDashboard },
  { label: 'Mes Commandes', path: '/vendor/orders', icon: ShoppingBag },
  { label: 'Mes Produits', path: '/vendor/products', icon: Package },
  { label: 'Mes Catégories', path: '/vendor/categories', icon: FolderTree },
  { label: 'Mes Messages', path: '/vendor/messages', icon: MessageSquare },
];

export function VendorLayout({ children }: VendorLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, vendorInfo } = useVendorAuth();
  const { logoUrl } = useLogoUrl();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/vendor');
  };

  const navigation = (
    <>
      <div className="p-6 border-b border-primary-foreground/10">
        <Link to="/" className="block" onClick={() => setSidebarOpen(false)}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 max-w-[160px] object-contain brightness-0 invert" />
          ) : (
            <span className="font-serif text-xl font-light tracking-wider">ATELIER</span>
          )}
        </Link>
        <p className="text-xs text-primary-foreground/50 mt-1">Espace Vendeur</p>
      </div>

      {vendorInfo && (
        <div className="p-4 border-b border-primary-foreground/10">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={vendorInfo.logo_url || undefined} />
              <AvatarFallback className="bg-primary-foreground/20"><User className="h-5 w-5" /></AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{vendorInfo.name}</p>
              <p className="text-xs text-primary-foreground/50 truncate">{vendorInfo.email}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}>
              <Icon size={18} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-foreground/10">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-sm text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground rounded transition-colors">
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background min-w-0">
      <div className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-3">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Ouvrir le menu"><Menu size={20} /></Button></SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-primary text-primary-foreground">
            <div className="flex h-full flex-col">{navigation}</div>
          </SheetContent>
        </Sheet>
        <Link to="/vendor/dashboard" className="font-serif text-lg font-light tracking-wider text-primary">ATELIER</Link>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Déconnexion"><LogOut size={18} /></Button>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 shrink-0 bg-primary text-primary-foreground flex-col">{navigation}</aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
