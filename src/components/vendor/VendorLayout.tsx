import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, LogOut, LayoutDashboard, User, FolderTree, MessageSquare, ShoppingBag } from 'lucide-react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { useLogoUrl } from '@/hooks/useSiteSettings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  const handleLogout = async () => {
    await signOut();
    navigate('/vendor');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col">
        <div className="p-6 border-b border-primary-foreground/10">
          <Link to="/" className="block">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 max-w-[160px] object-contain brightness-0 invert" />
            ) : (
              <span className="font-serif text-xl font-light tracking-wider">ATELIER</span>
            )}
          </Link>
          <p className="text-xs text-primary-foreground/50 mt-1">Espace Vendeur</p>
        </div>

        {/* Vendor Info */}
        {vendorInfo && (
          <div className="p-4 border-b border-primary-foreground/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={vendorInfo.logo_url || undefined} />
                <AvatarFallback className="bg-primary-foreground/20">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{vendorInfo.name}</p>
                <p className="text-xs text-primary-foreground/50 truncate">{vendorInfo.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground rounded transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
