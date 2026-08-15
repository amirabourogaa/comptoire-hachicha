import { useState } from 'react';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Upload, X } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useHeroSlides,
  useCreateHeroSlide,
  useUpdateHeroSlide,
  useDeleteHeroSlide,
  HeroSlide,
} from '@/hooks/useHeroSlides';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminHeroSlides() {
  const { data: slides, isLoading } = useHeroSlides();
  const createSlide = useCreateHeroSlide();
  const updateSlide = useUpdateHeroSlide();
  const deleteSlide = useDeleteHeroSlide();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      image_url: '',
      title: '',
      subtitle: '',
      button_text: '',
      button_link: '',
      is_active: true,
    });
    setEditingSlide(null);
  };

  const handleOpenDialog = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        image_url: slide.image_url,
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        button_text: slide.button_text || '',
        button_link: slide.button_link || '',
        is_active: slide.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image téléchargée');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_url) {
      toast.error('Veuillez ajouter une image');
      return;
    }

    const slideData = {
      image_url: formData.image_url,
      title: formData.title || null,
      subtitle: formData.subtitle || null,
      button_text: formData.button_text || null,
      button_link: formData.button_link || null,
      is_active: formData.is_active,
      display_order: slides?.length || 0,
    };

    if (editingSlide) {
      await updateSlide.mutateAsync({ id: editingSlide.id, ...slideData });
    } else {
      await createSlide.mutateAsync(slideData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    await updateSlide.mutateAsync({ id: slide.id, is_active: !slide.is_active });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce slide ?')) {
      await deleteSlide.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <p>Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Slider Hero</h1>
            <p className="text-muted-foreground mt-1">Gérez les slides de la page d'accueil</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => handleOpenDialog()}
                disabled={(slides?.length || 0) >= 3}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un slide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingSlide ? 'Modifier le slide' : 'Nouveau slide'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Image *</Label>
                  {formData.image_url ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {uploading ? 'Téléchargement...' : 'Cliquez pour télécharger'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nouvelle Collection"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Sous-titre</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Découvrez notre sélection"
                  />
                </div>

                {/* Button Text */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="button_text">Texte du bouton</Label>
                    <Input
                      id="button_text"
                      value={formData.button_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                      placeholder="Découvrir"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="button_link">Lien du bouton</Label>
                    <Input
                      id="button_link"
                      value={formData.button_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, button_link: e.target.value }))}
                      placeholder="/category/nouveautes"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Actif</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingSlide ? 'Enregistrer' : 'Ajouter'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Slides List */}
        <div className="space-y-4">
          {slides?.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Aucun slide configuré</p>
                <p className="text-muted-foreground/70 text-sm mt-1">
                  Ajoutez jusqu'à 3 slides pour le carousel
                </p>
              </CardContent>
            </Card>
          ) : (
            slides?.map((slide, index) => (
              <Card key={slide.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="w-32 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={slide.image_url}
                        alt={slide.title || 'Slide'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-foreground font-medium truncate">
                        {slide.title || 'Sans titre'}
                      </h3>
                      <p className="text-muted-foreground text-sm truncate">
                        {slide.subtitle || 'Pas de sous-titre'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(slide)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {slide.is_active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(slide)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(slide.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {(slides?.length || 0) >= 3 && (
          <p className="text-gold text-sm mt-4">
            Maximum de 3 slides atteint
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
