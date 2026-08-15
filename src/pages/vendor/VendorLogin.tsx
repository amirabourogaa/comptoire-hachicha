import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Store, Loader2 } from 'lucide-react';
import { useLogoUrl } from '@/hooks/useSiteSettings';

export default function VendorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, isVendor, isLoading, user } = useVendorAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logoUrl } = useLogoUrl();

  useEffect(() => {
    if (!isLoading && user && isVendor) {
      navigate('/vendor/dashboard');
    }
  }, [isLoading, user, isVendor, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-espresso via-earth to-espresso flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-espresso via-earth to-espresso" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      
      <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-bone/10 border-bone/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-12 object-contain brightness-0 invert" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-gold">
                <Store className="h-8 w-8 text-espresso" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl text-bone font-serif">Espace Vendeur</CardTitle>
          <CardDescription className="text-bone/60">
            Connectez-vous pour gérer vos produits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-bone/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vendeur@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="bg-bone/10 border-bone/30 text-bone placeholder:text-bone/40 focus:border-gold focus:ring-gold/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-bone/80">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="bg-bone/10 border-bone/30 text-bone placeholder:text-bone/40 focus:border-gold focus:ring-gold/30"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-gold to-gold-dark text-espresso hover:shadow-gold hover:scale-[1.02] transition-all duration-300 font-semibold" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-bone/40 text-xs">
              Compte fourni par l'administrateur
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
