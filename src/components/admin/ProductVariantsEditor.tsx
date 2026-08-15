import { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { useProductSizes, useCreateProductSize, useDeleteProductSize, useProductColors, useCreateProductColor, useDeleteProductColor } from '@/hooks/useProductVariants';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from 'sonner';

interface ProductVariantsEditorProps {
  productId: string;
}

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46'];

export function ProductVariantsEditor({ productId }: ProductVariantsEditorProps) {
  const { data: sizes, isLoading: sizesLoading } = useProductSizes(productId);
  const { data: colors, isLoading: colorsLoading } = useProductColors(productId);
  const createSize = useCreateProductSize();
  const deleteSize = useDeleteProductSize();
  const createColor = useCreateProductColor();
  const deleteColor = useDeleteProductColor();
  const { uploadImages, uploading } = useImageUpload();

  const [newSize, setNewSize] = useState('');
  const [newStock, setNewStock] = useState('0');
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#000000');
  const [colorFile, setColorFile] = useState<File | null>(null);
  const [colorPreview, setColorPreview] = useState<string | null>(null);

  const handleAddSize = async () => {
    if (!newSize.trim()) return;
    
    try {
      await createSize.mutateAsync({
        product_id: productId,
        size: newSize.trim().toUpperCase(),
        stock: parseInt(newStock) || 0,
      });
      setNewSize('');
      setNewStock('0');
      toast.success('Taille ajoutée');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleDeleteSize = async (id: string) => {
    try {
      await deleteSize.mutateAsync({ id, productId });
      toast.success('Taille supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleColorFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setColorFile(file);
      setColorPreview(URL.createObjectURL(file));
    }
  };

  const handleAddColor = async () => {
    if (!newColorName.trim() || !colorFile) {
      toast.error('Veuillez remplir le nom et ajouter une image');
      return;
    }

    try {
      const urls = await uploadImages([colorFile]);
      if (urls.length === 0) {
        toast.error('Erreur lors du téléchargement de l\'image');
        return;
      }

      await createColor.mutateAsync({
        product_id: productId,
        color_name: newColorName.trim(),
        color_code: newColorCode,
        image_url: urls[0],
      });

      setNewColorName('');
      setNewColorCode('#000000');
      setColorFile(null);
      setColorPreview(null);
      toast.success('Couleur ajoutée');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleDeleteColor = async (id: string) => {
    try {
      await deleteColor.mutateAsync({ id, productId });
      toast.success('Couleur supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (sizesLoading || colorsLoading) {
    return <div className="text-muted-foreground text-sm">Chargement...</div>;
  }

  return (
    <div className="space-y-6 border-t border-border pt-6 mt-6">
      {/* Sizes Section */}
      <div>
        <h3 className="text-sm font-medium mb-3">Tailles disponibles</h3>
        
        {/* Existing sizes */}
        {sizes && sizes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {sizes.map((size) => (
              <div
                key={size.id}
                className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full"
              >
                <span className="text-sm font-medium">{size.size}</span>
                <span className="text-xs text-muted-foreground">({size.stock})</span>
                <button
                  type="button"
                  onClick={() => handleDeleteSize(size.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new size */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">Taille</label>
            <div className="flex gap-1 flex-wrap mb-2">
              {COMMON_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewSize(s)}
                  className={`px-2 py-1 text-xs rounded border ${
                    newSize === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Ou saisir une taille"
              className="input-elegant text-sm"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs text-muted-foreground mb-1">Stock</label>
            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="input-elegant text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleAddSize}
            disabled={!newSize.trim()}
            className="btn-outline px-3 py-2"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Colors Section */}
      <div>
        <h3 className="text-sm font-medium mb-3">Couleurs disponibles</h3>
        
        {/* Existing colors */}
        {colors && colors.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {colors.map((color) => (
              <div key={color.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-border">
                  <img
                    src={color.image_url}
                    alt={color.color_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: color.color_code || '#000' }}
                  />
                  <span className="text-xs truncate">{color.color_name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteColor(color.id)}
                  className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new color */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">Nom de la couleur</label>
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="Ex: Rouge, Bleu marine..."
              className="input-elegant text-sm"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs text-muted-foreground mb-1">Code</label>
            <input
              type="color"
              value={newColorCode}
              onChange={(e) => setNewColorCode(e.target.value)}
              className="w-full h-10 rounded border border-border cursor-pointer"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs text-muted-foreground mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleColorFileSelect}
              className="hidden"
              id="color-image-upload"
            />
            <label
              htmlFor="color-image-upload"
              className="flex items-center justify-center w-full h-10 border-2 border-dashed border-border rounded cursor-pointer hover:border-primary transition-colors"
            >
              {colorPreview ? (
                <img src={colorPreview} alt="Preview" className="w-full h-full object-cover rounded" />
              ) : (
                <Upload size={16} className="text-muted-foreground" />
              )}
            </label>
          </div>
          <button
            type="button"
            onClick={handleAddColor}
            disabled={!newColorName.trim() || !colorFile || uploading}
            className="btn-outline px-3 py-2"
          >
            {uploading ? '...' : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
