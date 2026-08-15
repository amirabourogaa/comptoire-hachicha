import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSectionVisibility, useToggleSectionVisibility, HOMEPAGE_SECTIONS } from '@/hooks/useSectionVisibility';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, LayoutDashboard, Sparkles, Package, BarChart3, Grid, MessageSquare, Info, Users, ShoppingBag } from 'lucide-react';

const sectionIcons: Record<string, React.ElementType> = {
  hero: LayoutDashboard,
  features: Sparkles,
  flash_sale: Package,
  stats: BarChart3,
  categories: Grid,
  testimonials: MessageSquare,
  about: Info,
  partners: Users,
  products: ShoppingBag,
};

export default function AdminSectionsVisibility() {
  const { data: sections, isLoading } = useSectionVisibility();
  const toggleMutation = useToggleSectionVisibility();
  const { toast } = useToast();

  const handleToggle = async (key: string, enabled: boolean, name: string) => {
    try {
      await toggleMutation.mutateAsync({ key, enabled });
      toast({
        title: enabled ? 'Section activée' : 'Section désactivée',
        description: `La section "${name}" a été ${enabled ? 'activée' : 'désactivée'}.`,
      });
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la visibilité de la section.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visibilité des sections</h1>
          <p className="text-muted-foreground mt-1">
            Activez ou désactivez les sections de la page d'accueil
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Sections de la page d'accueil</CardTitle>
            <CardDescription>
              Choisissez quelles sections afficher sur votre page d'accueil. 
              Les sections désactivées seront complètement masquées pour les visiteurs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sections?.map((section) => {
                const Icon = sectionIcons[section.id] || LayoutDashboard;
                return (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${section.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <Label 
                          htmlFor={section.id} 
                          className="text-base font-medium text-foreground cursor-pointer"
                        >
                          {section.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {section.enabled ? (
                        <Eye className="w-4 h-4 text-primary" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Switch
                        id={section.id}
                        checked={section.enabled}
                        onCheckedChange={(checked) => handleToggle(section.key, checked, section.name)}
                        disabled={toggleMutation.isPending}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Astuce</p>
                <p className="text-sm text-muted-foreground">
                  Les sections désactivées ne seront pas affichées aux visiteurs mais leurs données 
                  restent sauvegardées. Vous pouvez les réactiver à tout moment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
