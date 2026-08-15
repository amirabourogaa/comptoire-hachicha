import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useModules, useUpdateModules, ModulesConfig, moduleLabels } from '@/hooks/useModules';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, LayoutGrid, ShoppingBag, CreditCard, MapPin, Calendar, FileDown, Image, Star, Zap, Users, Layers, Eye } from 'lucide-react';

const moduleIcons: Record<keyof ModulesConfig, React.ReactNode> = {
  homepage_slider: <Image className="h-5 w-5" />,
  promotional_banners: <Layers className="h-5 w-5" />,
  featured_products: <Star className="h-5 w-5" />,
  flash_sales: <Zap className="h-5 w-5" />,
  category_slider: <LayoutGrid className="h-5 w-5" />,
  category_highlights: <Eye className="h-5 w-5" />,
  similar_products: <ShoppingBag className="h-5 w-5" />,
  partner_slider: <Users className="h-5 w-5" />,
  catalog_download: <FileDown className="h-5 w-5" />,
  agencies: <MapPin className="h-5 w-5" />,
  appointments: <Calendar className="h-5 w-5" />,
  online_payment: <CreditCard className="h-5 w-5" />,
};

const moduleCategories = [
  {
    title: 'Page d\'accueil',
    modules: ['homepage_slider', 'promotional_banners', 'featured_products', 'partner_slider'] as (keyof ModulesConfig)[],
  },
  {
    title: 'Catalogue & Produits',
    modules: ['category_slider', 'category_highlights', 'similar_products', 'flash_sales'] as (keyof ModulesConfig)[],
  },
  {
    title: 'Pages & Services',
    modules: ['catalog_download', 'agencies', 'appointments'] as (keyof ModulesConfig)[],
  },
  {
    title: 'Paiement',
    modules: ['online_payment'] as (keyof ModulesConfig)[],
  },
];

export default function AdminModules() {
  const { data: modules, isLoading } = useModules();
  const updateModules = useUpdateModules();
  const { toast } = useToast();
  const [config, setConfig] = useState<ModulesConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (modules) setConfig(modules);
  }, [modules]);

  const toggleModule = (key: keyof ModulesConfig) => {
    if (!config) return;
    setConfig(prev => prev ? { ...prev, [key]: !prev[key] } : prev);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!config) return;
    try {
      await updateModules.mutateAsync(config);
      setHasChanges(false);
      toast({ title: 'Succès', description: 'La configuration des modules a été enregistrée.' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading || !config) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <LayoutGrid className="h-6 w-6" />
              Gestion des Modules
            </h1>
            <p className="text-muted-foreground mt-1">
              Activez ou désactivez les fonctionnalités de votre site
            </p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || updateModules.isPending}>
            {updateModules.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>

        {moduleCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {category.modules.map((key) => {
                const info = moduleLabels[key];
                return (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${config[key] ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {moduleIcons[key]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{info.label}</p>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                    <Switch checked={config[key]} onCheckedChange={() => toggleModule(key)} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
