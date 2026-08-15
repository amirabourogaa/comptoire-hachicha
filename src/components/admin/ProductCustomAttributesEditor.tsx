import { useState } from 'react';
import { Plus, X, Upload, Trash2 } from 'lucide-react';
import { useProductAttributes, useCreateProductAttribute, useDeleteProductAttribute, useCreateAttributeValue, useDeleteAttributeValue } from '@/hooks/useProductAttributes';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductCustomAttributesEditorProps {
  productId: string;
}

const SUGGESTED_ATTRIBUTES = ['Taille', 'Couleur', 'Matière', 'Dimension', 'Poids', 'Style', 'Longueur', 'Pointure'];

export function ProductCustomAttributesEditor({ productId }: ProductCustomAttributesEditorProps) {
  const { data: attributes, isLoading } = useProductAttributes(productId);
  const createAttribute = useCreateProductAttribute();
  const deleteAttribute = useDeleteProductAttribute();
  const createValue = useCreateAttributeValue();
  const deleteValue = useDeleteAttributeValue();
  const { uploadImages, uploading } = useImageUpload();

  const [newAttrName, setNewAttrName] = useState('');
  const [newValues, setNewValues] = useState<Record<string, { value: string; stock: string; colorCode: string; file: File | null; preview: string | null; priceAdjustment: string; price: string; reference: string }>>({});

  const handleAddAttribute = async () => {
    if (!newAttrName.trim()) return;
    try {
      await createAttribute.mutateAsync({
        product_id: productId,
        name: newAttrName.trim(),
        display_order: (attributes?.length || 0),
      });
      setNewAttrName('');
      toast.success(`Attribut "${newAttrName}" ajouté`);
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    if (!confirm('Supprimer cet attribut et toutes ses valeurs ?')) return;
    try {
      await deleteAttribute.mutateAsync({ id, productId });
      toast.success('Attribut supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getNewValue = (attrId: string) => {
    return newValues[attrId] || { value: '', stock: '0', colorCode: '#000000', file: null, preview: null, priceAdjustment: '0', price: '', reference: '' };
  };

  const setNewValue = (attrId: string, updates: Partial<typeof newValues[string]>) => {
    setNewValues(prev => ({
      ...prev,
      [attrId]: { ...getNewValue(attrId), ...updates },
    }));
  };

  const handleAddValue = async (attrId: string) => {
    const val = getNewValue(attrId);
    if (!val.value.trim()) return;

    try {
      let imageUrl: string | null = null;
      if (val.file) {
        const urls = await uploadImages([val.file]);
        imageUrl = urls[0] || null;
      }

      await createValue.mutateAsync({
        productId,
        attribute_id: attrId,
        value: val.value.trim(),
        stock: parseInt(val.stock) || 0,
        image_url: imageUrl,
        color_code: val.colorCode || null,
        price_adjustment: parseFloat(val.priceAdjustment) || 0,
        price: val.price ? parseFloat(val.price) : null,
        reference: val.reference || null,
      });

      setNewValues(prev => {
        const copy = { ...prev };
        delete copy[attrId];
        return copy;
      });
      toast.success('Valeur ajoutée');
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteValue = async (id: string) => {
    try {
      await deleteValue.mutateAsync({ id, productId });
      toast.success('Valeur supprimée');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleFileSelect = (attrId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewValue(attrId, { file, preview: URL.createObjectURL(file) });
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add new attribute */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold">Ajouter un attribut</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {SUGGESTED_ATTRIBUTES.filter(s => !attributes?.some(a => a.name === s)).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setNewAttrName(suggestion)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                newAttrName === suggestion
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-primary hover:bg-primary/5'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            placeholder="Nom de l'attribut (ex: Matière, Dimension...)"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAttribute())}
          />
          <Button
            type="button"
            onClick={handleAddAttribute}
            disabled={!newAttrName.trim() || createAttribute.isPending}
            size="sm"
          >
            <Plus size={16} className="mr-1" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Existing attributes */}
      {attributes && attributes.length > 0 ? (
        attributes.map((attr) => {
          const val = getNewValue(attr.id);
          return (
            <div key={attr.id} className="border border-border rounded-lg overflow-hidden">
              {/* Attribute header */}
              <div className="flex items-center justify-between bg-muted/50 px-4 py-3">
                <h4 className="text-sm font-semibold">{attr.name}</h4>
                <button
                  type="button"
                  onClick={() => handleDeleteAttribute(attr.id)}
                  className="text-destructive hover:text-destructive/80 p-1"
                  title="Supprimer l'attribut"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Existing values */}
                {attr.values && attr.values.length > 0 && (
                  <div className="space-y-2">
                    {attr.values.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg"
                      >
                        {v.color_code && (
                          <div
                            className="w-3 h-3 rounded-full border border-border"
                            style={{ backgroundColor: v.color_code }}
                          />
                        )}
                        {v.image_url && (
                          <img src={v.image_url} alt={v.value} className="w-5 h-5 rounded object-cover" />
                        )}
                        <span className="text-sm font-medium">{v.value}</span>
                        {(v as any).reference && (
                          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">REF: {(v as any).reference}</span>
                        )}
                        {(v as any).price != null && (
                          <span className="text-xs text-primary font-medium">{(v as any).price} TND</span>
                        )}
                        {v.price_adjustment !== 0 && (
                          <span className="text-xs text-orange-600">{v.price_adjustment > 0 ? '+' : ''}{v.price_adjustment} TND</span>
                        )}
                        <span className="text-xs text-muted-foreground">Stock: {v.stock}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteValue(v.id)}
                          className="text-destructive hover:text-destructive/80 ml-auto"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new value */}
                <div className="space-y-3">
                  <div className="flex gap-2 items-end flex-wrap">
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs text-muted-foreground mb-1">Valeur *</label>
                      <Input
                        value={val.value}
                        onChange={(e) => setNewValue(attr.id, { value: e.target.value })}
                        placeholder={`Ex: ${attr.name === 'Taille' ? 'XL, 42...' : attr.name === 'Couleur' ? 'Rouge, Bleu...' : 'Valeur...'}`}
                        className="text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs text-muted-foreground mb-1">Référence</label>
                      <Input
                        value={val.reference}
                        onChange={(e) => setNewValue(attr.id, { reference: e.target.value })}
                        placeholder="SKU-001"
                        className="text-sm"
                      />
                    </div>
                    <div className="w-20">
                      <label className="block text-xs text-muted-foreground mb-1">Stock *</label>
                      <Input
                        type="number"
                        min="0"
                        value={val.stock}
                        onChange={(e) => setNewValue(attr.id, { stock: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 items-end flex-wrap">
                    <div className="w-28">
                      <label className="block text-xs text-muted-foreground mb-1">Prix (TND)</label>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={val.price}
                        onChange={(e) => setNewValue(attr.id, { price: e.target.value })}
                        placeholder="Prix propre"
                        className="text-sm"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs text-muted-foreground mb-1">Ajust. prix</label>
                      <Input
                        type="number"
                        step="0.001"
                        value={val.priceAdjustment}
                        onChange={(e) => setNewValue(attr.id, { priceAdjustment: e.target.value })}
                        placeholder="+/- TND"
                        className="text-sm"
                      />
                    </div>
                    <div className="w-12">
                      <label className="block text-xs text-muted-foreground mb-1">🎨</label>
                      <input
                        type="color"
                        value={val.colorCode}
                        onChange={(e) => setNewValue(attr.id, { colorCode: e.target.value })}
                        className="w-full h-9 rounded border border-border cursor-pointer"
                        title="Couleur (optionnel)"
                      />
                    </div>
                    <div className="w-12">
                      <label className="block text-xs text-muted-foreground mb-1">📷</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(attr.id, e)}
                        className="hidden"
                        id={`attr-image-${attr.id}`}
                      />
                      <label
                        htmlFor={`attr-image-${attr.id}`}
                        className="flex items-center justify-center w-full h-9 border-2 border-dashed border-border rounded cursor-pointer hover:border-primary transition-colors overflow-hidden"
                      >
                        {val.preview ? (
                          <img src={val.preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Upload size={14} className="text-muted-foreground" />
                        )}
                      </label>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleAddValue(attr.id)}
                      disabled={!val.value.trim() || uploading}
                      size="sm"
                      variant="outline"
                    >
                      {uploading ? '...' : <Plus size={16} />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun attribut défini. Ajoutez des attributs comme "Taille", "Couleur", "Matière"...
        </p>
      )}
    </div>
  );
}
