import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Loader2 } from 'lucide-react';

interface VendorRouteProps {
  children: React.ReactNode;
}

export function VendorRoute({ children }: VendorRouteProps) {
  const { user, isVendor, isLoading } = useVendorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/vendor');
      } else if (!isVendor) {
        navigate('/vendor');
      }
    }
  }, [user, isVendor, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isVendor) {
    return null;
  }

  return <>{children}</>;
}
