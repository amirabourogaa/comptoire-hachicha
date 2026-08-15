import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const isUserAdmin = await checkUserIsAdmin(userId);
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error('Error:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foreground">
        <p className="text-background/60">Chargement...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foreground">
        <div className="text-center">
          <p className="text-background text-xl mb-4">Accès refusé</p>
          <p className="text-background/60 mb-6">
            Vous devez être administrateur pour accéder à cette page.
          </p>
          <a
            href="/admin"
            className="text-accent hover:text-accent/80 underline"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
