import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, X, ChevronRight, FolderTree, CheckCircle, Clock, Search, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Category } from '@/types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AdminCategories = () => {
  const { data: categories, isLoading } = useAllCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '' as string | null,
  });
  
  // États pour la recherche et la pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get parent categories (categories without parent)
  const parentCategories = categories?.filter(c => !c.parent_id) || [];

  // Filtrer les catégories par recherche
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    
    const filterCategory = (category: Category): boolean => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        category.name.toLowerCase().includes(searchLower) ||
        category.slug.toLowerCase().includes(searchLower);
      
      return matchesSearch;
    };

    const filterTree = (category: Category): boolean => {
      const children = categories.filter(c => c.parent_id === category.id);
      const hasMatchingChildren = children.some(filterTree);
      return filterCategory(category) || hasMatchingChildren;
    };

    // Filtrer les catégories racines et leurs enfants
    const rootCategories = categories.filter(c => !c.parent_id);
    return rootCategories.filter(filterTree);
  }, [categories, searchTerm]);

  // Fonction pour obtenir toutes les catégories filtrées en ordre hiérarchique
  const getFlattenedFilteredCategories = useMemo(() => {
    const result: Category[] = [];
    
    const addCategoryWithChildren = (category: Category, level: number) => {
      result.push({ ...category, level } as any);
      const children = categories?.filter(c => c.parent_id === category.id) || [];
      const filteredChildren = children.filter(child => {
        // Vérifier si l'enfant ou ses descendants correspondent à la recherche
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          child.name.toLowerCase().includes(searchLower) ||
          child.slug.toLowerCase().includes(searchLower);
        
        const hasMatchingDescendants = (cat: Category): boolean => {
          const descendants = categories?.filter(c => c.parent_id === cat.id) || [];
          return descendants.some(desc => 
            desc.name.toLowerCase().includes(searchLower) ||
            desc.slug.toLowerCase().includes(searchLower) ||
            hasMatchingDescendants(desc)
          );
        };
        
        return matchesSearch || hasMatchingDescendants(child);
      });
      
      filteredChildren.forEach(child => addCategoryWithChildren(child, level + 1));
    };
    
    const rootCategories = categories?.filter(c => !c.parent_id) || [];
    const filteredRoot = rootCategories.filter(root => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        root.name.toLowerCase().includes(searchLower) ||
        root.slug.toLowerCase().includes(searchLower);
      
      const hasMatchingDescendants = (cat: Category): boolean => {
        const descendants = categories?.filter(c => c.parent_id === cat.id) || [];
        return descendants.some(desc => 
          desc.name.toLowerCase().includes(searchLower) ||
          desc.slug.toLowerCase().includes(searchLower) ||
          hasMatchingDescendants(desc)
        );
      };
      
      return matchesSearch || hasMatchingDescendants(root);
    });
    
    filteredRoot.forEach(root => addCategoryWithChildren(root, 0));
    return result;
  }, [categories, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  // Reset pagination when search changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        parent_id: category.parent_id || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        parent_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      parent_id: formData.parent_id || null,
    };

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...categoryData });
        toast.success('Catégorie modifiée');
      } else {
        await createCategory.mutateAsync(categoryData);
        toast.success('Catégorie créée');
      }
      closeModal();
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  const handleDelete = async (id: string) => {
    // Check if category has children
    const hasChildren = categories?.some(c => c.parent_id === id);
    if (hasChildren) {
      toast.error('Supprimez d\'abord les sous-catégories');
      return;
    }

    if (confirm('Supprimer cette catégorie ?')) {
      try {
        await deleteCategory.mutateAsync(id);
        toast.success('Catégorie supprimée');
      } catch (error) {
        toast.error('Une erreur est survenue');
      }
    }
  };

  // Get parent name for display
  const getParentName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = categories?.find(c => c.id === parentId);
    return parent?.name || null;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-serif font-light">Catégories</h1>
        <button onClick={() => openModal()} className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={18} />
          Ajouter une catégorie
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Rechercher une catégorie par nom ou slug..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-muted-foreground mt-2">
            {filteredCategories.length} résultat(s) trouvé(s)
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Chargement des catégories...</p>
        </div>
      ) : categories && categories.length > 0 ? (
        <>
          {/* Table responsive avec scroll horizontal */}
          <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                      Nom
                    </th>
                    <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                      Slug
                    </th>
                    <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                      Catégorie parente
                    </th>
                    <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                      Statut
                    </th>
                    <th className="text-right p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((category: any) => {
                    const level = category.level || 0;
                    const children = categories?.filter(c => c.parent_id === category.id) || [];
                    
                    return (
                      <tr key={category.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2 min-w-[150px]" style={{ paddingLeft: `${level * 24}px` }}>
                            {level > 0 && (
                              <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                            )}
                            {level === 0 && children.length > 0 && (
                              <FolderTree size={14} className="text-muted-foreground flex-shrink-0" />
                            )}
                            <span className={`${level === 0 ? 'font-medium' : ''} break-words`}>
                              {category.name}
                            </span>
                            {level > 0 && (
                              <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground whitespace-nowrap">
                                Sous-catégorie
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">
                          {category.slug}
                        </td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">
                          {level > 0 ? getParentName(category.parent_id) : '-'}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {category.is_approved ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                              <CheckCircle size={12} />
                              Approuvée
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full whitespace-nowrap">
                              <Clock size={12} />
                              En attente
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openModal(category)}
                              className="p-2 hover:bg-muted rounded transition-colors"
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 hover:bg-muted rounded transition-colors text-destructive"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredCategories.length)} sur {filteredCategories.length} catégories
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span>...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-9"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                    <ChevronRightIcon size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Aucune catégorie ne correspond à votre recherche' : 'Aucune catégorie'}
          </p>
          {!searchTerm && (
            <button onClick={() => openModal()} className="btn-outline">
              Ajouter votre première catégorie
            </button>
          )}
          {searchTerm && (
            <button onClick={() => handleSearch('')} className="btn-outline">
              Effacer la recherche
            </button>
          )}
        </div>
      )}

      {/* Modal - Version responsive améliorée */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background flex justify-between items-center p-6 border-b border-border">
              <h2 className="font-serif text-xl font-light">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-muted rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Catégorie parente (optionnel)
                </label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                  className="input-elegant w-full"
                  disabled={editingCategory && categories?.some(c => c.parent_id === editingCategory.id)}
                >
                  <option value="">— Catégorie principale —</option>
                  {parentCategories
                    .filter(c => c.id !== editingCategory?.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                {editingCategory && categories?.some(c => c.parent_id === editingCategory.id) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Cette catégorie a des sous-catégories, elle ne peut pas devenir une sous-catégorie.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="input-elegant w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="input-elegant w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-outline flex-1 order-2 sm:order-1">
                  Annuler
                </button>
                <button type="submit" className="btn-primary flex-1 order-1 sm:order-2">
                  {editingCategory ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;