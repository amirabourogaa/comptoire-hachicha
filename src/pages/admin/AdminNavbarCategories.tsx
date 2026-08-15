import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllCategories, useToggleCategoryNavbar } from '@/hooks/useCategories';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Navigation, FolderTree, Eye, EyeOff } from 'lucide-react';

const AdminNavbarCategories = () => {
  const { data: categories, isLoading } = useAllCategories();
  const toggleNavbar = useToggleCategoryNavbar();

  // Get parent categories only (root level)
  const parentCategories = categories?.filter(c => !c.parent_id && c.is_approved) || [];

  const handleToggle = async (id: string, currentValue: boolean) => {
    try {
      await toggleNavbar.mutateAsync({ id, show_in_navbar: !currentValue });
      toast.success(!currentValue ? 'Catégorie ajoutée à la navbar' : 'Catégorie retirée de la navbar');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Get children of a category
  const getChildren = (parentId: string) => {
    return categories?.filter(c => c.parent_id === parentId && c.is_approved) || [];
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Navigation className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-serif font-light">Catégories de la Navbar</h1>
        </div>
        <p className="text-muted-foreground">
          Choisissez les catégories à afficher dans le menu de navigation principal.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : parentCategories.length > 0 ? (
        <div className="bg-card rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    Catégorie
                  </th>
                  <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    Sous-catégories
                  </th>
                  <th className="text-center p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    Afficher dans Navbar
                  </th>
                </tr>
              </thead>
              <tbody>
                {parentCategories.map((category) => {
                  const children = getChildren(category.id);
                  const childrenInNavbar = children.filter(c => c.show_in_navbar).length;
                  
                  return (
                    <>
                      <tr key={category.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FolderTree className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-xs text-muted-foreground">/{category.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {children.length > 0 ? (
                            <span className="text-sm">
                              {children.length} sous-catégorie{children.length > 1 ? 's' : ''}
                              {childrenInNavbar > 0 && (
                                <span className="ml-2 text-xs text-primary">
                                  ({childrenInNavbar} visible{childrenInNavbar > 1 ? 's' : ''})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground/50">Aucune</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {category.show_in_navbar ? (
                              <Eye className="h-4 w-4 text-black" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Switch
                              checked={category.show_in_navbar}
                              onCheckedChange={() => handleToggle(category.id, category.show_in_navbar)}
                            />
                          </div>
                        </td>
                      </tr>
                      {/* Render children with indentation */}
                      {children.map((child) => (
                        <tr key={child.id} className="border-t border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
                          <td className="p-4 pl-16">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">└</span>
                              <div>
                                <p className="text-sm">{child.name}</p>
                                <p className="text-xs text-muted-foreground">/{child.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground text-sm">
                            —
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              {child.show_in_navbar ? (
                                <Eye className="h-4 w-4 text-primary" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Switch
                                checked={child.show_in_navbar}
                                onCheckedChange={() => handleToggle(child.id, child.show_in_navbar)}
                                disabled={!category.show_in_navbar}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl">
          <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Aucune catégorie approuvée</p>
          <p className="text-sm text-muted-foreground/70">
            Créez et approuvez des catégories pour les afficher dans la navbar.
          </p>
        </div>
      )}

      <div className="mt-8 p-4 bg-muted/30 rounded-xl">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          Note
        </h3>
        <p className="text-sm text-muted-foreground">
          Seules les catégories parentes activées apparaîtront dans le menu principal. 
          Les sous-catégories s'afficheront dans le menu déroulant de leur catégorie parente uniquement si celle-ci est visible.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminNavbarCategories;
