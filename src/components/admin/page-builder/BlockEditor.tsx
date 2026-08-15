import { useState } from 'react';
import { PageBlock, TextBlockData, ImageBlockData, ButtonBlockData, ColumnsBlockData, SpacerBlockData, DividerBlockData, VideoBlockData, HeroBlockData, ContactFormBlockData, KeyPointsBlockData, CustomFormField } from '@/types/pageBuilder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash2, GripVertical, Type, ImageIcon, MousePointer, Columns, Minus, SeparatorHorizontal, Play, Layout, Mail, Plus, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlockEditorProps {
  block: PageBlock;
  onChange: (block: PageBlock) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

const genId = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);

export function BlockEditor({ block, onChange, onDelete, dragHandleProps }: BlockEditorProps) {
  const [uploading, setUploading] = useState(false);

  const updateData = (partial: Record<string, any>) => {
    onChange({ ...block, data: { ...block.data, ...partial } });
  };

  const blockIcon: Record<string, React.ReactNode> = {
    text: <Type className="w-4 h-4" />,
    image: <ImageIcon className="w-4 h-4" />,
    button: <MousePointer className="w-4 h-4" />,
    columns: <Columns className="w-4 h-4" />,
    spacer: <Minus className="w-4 h-4" />,
    divider: <SeparatorHorizontal className="w-4 h-4" />,
    video: <Play className="w-4 h-4" />,
    hero: <Layout className="w-4 h-4" />,
    contact_form: <Mail className="w-4 h-4" />,
    key_points: <Star className="w-4 h-4" />,
  };

  const blockLabel: Record<string, string> = {
    text: 'Texte',
    image: 'Image',
    button: 'Bouton',
    columns: 'Colonnes',
    spacer: 'Espacement',
    divider: 'Séparateur',
    video: 'Vidéo',
    hero: 'Section Héro',
    contact_form: 'Formulaire de contact',
    key_points: 'Points clés',
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field = 'url') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `page-builder/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(fileName);
      updateData({ [field]: urlData.publicUrl });
      toast.success('Image téléchargée');
    } catch {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-lg bg-card">
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 rounded-t-lg">
        <button {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          {blockIcon[block.type]} {blockLabel[block.type]}
        </span>
        <Button type="button" variant="ghost" size="icon" className="ml-auto h-7 w-7 text-destructive" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {block.type === 'text' && (
          <>
            <RichTextEditor
              value={(block.data as TextBlockData).content || ''}
              onChange={(val) => updateData({ content: val })}
              rows={4}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Alignement</Label>
                <Select value={(block.data as TextBlockData).align || 'left'} onValueChange={(v) => updateData({ align: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Gauche</SelectItem>
                    <SelectItem value="center">Centre</SelectItem>
                    <SelectItem value="right">Droite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Taille police</Label>
                <Select value={(block.data as TextBlockData).fontSize || 'base'} onValueChange={(v) => updateData({ fontSize: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Petit</SelectItem>
                    <SelectItem value="base">Normal</SelectItem>
                    <SelectItem value="lg">Grand</SelectItem>
                    <SelectItem value="xl">Très grand</SelectItem>
                    <SelectItem value="2xl">Extra grand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Épaisseur</Label>
                <Select value={(block.data as TextBlockData).fontWeight || 'normal'} onValueChange={(v) => updateData({ fontWeight: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="bold">Gras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Style</Label>
                <Select value={(block.data as TextBlockData).fontStyle || 'normal'} onValueChange={(v) => updateData({ fontStyle: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="italic">Italique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {block.type === 'image' && (
          <>
            <div>
              <Label className="text-xs">Image</Label>
              {(block.data as ImageBlockData).url && (
                <img src={(block.data as ImageBlockData).url} alt="" className="h-24 object-contain rounded mb-2" />
              )}
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} disabled={uploading} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Texte alternatif</Label>
              <Input value={(block.data as ImageBlockData).alt || ''} onChange={(e) => updateData({ alt: e.target.value })} className="h-8" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Taille</Label>
                <Select value={(block.data as ImageBlockData).width || 'full'} onValueChange={(v) => updateData({ width: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Pleine largeur</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="small">Petite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Coins arrondis</Label>
                <Select value={(block.data as ImageBlockData).borderRadius || 'md'} onValueChange={(v) => updateData({ borderRadius: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    <SelectItem value="sm">Petit</SelectItem>
                    <SelectItem value="md">Moyen</SelectItem>
                    <SelectItem value="lg">Grand</SelectItem>
                    <SelectItem value="xl">Très grand</SelectItem>
                    <SelectItem value="full">Cercle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ombre</Label>
                <Select value={(block.data as ImageBlockData).shadow || 'none'} onValueChange={(v) => updateData({ shadow: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="sm">Légère</SelectItem>
                    <SelectItem value="md">Moyenne</SelectItem>
                    <SelectItem value="lg">Forte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {block.type === 'button' && (
          <>
            <div>
              <Label className="text-xs">Libellé</Label>
              <Input value={(block.data as ButtonBlockData).label || ''} onChange={(e) => updateData({ label: e.target.value })} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Lien</Label>
              <Input value={(block.data as ButtonBlockData).link || ''} onChange={(e) => updateData({ link: e.target.value })} placeholder="/products" className="h-8" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Style</Label>
                <Select value={(block.data as ButtonBlockData).variant || 'primary'} onValueChange={(v) => updateData({ variant: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Plein</SelectItem>
                    <SelectItem value="outline">Contour</SelectItem>
                    <SelectItem value="ghost">Transparent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Alignement</Label>
                <Select value={(block.data as ButtonBlockData).align || 'left'} onValueChange={(v) => updateData({ align: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Gauche</SelectItem>
                    <SelectItem value="center">Centre</SelectItem>
                    <SelectItem value="right">Droite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Taille</Label>
                <Select value={(block.data as ButtonBlockData).size || 'md'} onValueChange={(v) => updateData({ size: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Petit</SelectItem>
                    <SelectItem value="md">Moyen</SelectItem>
                    <SelectItem value="lg">Grand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {block.type === 'columns' && (
          <ColumnsEditor block={block} onChange={onChange} />
        )}

        {block.type === 'spacer' && (
          <div>
            <Label className="text-xs">Hauteur (px)</Label>
            <Input
              type="number"
              min={8}
              max={200}
              value={(block.data as SpacerBlockData).height || 40}
              onChange={(e) => updateData({ height: Number(e.target.value) })}
              className="h-8 w-32"
            />
          </div>
        )}

        {block.type === 'divider' && (
          <div>
            <Label className="text-xs">Style du trait</Label>
            <Select value={(block.data as DividerBlockData).style || 'solid'} onValueChange={(v) => updateData({ style: v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Plein</SelectItem>
                <SelectItem value="dashed">Tirets</SelectItem>
                <SelectItem value="dotted">Pointillés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {block.type === 'video' && (
          <>
            <div>
              <Label className="text-xs">URL de la vidéo (YouTube ou lien direct)</Label>
              <Input
                value={(block.data as VideoBlockData).url || ''}
                onChange={(e) => updateData({ url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Légende (optionnel)</Label>
              <Input
                value={(block.data as VideoBlockData).caption || ''}
                onChange={(e) => updateData({ caption: e.target.value })}
                className="h-8"
              />
            </div>
          </>
        )}

        {block.type === 'hero' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Titre</Label>
                <Input value={(block.data as HeroBlockData).title || ''} onChange={(e) => updateData({ title: e.target.value })} className="h-8" />
              </div>
              <div>
                <Label className="text-xs">Sous-titre</Label>
                <Input value={(block.data as HeroBlockData).subtitle || ''} onChange={(e) => updateData({ subtitle: e.target.value })} className="h-8" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Image de fond</Label>
              {(block.data as HeroBlockData).backgroundUrl && (
                <img src={(block.data as HeroBlockData).backgroundUrl} alt="" className="h-20 object-cover rounded mb-2 w-full" />
              )}
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'backgroundUrl')} disabled={uploading} className="h-8" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Texte du bouton</Label>
                <Input value={(block.data as HeroBlockData).buttonLabel || ''} onChange={(e) => updateData({ buttonLabel: e.target.value })} className="h-8" placeholder="Découvrir" />
              </div>
              <div>
                <Label className="text-xs">Lien du bouton</Label>
                <Input value={(block.data as HeroBlockData).buttonLink || ''} onChange={(e) => updateData({ buttonLink: e.target.value })} className="h-8" placeholder="/products" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Alignement</Label>
                <Select value={(block.data as HeroBlockData).align || 'center'} onValueChange={(v) => updateData({ align: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Gauche</SelectItem>
                    <SelectItem value="center">Centre</SelectItem>
                    <SelectItem value="right">Droite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Switch checked={(block.data as HeroBlockData).overlay !== false} onCheckedChange={(v) => updateData({ overlay: v })} />
                <Label className="text-xs">Overlay sombre</Label>
              </div>
            </div>
          </>
        )}

        {block.type === 'contact_form' && (
          <ContactFormEditor block={block} onChange={onChange} />
        )}

        {block.type === 'key_points' && (
          <KeyPointsEditor block={block} onChange={onChange} uploading={uploading} setUploading={setUploading} />
        )}
      </div>
    </div>
  );
}

function ContactFormEditor({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const data = block.data as ContactFormBlockData;
  const customFields = data.customFields || [];

  const updateData = (partial: Record<string, any>) => {
    onChange({ ...block, data: { ...block.data, ...partial } });
  };

  const addCustomField = () => {
    const newField: CustomFormField = {
      id: genId(),
      label: 'Nouveau champ',
      type: 'text',
      required: false,
    };
    updateData({ customFields: [...customFields, newField] });
  };

  const updateCustomField = (idx: number, partial: Partial<CustomFormField>) => {
    const updated = customFields.map((f, i) => i === idx ? { ...f, ...partial } : f);
    updateData({ customFields: updated });
  };

  const removeCustomField = (idx: number) => {
    updateData({ customFields: customFields.filter((_, i) => i !== idx) });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Titre du formulaire</Label>
          <Input value={data.title || ''} onChange={(e) => updateData({ title: e.target.value })} className="h-8" />
        </div>
        <div>
          <Label className="text-xs">Sous-titre</Label>
          <Input value={data.subtitle || ''} onChange={(e) => updateData({ subtitle: e.target.value })} className="h-8" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Texte du bouton</Label>
          <Input value={data.buttonLabel || 'Envoyer'} onChange={(e) => updateData({ buttonLabel: e.target.value })} className="h-8" />
        </div>
        <div>
          <Label className="text-xs">Email destinataire</Label>
          <Input value={data.recipientEmail || ''} onChange={(e) => updateData({ recipientEmail: e.target.value })} className="h-8" placeholder="contact@example.com" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Message de confirmation (popup après envoi)</Label>
        <Textarea
          value={data.confirmationMessage || ''}
          onChange={(e) => updateData({ confirmationMessage: e.target.value })}
          placeholder="Merci ! Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais."
          rows={2}
          className="text-xs"
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={data.cardStyle !== false} onCheckedChange={(v) => updateData({ cardStyle: v })} />
        <Label className="text-xs">Style carte</Label>
      </div>

      {/* Custom fields */}
      <div className="border-t pt-3 mt-3">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium">Champs personnalisés</Label>
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addCustomField}>
            <Plus className="w-3 h-3 mr-1" /> Ajouter
          </Button>
        </div>
        {customFields.map((field, idx) => (
          <div key={field.id} className="flex items-start gap-2 mb-2 p-2 border rounded bg-muted/30">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input value={field.label} onChange={(e) => updateCustomField(idx, { label: e.target.value })} placeholder="Libellé" className="h-7 text-xs" />
              <Select value={field.type} onValueChange={(v) => updateCustomField(idx, { type: v as any })}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texte</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="tel">Téléphone</SelectItem>
                  <SelectItem value="number">Nombre</SelectItem>
                  <SelectItem value="textarea">Zone de texte</SelectItem>
                  <SelectItem value="select">Liste déroulante</SelectItem>
                  <SelectItem value="file">Pièce jointe</SelectItem>
                </SelectContent>
              </Select>
              <Input value={field.placeholder || ''} onChange={(e) => updateCustomField(idx, { placeholder: e.target.value })} placeholder="Placeholder..." className="h-7 text-xs" />
              <div className="flex items-center gap-1">
                <Switch checked={field.required || false} onCheckedChange={(v) => updateCustomField(idx, { required: v })} />
                <span className="text-xs">Requis</span>
              </div>
              {field.type === 'select' && (
                <div className="col-span-2">
                  <Input
                    value={(field.options || []).join(', ')}
                    onChange={(e) => updateCustomField(idx, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="Option 1, Option 2, ..."
                    className="h-7 text-xs"
                  />
                </div>
              )}
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeCustomField(idx)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

function KeyPointsEditor({ block, onChange, uploading, setUploading }: { block: PageBlock; onChange: (b: PageBlock) => void; uploading: boolean; setUploading: (v: boolean) => void }) {
  const data = block.data as KeyPointsBlockData;
  const items = data.items || [];

  const updateData = (partial: Record<string, any>) => {
    onChange({ ...block, data: { ...block.data, ...partial } });
  };

  const addItem = () => {
    updateData({ items: [...items, { id: genId(), iconUrl: '', title: '', description: '' }] });
  };

  const updateItem = (idx: number, partial: Record<string, any>) => {
    updateData({ items: items.map((item, i) => i === idx ? { ...item, ...partial } : item) });
  };

  const removeItem = (idx: number) => {
    updateData({ items: items.filter((_, i) => i !== idx) });
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `page-builder/icons/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('site-assets').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(fileName);
      updateItem(idx, { iconUrl: urlData.publicUrl });
      toast.success('Icône téléchargée');
    } catch {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Colonnes</Label>
          <Select value={String(data.columns || 3)} onValueChange={(v) => updateData({ columns: Number(v) })}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-4">
          <Switch checked={data.cardStyle !== false} onCheckedChange={(v) => updateData({ cardStyle: v })} />
          <Label className="text-xs">Style carte</Label>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-start gap-2 p-2 border rounded bg-muted/30">
            <div className="flex-shrink-0 w-10 h-10 rounded border bg-background flex items-center justify-center overflow-hidden">
              {item.iconUrl ? (
                <img src={item.iconUrl} alt="" className="w-8 h-8 object-contain" />
              ) : (
                <Star className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <Input value={item.title} onChange={(e) => updateItem(idx, { title: e.target.value })} placeholder="Titre" className="h-7 text-xs" />
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateItem(idx, { description: e.target.value })}
                placeholder="Description..."
                rows={2}
                className="text-xs min-h-0"
              />
              <Input type="file" accept="image/*" onChange={(e) => handleIconUpload(e, idx)} disabled={uploading} className="h-7 text-xs" />
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(idx)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="w-3 h-3 mr-1" /> Ajouter un élément
      </Button>
    </div>
  );
}

function ColumnsEditor({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const data = block.data as ColumnsBlockData;
  const cols = data.columns || 2;
  const children = data.children || Array.from({ length: cols }, () => []);

  const updateColumns = (newCols: number) => {
    const newChildren = Array.from({ length: newCols }, (_, i) => children[i] || []);
    onChange({ ...block, data: { ...data, columns: newCols, children: newChildren } });
  };

  const addChildBlock = (colIdx: number, type: 'text' | 'image' | 'button') => {
    const defaultData = type === 'text' ? { content: '' } : type === 'image' ? { url: '', alt: '' } : { label: 'Bouton', link: '' };
    const uid = genId();
    const newBlock: PageBlock = { id: uid, type, data: defaultData };
    const newChildren = children.map((col, i) => i === colIdx ? [...col, newBlock] : col);
    onChange({ ...block, data: { ...data, children: newChildren } });
  };

  const updateChildBlock = (colIdx: number, blockIdx: number, updated: PageBlock) => {
    const newChildren = children.map((col, i) =>
      i === colIdx ? col.map((b, j) => (j === blockIdx ? updated : b)) : col
    );
    onChange({ ...block, data: { ...data, children: newChildren } });
  };

  const deleteChildBlock = (colIdx: number, blockIdx: number) => {
    const newChildren = children.map((col, i) =>
      i === colIdx ? col.filter((_, j) => j !== blockIdx) : col
    );
    onChange({ ...block, data: { ...data, children: newChildren } });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Nombre de colonnes</Label>
        <Select value={String(cols)} onValueChange={(v) => updateColumns(Number(v))}>
          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 colonnes</SelectItem>
            <SelectItem value="3">3 colonnes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className={`grid gap-3 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {children.slice(0, cols).map((colBlocks, colIdx) => (
          <div key={colIdx} className="border border-dashed rounded-lg p-2 space-y-2 min-h-[80px]">
            <p className="text-xs text-muted-foreground font-medium">Col {colIdx + 1}</p>
            {colBlocks.map((child, blockIdx) => (
              <div key={child.id} className="border rounded p-2 bg-background text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{child.type}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteChildBlock(colIdx, blockIdx)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                {child.type === 'text' && (
                  <Input
                    value={(child.data as any).content || ''}
                    onChange={(e) => updateChildBlock(colIdx, blockIdx, { ...child, data: { ...child.data, content: e.target.value } })}
                    placeholder="Texte..."
                    className="h-6 text-xs"
                  />
                )}
                {child.type === 'button' && (
                  <Input
                    value={(child.data as any).label || ''}
                    onChange={(e) => updateChildBlock(colIdx, blockIdx, { ...child, data: { ...child.data, label: e.target.value } })}
                    placeholder="Libellé..."
                    className="h-6 text-xs"
                  />
                )}
              </div>
            ))}
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => addChildBlock(colIdx, 'text')}>+T</Button>
              <Button type="button" variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => addChildBlock(colIdx, 'image')}>+I</Button>
              <Button type="button" variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => addChildBlock(colIdx, 'button')}>+B</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
