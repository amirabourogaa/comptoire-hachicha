import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavbarStyle, NavbarStyle } from '@/hooks/useSiteSettings';
import { useUpdateSiteSetting } from '@/hooks/useSiteSettings';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Navigation, Check, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarPreset {
  id: NavbarStyle;
  name: string;
  description: string;
}

const navbarPresets: NavbarPreset[] = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Fond plein avec dégradé subtil au scroll. Style intemporel et élégant.',
  },
  {
    id: 'minimal',
    name: 'Minimaliste',
    description: 'Transparent par défaut, fond léger au scroll. Épuré et aéré.',
  },
  {
    id: 'centered',
    name: 'Logo Centré',
    description: 'Logo au centre avec navigation en dessous. Style éditorial.',
  },
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Fond uni avec bordure inférieure en couleur primaire.',
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Effet verre dépoli avec transparence et flou prononcé.',
  },
  {
    id: 'elevated',
    name: 'Élevé',
    description: 'Ombre portée forte avec coins arrondis. Effet carte flottante.',
  },
  {
    id: 'bordered',
    name: 'Bordure',
    description: 'Bordure épaisse tout autour avec fond plein. Style encadré.',
  },
  {
    id: 'pill',
    name: 'Pilule',
    description: 'Barre arrondie avec marges latérales. Effet capsule flottante.',
  },
  {
    id: 'floating',
    name: 'Flottant',
    description: 'Détaché du bord supérieur avec ombre douce et coins arrondis.',
  },
  {
    id: 'underline',
    name: 'Souligné',
    description: 'Fond transparent avec une ligne de séparation en bas uniquement.',
  },
  {
    id: 'mega',
    name: 'Mega',
    description: 'Double barre : barre supérieure fine + barre principale avec menu catégories et recherche.',
  },
  {
    id: 'scrollable',
    name: 'Défilant',
    description: 'Barre de catégories défilable avec flèches de pagination. Idéal pour beaucoup de catégories aux noms longs.',
  },
];

// Mini preview components for each style
function NavbarMiniPreview({ style }: { style: NavbarStyle }) {
  const baseClasses = "w-full h-12 flex items-center px-3 text-[8px] font-medium relative overflow-hidden";
  const logo = <div className="font-bold text-[9px] opacity-90">LOGO</div>;
  const links = (
    <div className="flex-1 flex items-center justify-center gap-2">
      <span className="opacity-70">Produits</span>
      <span className="opacity-70">Cat. 1</span>
      <span className="opacity-70">Cat. 2</span>
    </div>
  );
  const dot = <div className="w-4 h-4 rounded-full border border-current opacity-30" />;

  switch (style) {
    case 'classic':
      return (
        <div className={cn(baseClasses, "rounded-lg bg-navbar-bg text-navbar-text")}>
          {logo}{links}{dot}
        </div>
      );
    case 'minimal':
      return (
        <div className={cn(baseClasses, "rounded-lg bg-transparent border border-border/40 text-foreground")}>
          {logo}{links}{dot}
        </div>
      );
    case 'centered':
      return (
        <div className={cn(baseClasses, "rounded-lg bg-navbar-bg text-navbar-text flex-col !h-16 py-1.5 justify-center")}>
          <div className="font-bold text-[10px] tracking-widest opacity-90">LOGO</div>
          <div className="flex items-center gap-3 mt-0.5 opacity-70">
            <span>Produits</span><span className="opacity-50">·</span><span>Cat. 1</span><span className="opacity-50">·</span><span>Cat. 2</span>
          </div>
        </div>
      );
    case 'modern':
      return (
        <div className={cn(baseClasses, "rounded-lg bg-navbar-bg text-navbar-text border-b-2 border-primary")}>
          {logo}{links}{dot}
        </div>
      );
    case 'glassmorphism':
      return (
        <div className={cn(baseClasses, "rounded-lg bg-navbar-bg/30 backdrop-blur-sm text-navbar-text border border-navbar-text/10")}>
          {logo}{links}{dot}
        </div>
      );
    case 'elevated':
      return (
        <div className={cn(baseClasses, "rounded-2xl bg-navbar-bg text-navbar-text shadow-lg shadow-foreground/10")}>
          {logo}{links}{dot}
        </div>
      );
    case 'bordered':
      return (
        <div className={cn(baseClasses, "rounded-lg bg-navbar-bg text-navbar-text border-2 border-primary/50 ring-1 ring-primary/20")}>
          {logo}{links}{dot}
        </div>
      );
    case 'pill':
      return (
        <div className="px-3 py-1">
          <div className={cn(baseClasses, "rounded-full bg-navbar-bg text-navbar-text shadow-md shadow-foreground/5 px-5")}>
            {logo}{links}{dot}
          </div>
        </div>
      );
    case 'floating':
      return (
        <div className="pt-2 px-2">
          <div className={cn(baseClasses, "rounded-xl bg-navbar-bg text-navbar-text shadow-xl shadow-foreground/10 border border-navbar-text/5")}>
            {logo}{links}{dot}
          </div>
        </div>
      );
    case 'underline':
      return (
        <div className={cn(baseClasses, "rounded-lg bg-transparent text-foreground border-b-2 border-primary/60")}>
          {logo}{links}{dot}
        </div>
      );
    case 'mega':
      return (
        <div className="rounded-lg overflow-hidden">
          <div className="w-full h-5 bg-primary/90 flex items-center justify-between px-3 text-[6px] text-primary-foreground/80">
            <span>info@site.com</span>
            <span>Bienvenue</span>
          </div>
          <div className={cn("w-full h-10 flex items-center px-3 text-[8px] font-medium bg-navbar-bg text-navbar-text gap-2")}>
            {logo}
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-navbar-text/10 text-[7px]">
              <Menu size={7} />
              <span>FAMILLE DE PRODUITS</span>
            </div>
            <div className="flex-1 mx-1 h-5 rounded border border-navbar-text/20 bg-navbar-text/5" />
            {dot}
          </div>
        </div>
      );
    case 'scrollable':
      return (
        <div className="rounded-lg overflow-hidden">
          <div className={cn("w-full h-8 flex items-center justify-between px-3 bg-navbar-bg text-navbar-text text-[8px] font-medium")}>
            {logo}
            {dot}
          </div>
          <div className="w-full h-6 bg-navbar-text/5 border-t border-navbar-text/10 flex items-center px-2 gap-0.5 text-[6px] text-navbar-text/70">
            <div className="w-2 h-2 flex items-center justify-center opacity-40">‹</div>
            <div className="flex-1 flex items-center gap-1 overflow-hidden">
              <span className="shrink-0 px-1.5 py-0.5 rounded bg-navbar-text/10 text-[6px]">Produits</span>
              <span className="shrink-0 px-1.5 py-0.5 rounded text-[6px]">Catégorie longue</span>
              <span className="shrink-0 px-1.5 py-0.5 rounded text-[6px]">Cat. 3</span>
              <span className="shrink-0 px-1.5 py-0.5 rounded text-[6px] opacity-50">...</span>
            </div>
            <div className="w-2 h-2 flex items-center justify-center opacity-40">›</div>
          </div>
        </div>
      );
  }
}

export function NavbarStylePicker() {
  const { navbarStyle, isLoading } = useNavbarStyle();
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();
  const [selected, setSelected] = useState<NavbarStyle>('classic');

  useEffect(() => {
    if (navbarStyle) setSelected(navbarStyle);
  }, [navbarStyle]);

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({ key: 'navbar_style', value: selected });
      toast({ title: 'Succès', description: 'Le style de navigation a été mis à jour.' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Impossible de sauvegarder.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Style de la barre de navigation
        </CardTitle>
        <CardDescription>
          Choisissez le design de la navbar qui s'affiche sur votre site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {navbarPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelected(preset.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md",
                selected === preset.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40"
              )}
            >
              {selected === preset.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <div className="mb-3">
                <NavbarMiniPreview style={preset.id} />
              </div>
              <h4 className="font-semibold text-sm">{preset.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{preset.description}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={updateSetting.isPending || selected === navbarStyle}>
            {updateSetting.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Appliquer le style
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
