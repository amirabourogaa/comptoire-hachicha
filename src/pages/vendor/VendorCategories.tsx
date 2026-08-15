import { useState } from 'react';
import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  useVendorCategories,
  useCreateVendorCategory,
  useUpdateVendorCategory,
  useDeleteVendorCategory,
  VendorCategory,
} from '@/hooks/useVendorCategories';
import { useCategories } from '@/hooks/useCategories';
import { Plus, Pencil, Trash2, FolderTree, CheckCircle, Clock, Loader2 } from 'lucide-react';

export default function VendorCategories() {
  const { data: vendorCategories = [], isLoading } = useVendorCategories();
  const { data: allCategories = [] } = useCategories();
  const createCategory = useCreateVendorCategory();
  const updateCategory = useUpdateVendorCategory();
  const deleteCategory = useDeleteVendorCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VendorCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
  });

  // Only show approved categories as potential parents
  const approvedCategories = allCategories.filter(c => 
    // Only show approved categories that are not the one being edited
    !editingCategory || c.id !== editingCategory.id
  );

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const openModal = (category?: VendorCategory) => {
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

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      parent_id: formData.parent_id || null,
    };

    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, ...categoryData });
    } else {
      await createCategory.mutateAsync(categoryData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      await deleteCategory.mutateAsync(id);
    }
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mes Catégories</h1>
            <p className="text-muted-foreground mt-1">
              Proposez des catégories pour vos produits
            </p>
          </div>
          <Button onClick={() => openModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Proposer une catégorie
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des catégories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : vendorCategories.length === 0 ? (
              <div className="text-center py-8">
                <FolderTree className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Aucune catégorie proposée pour le moment
                </p>
                <Button onClick={() => openModal()} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Proposer votre première catégorie
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Catégorie parente</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell>{category.parent?.name || '-'}</TableCell>
                      <TableCell>
                        {category.is_approved ? (
                          <Badge className="bg-success-muted text-success-foreground hover:bg-success-muted">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approuvée
                          </Badge>
                        ) : (
                          <Badge className="bg-warning-muted text-warning-foreground hover:bg-warning-muted">
                            <Clock className="h-3 w-3 mr-1" />
                            En attente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openModal(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {!category.is_approved && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Category Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Modifier la catégorie' : 'Proposer une catégorie'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la catégorie *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Électronique"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="electronique"
                />
                <p className="text-xs text-muted-foreground">
                  Généré automatiquement à partir du nom
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Catégorie parente (optionnel)</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune (catégorie principale)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune (catégorie principale)</SelectItem>
                    {approvedCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createCategory.isPending || updateCategory.isPending}
                >
                  {(createCategory.isPending || updateCategory.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingCategory ? 'Modifier' : 'Proposer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </VendorLayout>
  );
}
