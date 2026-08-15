import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';

// ============================================================
// 🔄 MERN API (décommentez pour utiliser le backend externe)
// ============================================================
// import { authService } from '@/services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Get the intended destination from state (set by AdminRoute)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/products';

  const checkAdminAndRedirect = async (userId: string) => {
    try {
      const isAdmin = await checkUserIsAdmin(userId);

      if (isAdmin) {
        navigate(from, { replace: true });
        return true;
      }

      toast.error('Vous n\'êtes pas autorisé à accéder à l\'administration');
      await supabase.auth.signOut();
      return false;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && event === 'SIGNED_IN') {
        setTimeout(() => {
          checkAdminAndRedirect(session.user.id).then(() => {
            setIsCheckingSession(false);
          });
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdminAndRedirect(session.user.id).then(() => {
          setIsCheckingSession(false);
        });
      } else {
        setIsCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, from]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const redirectUrl = `${window.location.origin}/admin/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast.success('Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.');
      setShowResetForm(false);
      setResetEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const isAdminUser = await checkAdminAndRedirect(data.user.id);
        if (!isAdminUser) {
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('Invalid login credentials')) {
        toast.error('Email ou mot de passe incorrect. Avez-vous créé un compte sur cette instance ?');
      } else if (msg.includes('Email not confirmed')) {
        toast.error('Votre email n\'est pas encore confirmé. Vérifiez votre boîte de réception.');
      } else {
        toast.error(msg || 'Une erreur est survenue');
      }
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-foreground via-primary to-foreground flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-background/80 text-sm">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-primary to-foreground" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-background/10 border border-background/20 rounded-2xl p-8 shadow-2xl">
          {showResetForm ? (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4 shadow-glow">
                  <svg className="w-8 h-8 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="font-serif text-3xl text-background font-light tracking-wider mb-2">
                  Mot de passe oublié
                </h1>
                <p className="text-background/60 text-sm">Entrez votre email pour recevoir un lien de réinitialisation</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm text-background/80 mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-background/10 border border-background/30 rounded-xl text-background placeholder:text-background/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-300"
                    placeholder="admin@exemple.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isResetting ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowResetForm(false)}
                  className="text-accent/80 hover:text-accent text-sm transition-colors duration-200"
                >
                  ← Retour à la connexion
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4 shadow-glow">
                  <svg className="w-8 h-8 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="font-serif text-3xl text-background font-light tracking-wider mb-2">
                  Administration
                </h1>
                <p className="text-background/60 text-sm">Connectez-vous pour accéder au back-office</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-background/80 mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-background/10 border border-background/30 rounded-xl text-background placeholder:text-background/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-300"
                    placeholder="admin@exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-background/80 mb-2 font-medium">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-background/10 border border-background/30 rounded-xl text-background placeholder:text-background/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowResetForm(true)}
                    className="text-accent/70 hover:text-accent text-sm transition-colors duration-200"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isLoading ? 'Chargement...' : 'Se connecter'}
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-background/40 text-xs">
                  Accès réservé aux administrateurs
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
