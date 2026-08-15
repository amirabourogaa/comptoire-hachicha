import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCustomPages, useCreateCustomPage, useUpdateCustomPage, useDeleteCustomPage } from '@/hooks/useCustomPages';
import { PageBlock, BlockType, CoverStyleOptions } from '@/types/pageBuilder';
import { BlockEditor } from '@/components/admin/page-builder/BlockEditor';
import { BlockRenderer } from '@/components/admin/page-builder/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Plus, Type, ImageIcon, MousePointer, Columns, Save, Eye, Pencil, Trash2, FileText, ArrowLeft, Minus, SeparatorHorizontal, Play, Layout, Mail, Star, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const genId = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);

function SortableBlock({ block, onChange, onDelete }: { block: PageBlock; onChange: (b: PageBlock) => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BlockEditor block={block} onChange={onChange} onDelete={onDelete} dragHandleProps={listeners} />
    </div>
  );
}

function SortablePage({ page, onEdit, onDelete }: { page: any; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <button {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
            <GripVertical className="w-4 h-4" />
          </button>
          <div>
            <h3 className="font-medium">{page.title}</h3>
            <p className="text-sm text-muted-foreground">
              /{page.slug} • {page.blocks.length} blocs
              {page.show_in_navbar && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Navbar</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${page.is_published ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
            {page.is_published ? 'Publié' : 'Brouillon'}
          </span>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="text-destructive" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPageBuilder() {
  const { data: pages, isLoading } = useCustomPages();
  const createPage = useCreateCustomPage();
  const updatePage = useUpdateCustomPage();
  const deletePage = useDeleteCustomPage();

  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [showInNavbar, setShowInNavbar] = useState(true);
  const [navbarLabel, setNavbarLabel] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverStyle, setCoverStyle] = useState<CoverStyleOptions>({
    height: 'md',
    overlayOpacity: 45,
    titleSize: '3xl',
    titleAlign: 'center',
    subtitleEnabled: false,
    subtitle: '',
  });
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [uploadingCover, setUploadingCover] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const currentPage = pages?.find((p) => p.id === editingPage);

  useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title);
      setSlug(currentPage.slug);
      setIsPublished(currentPage.is_published);
      setShowInNavbar(currentPage.show_in_navbar);
      setNavbarLabel(currentPage.navbar_label || '');
      setCoverImageUrl(currentPage.cover_image_url || '');
      setCoverStyle(currentPage.cover_style || { height: 'md', overlayOpacity: 45, titleSize: '3xl', titleAlign: 'center' });
      setBlocks(currentPage.blocks);
    }
  }, [currentPage]);

  const openNewPage = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setIsPublished(false);
    setShowInNavbar(true);
    setNavbarLabel('');
    setCoverImageUrl('');
    setCoverStyle({ height: 'md', overlayOpacity: 45, titleSize: '3xl', titleAlign: 'center' });
    setBlocks([]);
    setView('editor');
  };

  const openEditPage = (id: string) => {
    setEditingPage(id);
    setView('editor');
  };

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const addBlock = (type: BlockType) => {
    const defaults: Record<BlockType, any> = {
      text: { content: '<p>Votre texte ici...</p>' },
      image: { url: '', alt: '', width: 'full' },
      button: { label: 'Bouton', link: '/', variant: 'primary', align: 'center' },
      columns: { columns: 2, children: [[], []] },
      spacer: { height: 40 },
      divider: { style: 'solid' },
      video: { url: '', caption: '' },
      hero: { title: 'Titre', subtitle: '', backgroundUrl: '', buttonLabel: '', buttonLink: '', align: 'center', overlay: true },
      contact_form: { title: 'Contactez-nous', subtitle: '', fields: ['name', 'email', 'phone', 'message'], customFields: [], buttonLabel: 'Envoyer', cardStyle: true, confirmationMessage: '' },
      key_points: { items: [], columns: 3, cardStyle: true },
    };
    const uid = genId();
    setBlocks((prev) => [...prev, { id: uid, type, data: defaults[type] }]);
  };

  const updateBlock = (idx: number, block: PageBlock) => {
    setBlocks((prev) => prev.map((b, i) => (i === idx ? block : b)));
  };

  const deleteBlock = (idx: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    setBlocks(arrayMove(blocks, oldIndex, newIndex));
  };

  // Page reorder in list view
  const handlePageDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !pages) return;
    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(pages, oldIndex, newIndex);
    // Persist new order
    try {
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].display_order !== i) {
          await supabase.from('custom_pages').update({ display_order: i } as any).eq('id', reordered[i].id);
        }
      }
      toast.success('Ordre des pages mis à jour');
      // Invalidate queries
      await updatePage.mutateAsync({ id: reordered[0].id, title: reordered[0].title });
    } catch {
      toast.error("Erreur lors de la réorganisation");
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `page-covers/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('site-assets').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(fileName);
      setCoverImageUrl(urlData.publicUrl);
      toast.success('Image de couverture téléchargée');
    } catch {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.error('Le titre et le slug sont requis');
      return;
    }
    try {
      if (editingPage) {
        await updatePage.mutateAsync({
          id: editingPage,
          title,
          slug,
          blocks,
          is_published: isPublished,
          show_in_navbar: showInNavbar,
          navbar_label: navbarLabel || undefined,
          cover_image_url: coverImageUrl || null,
          cover_style: coverStyle,
        });
        toast.success('Page mise à jour');
      } else {
        const created = await createPage.mutateAsync({
          title,
          slug,
          blocks,
          is_published: isPublished,
          show_in_navbar: showInNavbar,
          navbar_label: navbarLabel || undefined,
          cover_image_url: coverImageUrl || null,
          cover_style: coverStyle,
        });
        setEditingPage(created.id);
        toast.success('Page créée');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette page ?')) return;
    try {
      await deletePage.mutateAsync(id);
      toast.success('Page supprimée');
      if (editingPage === id) setView('list');
    } catch {
      toast.error('Erreur');
    }
  };

  if (view === 'list') {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Pages personnalisées</h1>
            <Button onClick={openNewPage}>
              <Plus className="w-4 h-4 mr-2" /> Nouvelle page
            </Button>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : !pages?.length ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">Aucune page créée</p>
                <Button onClick={openNewPage}>
                  <Plus className="w-4 h-4 mr-2" /> Créer votre première page
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePageDragEnd}>
              <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <div className="grid gap-4">
                  {pages.map((page) => (
                    <SortablePage
                      key={page.id}
                      page={page}
                      onEdit={() => openEditPage(page.id)}
                      onDelete={() => handleDelete(page.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView('list')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">{editingPage ? 'Modifier la page' : 'Nouvelle page'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="w-4 h-4 mr-2" /> Aperçu
            </Button>
            <Button onClick={handleSave} disabled={createPage.isPending || updatePage.isPending}>
              <Save className="w-4 h-4 mr-2" /> Sauvegarder
            </Button>
          </div>
        </div>

        {/* Page Settings */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Titre de la page</Label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingPage) setSlug(generateSlug(e.target.value));
                  }}
                  placeholder="Ma page"
                />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} placeholder="ma-page" />
                <p className="text-xs text-muted-foreground mt-1">URL : /page/{slug || '...'}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                <Label>Publier</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showInNavbar} onCheckedChange={setShowInNavbar} />
                <Label>Afficher dans la navbar</Label>
              </div>
            </div>
            {showInNavbar && (
              <div className="max-w-sm">
                <Label>Titre dans la navbar (optionnel)</Label>
                <Input
                  value={navbarLabel}
                  onChange={(e) => setNavbarLabel(e.target.value)}
                  placeholder={title || 'Utiliser le titre de la page'}
                />
              </div>
            )}

            {/* Cover Image Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-sm mb-3">Photo de couverture & Style du titre</h3>
              {coverImageUrl && (
                <div className="relative mb-3">
                  <img src={coverImageUrl} alt="Couverture" className="h-32 w-full object-cover rounded-lg" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setCoverImageUrl('')}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                disabled={uploadingCover}
                onChange={handleCoverUpload}
              />
              <p className="text-xs text-muted-foreground mt-1">Le titre de la page s'affichera en overlay sur cette image</p>

              {/* Cover Style Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div>
                  <Label className="text-xs">Hauteur</Label>
                  <Select value={coverStyle.height || 'md'} onValueChange={(v) => setCoverStyle(s => ({ ...s, height: v as any }))}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Petite</SelectItem>
                      <SelectItem value="md">Moyenne</SelectItem>
                      <SelectItem value="lg">Grande</SelectItem>
                      <SelectItem value="xl">Très grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Taille du titre</Label>
                  <Select value={coverStyle.titleSize || '3xl'} onValueChange={(v) => setCoverStyle(s => ({ ...s, titleSize: v as any }))}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xl">Petit</SelectItem>
                      <SelectItem value="2xl">Moyen</SelectItem>
                      <SelectItem value="3xl">Grand</SelectItem>
                      <SelectItem value="4xl">Très grand</SelectItem>
                      <SelectItem value="5xl">Extra grand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Alignement titre</Label>
                  <Select value={coverStyle.titleAlign || 'center'} onValueChange={(v) => setCoverStyle(s => ({ ...s, titleAlign: v as any }))}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Gauche</SelectItem>
                      <SelectItem value="center">Centre</SelectItem>
                      <SelectItem value="right">Droite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Opacité overlay ({coverStyle.overlayOpacity || 45}%)</Label>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[coverStyle.overlayOpacity || 45]}
                    onValueChange={([v]) => setCoverStyle(s => ({ ...s, overlayOpacity: v }))}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Switch
                  checked={coverStyle.subtitleEnabled || false}
                  onCheckedChange={(v) => setCoverStyle(s => ({ ...s, subtitleEnabled: v }))}
                />
                <Label className="text-xs">Afficher un sous-titre</Label>
              </div>
              {coverStyle.subtitleEnabled && (
                <Input
                  value={coverStyle.subtitle || ''}
                  onChange={(e) => setCoverStyle(s => ({ ...s, subtitle: e.target.value }))}
                  placeholder="Sous-titre de la page..."
                  className="mt-2"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Block Toolbar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ajouter un bloc</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => addBlock('hero')}>
              <Layout className="w-4 h-4 mr-2" /> Section héro
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock('text')}>
              <Type className="w-4 h-4 mr-2" /> Texte
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock('image')}>
              <ImageIcon className="w-4 h-4 mr-2" /> Image
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock('button')}>
              <MousePointer className="w-4 h-4 mr-2" /> Bouton
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock('columns')}>
              <Columns className="w-4 h-4 mr-2" /> Colonnes
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock('video')}>
              <Play className="w-4 h-4 mr-2" /> Vidéo
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock('spacer')}>
              <Minus className="w-4 h-4 mr-2" /> Espacement
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock('divider')}>
              <SeparatorHorizontal className="w-4 h-4 mr-2" /> Séparateur
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock('contact_form')}>
              <Mail className="w-4 h-4 mr-2" /> Formulaire
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock('key_points')}>
              <Star className="w-4 h-4 mr-2" /> Points clés
            </Button>
          </CardContent>
        </Card>

        {/* Blocks List */}
        {blocks.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground">
            <p className="mb-2">Aucun bloc ajouté</p>
            <p className="text-sm">Cliquez sur les boutons ci-dessus pour commencer à construire votre page</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {blocks.map((block, idx) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onChange={(b) => updateBlock(idx, b)}
                    onDelete={() => deleteBlock(idx)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu : {title || 'Sans titre'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-8 py-4">
            {blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} isPreview />
            ))}
            {blocks.length === 0 && <p className="text-muted-foreground text-center">Aucun contenu</p>}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
