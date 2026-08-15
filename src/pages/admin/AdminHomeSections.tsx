import { useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllCategories, useToggleCategoryCollections, useUpdateCategoryMedia } from '@/hooks/useCategories';
import { 
  useTestimonials, 
  useCreateTestimonial, 
  useUpdateTestimonial, 
  useDeleteTestimonial,
  useFeatures,
  useCreateFeature,
  useUpdateFeature,
  useDeleteFeature,
  useStats,
  useCreateStat,
  useUpdateStat,
  useDeleteStat,
  usePartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
  Testimonial,
  Feature,
  Stat,
  Partner
} from '@/hooks/useHomeSections';
import { usePartnerLogoUpload } from '@/hooks/usePartnerLogoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Star, MessageSquare, BarChart3, Building, Upload, X, Grid, Image, Truck, Shield, RefreshCw, Headphones, Package, Award, Heart, Users, TrendingUp, ShoppingBag, type LucideProps } from 'lucide-react';
import { sanitizeRichTextHtml } from '@/lib/sanitizeRichTextHtml';

// Map kebab-case icon names to Lucide components
const iconMap: Record<string, React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>> = {
  'truck': Truck,
  'shield': Shield,
  'refresh-cw': RefreshCw,
  'headphones': Headphones,
  'star': Star,
  'package': Package,
  'award': Award,
  'heart': Heart,
  'users': Users,
  'trending-up': TrendingUp,
  'shopping-bag': ShoppingBag,
  'bar-chart-3': BarChart3,
};

function LucideIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return <span className={className}>{name}</span>;
  return <IconComponent size={size} className={className} />;
}

// ============================================================================
// TESTIMONIALS TAB
// ============================================================================

function TestimonialsTab() {
  const { data: testimonials, isLoading } = useTestimonials();
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();
  const { uploadLogo: uploadAvatar, uploading } = usePartnerLogoUpload();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    customer_name: '',
    customer_role: '',
    customer_avatar: '',
    content: '',
    rating: 5,
    is_active: true,
    display_order: 0
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let avatarUrl = form.customer_avatar;

      // Si un fichier est sélectionné, l'uploader d'abord
      if (selectedFile) {
        const uploadedUrl = await uploadAvatar(selectedFile);
        if (!uploadedUrl) {
          toast.error('Erreur lors de l\'upload de l\'avatar');
          return;
        }
        avatarUrl = uploadedUrl;
      }

      const testimonialData = { ...form, customer_avatar: avatarUrl };

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...testimonialData });
        toast.success('Témoignage mis à jour');
      } else {
        await createMutation.mutateAsync(testimonialData);
        toast.success('Témoignage créé');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item);
    setForm({
      customer_name: item.customer_name,
      customer_role: item.customer_role || '',
      customer_avatar: item.customer_avatar || '',
      content: item.content,
      rating: item.rating,
      is_active: item.is_active,
      display_order: item.display_order
    });
    setAvatarPreview(item.customer_avatar || null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce témoignage ?')) {
      await deleteMutation.mutateAsync(id);
      toast.success('Témoignage supprimé');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setForm({
      customer_name: '',
      customer_role: '',
      customer_avatar: '',
      content: '',
      rating: 5,
      is_active: true,
      display_order: 0
    });
    setAvatarPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Témoignages clients</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus size={16} className="mr-2" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Modifier' : 'Ajouter'} un témoignage</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nom du client</Label>
                <Input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} required />
              </div>
              <div>
                <Label>Rôle/Profession</Label>
                <Input value={form.customer_role} onChange={e => setForm(f => ({ ...f, customer_role: e.target.value }))} />
              </div>
              
              {/* Zone d'upload de l'avatar */}
              <div>
                <Label>Avatar (optionnel)</Label>
                <div className="mt-2">
                  {avatarPreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={avatarPreview} 
                        alt="Aperçu de l'avatar" 
                        className="h-16 w-16 object-cover rounded-full border"
                      />
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="mt-1 text-sm text-muted-foreground">
                        Cliquez pour ajouter un avatar
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="mt-4">
                <RichTextEditor
                  label="Témoignage"
                  value={form.content}
                  onChange={val => setForm(f => ({ ...f, content: val }))}
                  rows={4}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Note (1-5)</Label>
                  <Input type="number" min={1} max={5} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: parseInt(e.target.value) }))} />
                </div>
                <div className="flex-1">
                  <Label>Ordre</Label>
                  <Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) }))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={checked => setForm(f => ({ ...f, is_active: checked }))} />
                <Label>Actif</Label>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? 'Upload en cours...' : 'Sauvegarder'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {testimonials?.map(item => (
          <Card key={item.id}>
            <CardContent className="p-4 flex justify-between items-start">
              <div className="flex-1 flex gap-3">
                {item.customer_avatar && (
                  <img src={item.customer_avatar} alt={item.customer_name} className="h-10 w-10 rounded-full object-cover" />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{item.customer_name}</span>
                    {item.customer_role && <span className="text-sm text-muted-foreground">• {item.customer_role}</span>}
                    <span className={`px-2 py-0.5 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2 [&_p]:my-0" dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(item.content) }} />
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 size={16} className="text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FEATURES TAB
// ============================================================================

function FeaturesTab() {
  const { data: features, isLoading } = useFeatures();
  const createMutation = useCreateFeature();
  const updateMutation = useUpdateFeature();
  const deleteMutation = useDeleteFeature();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Feature | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    icon: 'star',
    is_active: true,
    display_order: 0
  });

  const iconOptions = ['truck', 'shield', 'refresh-cw', 'headphones', 'star', 'package', 'award', 'heart'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...form });
        toast.success('Avantage mis à jour');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Avantage créé');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (item: Feature) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      icon: item.icon,
      is_active: item.is_active,
      display_order: item.display_order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cet avantage ?')) {
      await deleteMutation.mutateAsync(id);
      toast.success('Avantage supprimé');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setForm({ title: '', description: '', icon: 'star', is_active: true, display_order: 0 });
  };

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Avantages</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus size={16} className="mr-2" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Modifier' : 'Ajouter'} un avantage</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Titre</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="mt-4">
                <RichTextEditor
                  label="Description"
                  value={form.description}
                  onChange={val => setForm(f => ({ ...f, description: val }))}
                  rows={3}
                />
              </div>
              <div>
                <Label>Icône</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${form.icon === icon ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/40'}`}
                    >
                      <LucideIcon name={icon} size={20} className={form.icon === icon ? 'text-primary' : 'text-muted-foreground'} />
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Ordre d'affichage</Label>
                <Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={checked => setForm(f => ({ ...f, is_active: checked }))} />
                <Label>Actif</Label>
              </div>
              <Button type="submit" className="w-full">Sauvegarder</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {features?.map(item => (
          <Card key={item.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LucideIcon name={item.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <div className="text-sm text-muted-foreground line-clamp-2 [&_p]:my-0" dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(item.description || '') }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.is_active ? 'Actif' : 'Inactif'}
                </span>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 size={16} className="text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// STATS TAB
// ============================================================================

function StatsTab() {
  const { data: stats, isLoading } = useStats();
  const createMutation = useCreateStat();
  const updateMutation = useUpdateStat();
  const deleteMutation = useDeleteStat();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Stat | null>(null);
  const [form, setForm] = useState({
    label: '',
    value: '',
    icon: 'trending-up',
    is_active: true,
    display_order: 0
  });

  const iconOptions = ['users', 'package', 'award', 'truck', 'trending-up', 'heart', 'star', 'shopping-bag'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...form });
        toast.success('Statistique mise à jour');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Statistique créée');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (item: Stat) => {
    setEditingItem(item);
    setForm({
      label: item.label,
      value: item.value,
      icon: item.icon,
      is_active: item.is_active,
      display_order: item.display_order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette statistique ?')) {
      await deleteMutation.mutateAsync(id);
      toast.success('Statistique supprimée');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setForm({ label: '', value: '', icon: 'trending-up', is_active: true, display_order: 0 });
  };

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Statistiques</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus size={16} className="mr-2" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Modifier' : 'Ajouter'} une statistique</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Label</Label>
                <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required placeholder="Ex: Clients Satisfaits" />
              </div>
              <div>
                <Label>Valeur</Label>
                <Input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required placeholder="Ex: 10K+" />
              </div>
              <div>
                <Label>Icône</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${form.icon === icon ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/40'}`}
                    >
                      <LucideIcon name={icon} size={20} className={form.icon === icon ? 'text-primary' : 'text-muted-foreground'} />
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Ordre d'affichage</Label>
                <Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={checked => setForm(f => ({ ...f, is_active: checked }))} />
                <Label>Actif</Label>
              </div>
              <Button type="submit" className="w-full">Sauvegarder</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats?.map(item => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl font-bold text-primary">{item.value}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 size={14} className="text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <span className={`mt-2 inline-block px-2 py-0.5 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {item.is_active ? 'Actif' : 'Inactif'}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// PARTNERS TAB
// ============================================================================

function PartnersTab() {
  const { data: partners, isLoading } = usePartners();
  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();
  const deleteMutation = useDeletePartner();
  const { uploadLogo, uploading } = usePartnerLogoUpload();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partner | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    is_active: true,
    display_order: 0
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let logoUrl = form.logo_url;

      // Si un fichier est sélectionné, l'uploader d'abord
      if (selectedFile) {
        const uploadedUrl = await uploadLogo(selectedFile);
        if (!uploadedUrl) {
          toast.error('Erreur lors de l\'upload du logo');
          return;
        }
        logoUrl = uploadedUrl;
      }

      if (!logoUrl) {
        toast.error('Veuillez ajouter un logo');
        return;
      }

      const partnerData = { ...form, logo_url: logoUrl };

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...partnerData });
        toast.success('Partenaire mis à jour');
      } else {
        await createMutation.mutateAsync(partnerData);
        toast.success('Partenaire créé');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (item: Partner) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      logo_url: item.logo_url,
      website_url: item.website_url || '',
      is_active: item.is_active,
      display_order: item.display_order
    });
    setLogoPreview(item.logo_url);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce partenaire ?')) {
      await deleteMutation.mutateAsync(id);
      toast.success('Partenaire supprimé');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setForm({ name: '', logo_url: '', website_url: '', is_active: true, display_order: 0 });
    setLogoPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Partenaires</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus size={16} className="mr-2" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Modifier' : 'Ajouter'} un partenaire</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              
              {/* Zone d'upload du logo */}
              <div>
                <Label>Logo</Label>
                <div className="mt-2">
                  {logoPreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={logoPreview} 
                        alt="Aperçu du logo" 
                        className="h-20 w-auto object-contain border rounded-lg p-2 bg-muted"
                      />
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Cliquez pour sélectionner un logo
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        PNG, JPG, SVG, WEBP
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <Label>Site web (optionnel)</Label>
                <Input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <Label>Ordre d'affichage</Label>
                <Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={checked => setForm(f => ({ ...f, is_active: checked }))} />
                <Label>Actif</Label>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? 'Upload en cours...' : 'Sauvegarder'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {partners?.map(item => (
          <Card key={item.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src={item.logo_url} alt={item.name} className="h-10 w-auto object-contain" />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  {item.website_url && <p className="text-sm text-muted-foreground">{item.website_url}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.is_active ? 'Actif' : 'Inactif'}
                </span>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 size={16} className="text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COLLECTIONS TAB
// ============================================================================

function CollectionsTab() {
  const { data: categories, isLoading } = useAllCategories();
  const toggleCollections = useToggleCategoryCollections();
  const updateMedia = useUpdateCategoryMedia();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaForm, setMediaForm] = useState({ image_url: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parentCategories = categories?.filter(c => !c.parent_id && c.is_approved) || [];

  const handleToggle = async (id: string, show_in_collections: boolean) => {
    try {
      await toggleCollections.mutateAsync({ id, show_in_collections });
      toast.success(show_in_collections ? 'Catégorie ajoutée aux collections' : 'Catégorie retirée des collections');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleEditMedia = (cat: any) => {
    setEditingId(cat.id);
    setMediaForm({ image_url: cat.image_url || '', description: cat.description || '' });
  };

  const handleSaveMedia = async () => {
    if (!editingId) return;
    try {
      await updateMedia.mutateAsync({ id: editingId, ...mediaForm });
      toast.success('Image et description mises à jour');
      setEditingId(null);
    } catch {
      toast.error('Erreur');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;
    
    const { supabase } = await import('@/integrations/supabase/client');
    const ext = file.name.split('.').pop();
    const path = `categories/${editingId}.${ext}`;
    
    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(path, file, { upsert: true });
    
    if (uploadError) {
      toast.error('Erreur upload');
      return;
    }
    
    const { data: publicUrl } = supabase.storage.from('site-assets').getPublicUrl(path);
    setMediaForm(f => ({ ...f, image_url: publicUrl.publicUrl }));
  };

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Collections de la page d'accueil</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionnez les catégories à afficher dans la section "Nos Collections". Ajoutez une image et une description pour chacune.
        </p>
      </div>

      <div className="grid gap-4">
        {parentCategories.map(cat => (
          <Card key={cat.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {cat.image_url && (
                    <img src={cat.image_url} alt={cat.name} className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}
                    {!cat.image_url && (
                      <p className="text-xs text-amber-600">Aucune image configurée</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => handleEditMedia(cat)}>
                    <Image size={16} />
                  </Button>
                  <Switch
                    checked={cat.show_in_collections || false}
                    onCheckedChange={(checked) => handleToggle(cat.id, checked)}
                  />
                </div>
              </div>

              {editingId === cat.id && (
                <div className="mt-4 p-4 border border-border rounded-lg space-y-3">
                  <div>
                    <Label>Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={mediaForm.image_url}
                        onChange={e => setMediaForm(f => ({ ...f, image_url: e.target.value }))}
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={14} className="mr-1" /> Upload
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </div>
                    {mediaForm.image_url && (
                      <img src={mediaForm.image_url} alt="Aperçu" className="mt-2 h-24 rounded-lg object-cover" />
                    )}
                  </div>
                  <div>
                    <Label>Description courte</Label>
                    <Input
                      value={mediaForm.description}
                      onChange={e => setMediaForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Ex: Élégance féminine"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Annuler</Button>
                    <Button size="sm" onClick={handleSaveMedia}>Sauvegarder</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminHomeSections() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sections de la page d'accueil</h1>
          <p className="text-muted-foreground">Gérez les différentes sections de votre page d'accueil</p>
        </div>

        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Star size={16} /> Avantages
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 size={16} /> Stats
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <MessageSquare size={16} /> Avis
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Building size={16} /> Partenaires
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <Grid size={16} /> Collections
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="mt-6">
            <FeaturesTab />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <StatsTab />
          </TabsContent>
          
          <TabsContent value="testimonials" className="mt-6">
            <TestimonialsTab />
          </TabsContent>
          
          <TabsContent value="partners" className="mt-6">
            <PartnersTab />
          </TabsContent>

          <TabsContent value="collections" className="mt-6">
            <CollectionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
