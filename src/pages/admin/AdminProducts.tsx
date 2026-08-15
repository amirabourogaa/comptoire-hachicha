import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, X, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useAllCategories } from '@/hooks/useCategories';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Product, CURRENCY } from '@/types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

const PAGE_SIZE = 10;

const ProductsSimple = () => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useAllProducts(currentPage, PAGE_SIZE, search || undefined);
  const products = data?.products ?? [];
  const totalProducts = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  const { data: categories } = useAllCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { uploadImages, uploading } = useImageUpload();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    details_content: '',
    price: '',
    promo_price: '',
    unit: '',
    is_flash_sale: false,
    images: [] as string[],
    category_id: '',
    is_active: true,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        description: product.description || '',
        details_content: (product as any).details_content || '',
        price: product.price.toString(),
        promo_price: product.promo_price?.toString() || '',
        unit: (product as any).unit || '',
        is_flash_sale: product.is_flash_sale,
        images: product.images || [],
        category_id: product.category_id || '',
        is_active: product.is_active,
      });
      setPreviewUrls(product.images || []);
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        details_content: '',
        price: '',
        promo_price: '',
        unit: '',
        is_flash_sale: false,
        images: [],
        category_id: '',
        is_active: true,
      });
      setPreviewUrls([]);
    }
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    const existingImagesCount = formData.images.length;
    if (index < existingImagesCount) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      const fileIndex = index - existingImagesCount;
      setSelectedFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uploadedUrls: string[] = [];
    if (selectedFiles.length > 0) {
      uploadedUrls = await uploadImages(selectedFiles);
      if (uploadedUrls.length !== selectedFiles.length) {
        toast.error("Certaines images n'ont pas pu être téléchargées");
      }
    }

    const allImages = [...formData.images, ...uploadedUrls];

    const productData: any = {
      title: formData.title,
      description: formData.description || null,
      details_content: formData.details_content || null,
      price: parseFloat(formData.price),
      promo_price: formData.promo_price ? parseFloat(formData.promo_price) : null,
      unit: formData.unit || null,
      is_flash_sale: formData.is_flash_sale,
      image_url: allImages[0] || null,
      images: allImages,
      category_id: formData.category_id || null,
      vendor_id: null,
      is_active: formData.is_active,
      is_approved: true,
      product_type: 'simple',
    };

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
        toast.success('Produit modifié');
      } else {
        await createProduct.mutateAsync(productData);
        toast.success('Produit créé');
      }
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Une erreur est survenue');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce produit ?')) {
      try {
        await deleteProduct.mutateAsync(id);
        toast.success('Produit supprimé');
      } catch (error) {
        toast.error('Une erreur est survenue');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Produits (Simple)</h1>
            <p className="text-sm text-muted-foreground">Gestion simplifiée des produits</p>
          </div>
          <Button onClick={() => openModal()} className="flex items-center gap-2">
            <Plus size={18} /> Ajouter un produit
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground mb-4">Aucun produit</p>
            <Button onClick={() => openModal()} variant="outline">Ajouter votre premier produit</Button>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-x-auto bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Produit</th>
                    <th className="text-left p-3">Catégorie</th>
                    <th className="text-left p-3">Prix</th>
                    <th className="text-left p-3">Promo</th>
                    <th className="text-left p-3">Statut</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded" />
                          )}
                          <span className="font-medium">{product.title}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{product.category?.name || '-'}</td>
                      <td className="p-3">{CURRENCY.format(product.price)}</td>
                      <td className="p-3">
                        {product.promo_price ? (
                          <span className="text-destructive font-medium">{CURRENCY.format(product.promo_price)}</span>
                        ) : '-'}
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                          {product.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openModal(product)} className="p-2 hover:bg-muted rounded" title="Modifier">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-muted rounded text-destructive" title="Supprimer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} / {totalPages} ({totalProducts} produits)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} /> Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card">
                <h2 className="text-lg font-semibold">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <button onClick={closeModal} className="p-1 hover:bg-muted rounded">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titre *</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description courte</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-input rounded-md p-2 bg-background text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Détails (riche)</label>
                  <RichTextEditor
                    value={formData.details_content}
                    onChange={(html) => setFormData({ ...formData, details_content: html })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prix *</label>
                    <Input
                      type="number"
                      step="0.001"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prix promo</label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.promo_price}
                      onChange={(e) => setFormData({ ...formData, promo_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Unité</label>
                    <Input
                      placeholder="Pièce, Kg, Litre..."
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Catégorie</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full h-10 border border-input rounded-md px-3 bg-background text-sm"
                    >
                      <option value="">— Aucune —</option>
                      {categories?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    Actif
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.is_flash_sale}
                      onChange={(e) => setFormData({ ...formData, is_flash_sale: e.target.checked })}
                    />
                    Vente flash
                  </label>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">Images</label>
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                    <Upload size={18} />
                    <span className="text-sm">Ajouter des images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {previewUrls.map((url, i) => (
                        <div key={i} className="relative aspect-square">
                          <img src={url} alt="" className="w-full h-full object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={closeModal}>Annuler</Button>
                  <Button type="submit" disabled={uploading || createProduct.isPending || updateProduct.isPending}>
                    {uploading ? 'Téléchargement...' : editingProduct ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductsSimple;